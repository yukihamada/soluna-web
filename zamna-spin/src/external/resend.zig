const std = @import("std");
const c = @import("../spin.zig").c;
const auth = @import("../util/auth.zig");

/// Send an email via Resend API
pub fn sendEmail(to: []const u8, subject: []const u8, html: []const u8) bool {
    const api_key = auth.getVariable("resend_api_key") orelse return false;
    if (api_key.len == 0) return false;

    // Build JSON body
    var body_buf: [65536]u8 = undefined;
    const body = std.fmt.bufPrint(&body_buf,
        \\{{"from":"ZAMNA HAWAII <noreply@solun.art>","to":["{s}"],"subject":"{s}","html":"{s}"}}
    , .{ to, subject, escapeJson(html) }) catch return false;
    _ = body;

    // For Resend, we need to make an outbound HTTP request
    return doPost("api.resend.com", "/emails", api_key, html, to, subject);
}

fn doPost(host: []const u8, path: []const u8, api_key: []const u8, html: []const u8, to: []const u8, subject: []const u8) bool {
    // Build JSON body
    var body_buf: [65536]u8 = undefined;
    var pos: usize = 0;

    const parts = [_][]const u8{
        "{\"from\":\"ZAMNA HAWAII <noreply@solun.art>\",\"to\":[\"",
        to,
        "\"],\"subject\":\"",
        subject,
        "\",\"html\":\"",
    };
    for (parts) |part| {
        @memcpy(body_buf[pos .. pos + part.len], part);
        pos += part.len;
    }
    // Escape HTML for JSON
    for (html) |ch| {
        switch (ch) {
            '"' => {
                body_buf[pos] = '\\';
                pos += 1;
                body_buf[pos] = '"';
                pos += 1;
            },
            '\\' => {
                body_buf[pos] = '\\';
                pos += 1;
                body_buf[pos] = '\\';
                pos += 1;
            },
            '\n' => {
                body_buf[pos] = '\\';
                pos += 1;
                body_buf[pos] = 'n';
                pos += 1;
            },
            '\r' => {
                body_buf[pos] = '\\';
                pos += 1;
                body_buf[pos] = 'r';
                pos += 1;
            },
            else => {
                body_buf[pos] = ch;
                pos += 1;
            },
        }
        if (pos >= body_buf.len - 10) break;
    }
    @memcpy(body_buf[pos .. pos + 2], "\"}");
    pos += 2;

    const body = body_buf[0..pos];

    // Create outgoing request headers
    const headers = c.wasi_http_0_2_0_types_constructor_fields();
    addHeader(headers, "content-type", "application/json");

    // Authorization: Bearer <key>
    var auth_buf: [256]u8 = undefined;
    const auth_val = std.fmt.bufPrint(&auth_buf, "Bearer {s}", .{api_key}) catch return false;
    addHeader(headers, "authorization", auth_val);

    // Create outgoing request
    const req = c.wasi_http_0_2_0_types_constructor_outgoing_request(headers);
    const req_borrow = c.wasi_http_0_2_0_types_borrow_outgoing_request(req);

    // Set method to POST
    var method = c.wasi_http_0_2_0_types_method_t{ .tag = c.WASI_HTTP_0_2_0_TYPES_METHOD_POST };
    _ = c.wasi_http_0_2_0_types_method_outgoing_request_set_method(req_borrow, &method);

    // Set scheme to HTTPS
    var scheme = c.wasi_http_0_2_0_types_scheme_t{ .tag = c.WASI_HTTP_0_2_0_TYPES_SCHEME_HTTPS };
    _ = c.wasi_http_0_2_0_types_method_outgoing_request_set_scheme(req_borrow, &scheme);

    // Set authority (host)
    var authority = c.http_trigger_string_t{ .ptr = @constCast(host.ptr), .len = host.len };
    _ = c.wasi_http_0_2_0_types_method_outgoing_request_set_authority(req_borrow, &authority);

    // Set path
    var path_str = c.http_trigger_string_t{ .ptr = @constCast(path.ptr), .len = path.len };
    _ = c.wasi_http_0_2_0_types_method_outgoing_request_set_path_with_query(req_borrow, &path_str);

    // Write body
    var out_body: c.wasi_http_0_2_0_types_own_outgoing_body_t = undefined;
    if (!c.wasi_http_0_2_0_types_method_outgoing_request_body(req_borrow, &out_body)) return false;

    var stream: c.wasi_io_0_2_0_streams_own_output_stream_t = undefined;
    if (!c.wasi_http_0_2_0_types_method_outgoing_body_write(
        c.wasi_http_0_2_0_types_borrow_outgoing_body(out_body),
        &stream,
    )) return false;

    var write_err: c.wasi_io_0_2_0_streams_stream_error_t = undefined;
    var body_list = c.http_trigger_list_u8_t{ .ptr = @constCast(body.ptr), .len = body.len };
    _ = c.wasi_io_0_2_0_streams_method_output_stream_blocking_write_and_flush(
        c.wasi_io_0_2_0_streams_borrow_output_stream(stream),
        &body_list,
        &write_err,
    );
    c.wasi_io_0_2_0_streams_output_stream_drop_own(stream);

    var finish_err: c.wasi_http_0_2_0_types_error_code_t = undefined;
    _ = c.wasi_http_0_2_0_types_static_outgoing_body_finish(out_body, null, &finish_err);

    // Send the request with 10s timeout
    const opts = c.wasi_http_0_2_0_types_constructor_request_options();
    const opts_borrow = c.wasi_http_0_2_0_types_borrow_request_options(opts);
    var timeout: u64 = 10_000_000_000; // 10 seconds in nanoseconds
    _ = c.wasi_http_0_2_0_types_method_request_options_set_connect_timeout(opts_borrow, &timeout);
    _ = c.wasi_http_0_2_0_types_method_request_options_set_first_byte_timeout(opts_borrow, &timeout);

    var opts_val = opts;
    var future: c.wasi_http_0_2_0_types_own_future_incoming_response_t = undefined;
    var send_err: c.wasi_http_0_2_0_outgoing_handler_error_code_t = undefined;
    if (!c.wasi_http_0_2_0_outgoing_handler_handle(req, &opts_val, &future, &send_err)) return false;

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
        return false;
    }

    c.wasi_http_0_2_0_types_future_incoming_response_drop_own(future);

    return !resp_result.is_err;
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

/// Send admin notification email
pub fn sendAdminEmail(subject: []const u8, html: []const u8) void {
    const admin_email = auth.getVariable("admin_email") orelse "info@solun.art";
    _ = sendEmail(admin_email, subject, html);
}

fn escapeJson(s: []const u8) []const u8 {
    // This is a no-op placeholder; actual escaping is done inline in doPost
    return s;
}
