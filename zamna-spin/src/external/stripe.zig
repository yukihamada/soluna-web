const std = @import("std");
const c = @import("../spin.zig").c;
const auth = @import("../util/auth.zig");
const json = @import("../util/json.zig");

pub const CheckoutResult = struct {
    url: ?[]const u8 = null,
    session_id: ?[]const u8 = null,
    ok: bool = false,
};

pub const VerifyResult = struct {
    paid: bool = false,
    amount: ?i64 = null,
    currency: ?[]const u8 = null,
};

/// Create a Stripe checkout session via raw HTTP
pub fn createCheckoutSession(
    amount_cents: u64,
    product_name: []const u8,
    payment_methods: []const u8,
    success_url: []const u8,
    cancel_url: []const u8,
    metadata_json: []const u8,
) CheckoutResult {
    const secret = auth.getVariable("stripe_secret_key") orelse return .{};
    if (secret.len == 0) return .{};

    // Build form-urlencoded body
    var body_buf: [4096]u8 = undefined;
    const body = std.fmt.bufPrint(&body_buf,
        "mode=payment&line_items[0][price_data][currency]=usd&line_items[0][price_data][product_data][name]={s}&line_items[0][price_data][unit_amount]={d}&line_items[0][quantity]=1&payment_method_types[]={s}&success_url={s}&cancel_url={s}&{s}",
        .{ product_name, amount_cents, payment_methods, success_url, cancel_url, metadata_json },
    ) catch return .{};

    const resp_body = stripePost("/v1/checkout/sessions", secret, body) orelse return .{};

    // Parse URL from response
    const url = json.getStr(resp_body, "url");
    const id = json.getStr(resp_body, "id");

    return .{ .url = url, .session_id = id, .ok = url != null };
}

/// Retrieve a checkout session
pub fn retrieveSession(session_id: []const u8) VerifyResult {
    const secret = auth.getVariable("stripe_secret_key") orelse return .{};
    if (secret.len == 0) return .{};

    var path_buf: [256]u8 = undefined;
    const path = std.fmt.bufPrint(&path_buf, "/v1/checkout/sessions/{s}", .{session_id}) catch return .{};

    const resp_body = stripeGet(path, secret) orelse return .{};

    const payment_status = json.getStr(resp_body, "payment_status");
    const paid = if (payment_status) |ps| std.mem.eql(u8, ps, "paid") else false;
    const amount = json.getInt(resp_body, "amount_total");
    const currency = json.getStr(resp_body, "currency");

    return .{ .paid = paid, .amount = amount, .currency = currency };
}

fn stripePost(path: []const u8, secret: []const u8, body: []const u8) ?[]const u8 {
    return stripeRequest(c.WASI_HTTP_0_2_0_TYPES_METHOD_POST, path, secret, body);
}

fn stripeGet(path: []const u8, secret: []const u8) ?[]const u8 {
    return stripeRequest(c.WASI_HTTP_0_2_0_TYPES_METHOD_GET, path, secret, null);
}

fn stripeRequest(method_tag: u8, path: []const u8, secret: []const u8, body: ?[]const u8) ?[]const u8 {
    const headers = c.wasi_http_0_2_0_types_constructor_fields();

    // Basic auth: base64(secret + ":")
    var auth_buf: [512]u8 = undefined;
    var key_buf: [256]u8 = undefined;
    @memcpy(key_buf[0..secret.len], secret);
    key_buf[secret.len] = ':';
    const key_with_colon = key_buf[0 .. secret.len + 1];

    // Simple base64 encode
    const b64 = base64Encode(key_with_colon, &auth_buf) orelse return null;
    var full_auth_buf: [600]u8 = undefined;
    const auth_val = std.fmt.bufPrint(&full_auth_buf, "Basic {s}", .{b64}) catch return null;
    addHeader(headers, "authorization", auth_val);

    if (body != null) {
        addHeader(headers, "content-type", "application/x-www-form-urlencoded");
    }

    const req = c.wasi_http_0_2_0_types_constructor_outgoing_request(headers);
    const req_borrow = c.wasi_http_0_2_0_types_borrow_outgoing_request(req);

    var method_val = c.wasi_http_0_2_0_types_method_t{ .tag = method_tag };
    _ = c.wasi_http_0_2_0_types_method_outgoing_request_set_method(req_borrow, &method_val);

    var scheme = c.wasi_http_0_2_0_types_scheme_t{ .tag = c.WASI_HTTP_0_2_0_TYPES_SCHEME_HTTPS };
    _ = c.wasi_http_0_2_0_types_method_outgoing_request_set_scheme(req_borrow, &scheme);

    var authority = c.http_trigger_string_t{ .ptr = @constCast("api.stripe.com"), .len = 14 };
    _ = c.wasi_http_0_2_0_types_method_outgoing_request_set_authority(req_borrow, &authority);

    var path_str = c.http_trigger_string_t{ .ptr = @constCast(path.ptr), .len = path.len };
    _ = c.wasi_http_0_2_0_types_method_outgoing_request_set_path_with_query(req_borrow, &path_str);

    // Write body if present
    var out_body: c.wasi_http_0_2_0_types_own_outgoing_body_t = undefined;
    if (!c.wasi_http_0_2_0_types_method_outgoing_request_body(req_borrow, &out_body)) return null;

    if (body) |b| {
        var stream: c.wasi_io_0_2_0_streams_own_output_stream_t = undefined;
        if (c.wasi_http_0_2_0_types_method_outgoing_body_write(
            c.wasi_http_0_2_0_types_borrow_outgoing_body(out_body),
            &stream,
        )) {
            var write_err: c.wasi_io_0_2_0_streams_stream_error_t = undefined;
            var body_list = c.http_trigger_list_u8_t{ .ptr = @constCast(b.ptr), .len = b.len };
            _ = c.wasi_io_0_2_0_streams_method_output_stream_blocking_write_and_flush(
                c.wasi_io_0_2_0_streams_borrow_output_stream(stream),
                &body_list,
                &write_err,
            );
            c.wasi_io_0_2_0_streams_output_stream_drop_own(stream);
        }
    }

    var finish_err: c.wasi_http_0_2_0_types_error_code_t = undefined;
    _ = c.wasi_http_0_2_0_types_static_outgoing_body_finish(out_body, null, &finish_err);

    // Send with 15s timeout
    const opts = c.wasi_http_0_2_0_types_constructor_request_options();
    const opts_borrow = c.wasi_http_0_2_0_types_borrow_request_options(opts);
    var timeout: u64 = 15_000_000_000; // 15 seconds in nanoseconds
    _ = c.wasi_http_0_2_0_types_method_request_options_set_connect_timeout(opts_borrow, &timeout);
    _ = c.wasi_http_0_2_0_types_method_request_options_set_first_byte_timeout(opts_borrow, &timeout);

    var opts_val = opts;
    var future: c.wasi_http_0_2_0_types_own_future_incoming_response_t = undefined;
    var send_err: c.wasi_http_0_2_0_outgoing_handler_error_code_t = undefined;
    if (!c.wasi_http_0_2_0_outgoing_handler_handle(req, &opts_val, &future, &send_err)) return null;

    // Wait for response using subscribe + block (proper async)
    const pollable = c.wasi_http_0_2_0_types_method_future_incoming_response_subscribe(
        c.wasi_http_0_2_0_types_borrow_future_incoming_response(future),
    );
    c.wasi_io_0_2_0_poll_method_pollable_block(c.wasi_io_0_2_0_poll_borrow_pollable(pollable));
    c.wasi_io_0_2_0_poll_pollable_drop_own(pollable);

    var resp_result: c.wasi_http_0_2_0_types_result_result_own_incoming_response_error_code_void_t = undefined;
    if (!c.wasi_http_0_2_0_types_method_future_incoming_response_get(
        c.wasi_http_0_2_0_types_borrow_future_incoming_response(future),
        &resp_result,
    )) {
        c.wasi_http_0_2_0_types_future_incoming_response_drop_own(future);
        return null;
    }

    c.wasi_http_0_2_0_types_future_incoming_response_drop_own(future);

    if (resp_result.is_err) return null;
    const inner = resp_result.val.ok;
    if (inner.is_err) return null;

    const response = inner.val.ok;
    const resp_borrow = c.wasi_http_0_2_0_types_borrow_incoming_response(response);

    // Read response body
    var resp_body_handle: c.wasi_http_0_2_0_types_own_incoming_body_t = undefined;
    if (!c.wasi_http_0_2_0_types_method_incoming_response_consume(resp_borrow, &resp_body_handle)) {
        c.wasi_http_0_2_0_types_incoming_response_drop_own(response);
        return null;
    }

    var resp_stream: c.wasi_io_0_2_0_streams_own_input_stream_t = undefined;
    if (!c.wasi_http_0_2_0_types_method_incoming_body_stream(
        c.wasi_http_0_2_0_types_borrow_incoming_body(resp_body_handle),
        &resp_stream,
    )) {
        c.wasi_http_0_2_0_types_incoming_body_drop_own(resp_body_handle);
        c.wasi_http_0_2_0_types_incoming_response_drop_own(response);
        return null;
    }

    var data: c.http_trigger_list_u8_t = undefined;
    var read_err: c.wasi_io_0_2_0_streams_stream_error_t = undefined;
    _ = c.wasi_io_0_2_0_streams_method_input_stream_blocking_read(
        c.wasi_io_0_2_0_streams_borrow_input_stream(resp_stream),
        65536,
        &data,
        &read_err,
    );

    c.wasi_io_0_2_0_streams_input_stream_drop_own(resp_stream);
    c.wasi_http_0_2_0_types_incoming_body_drop_own(resp_body_handle);
    c.wasi_http_0_2_0_types_incoming_response_drop_own(response);

    if (data.len > 0) return data.ptr[0..data.len];
    return null;
}

fn addHeader(headers: c.wasi_http_0_2_0_types_own_fields_t, name: []const u8, value: []const u8) void {
    var key = c.wasi_http_0_2_0_types_field_key_t{ .ptr = @constCast(name.ptr), .len = name.len };
    var val = c.wasi_http_0_2_0_types_field_value_t{ .ptr = @constCast(value.ptr), .len = value.len };
    var err: c.wasi_http_0_2_0_types_header_error_t = undefined;
    _ = c.wasi_http_0_2_0_types_method_fields_append(
        c.wasi_http_0_2_0_types_borrow_fields(headers),
        &key,
        &val,
        &err,
    );
}

fn base64Encode(input: []const u8, output: []u8) ?[]const u8 {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var pos: usize = 0;
    var i: usize = 0;

    while (i + 3 <= input.len) : (i += 3) {
        if (pos + 4 > output.len) return null;
        const b0 = input[i];
        const b1 = input[i + 1];
        const b2 = input[i + 2];
        output[pos] = alphabet[b0 >> 2];
        output[pos + 1] = alphabet[((b0 & 0x03) << 4) | (b1 >> 4)];
        output[pos + 2] = alphabet[((b1 & 0x0f) << 2) | (b2 >> 6)];
        output[pos + 3] = alphabet[b2 & 0x3f];
        pos += 4;
    }

    const remaining = input.len - i;
    if (remaining == 1) {
        if (pos + 4 > output.len) return null;
        output[pos] = alphabet[input[i] >> 2];
        output[pos + 1] = alphabet[(input[i] & 0x03) << 4];
        output[pos + 2] = '=';
        output[pos + 3] = '=';
        pos += 4;
    } else if (remaining == 2) {
        if (pos + 4 > output.len) return null;
        output[pos] = alphabet[input[i] >> 2];
        output[pos + 1] = alphabet[((input[i] & 0x03) << 4) | (input[i + 1] >> 4)];
        output[pos + 2] = alphabet[(input[i + 1] & 0x0f) << 2];
        output[pos + 3] = '=';
        pos += 4;
    }

    return output[0..pos];
}
