const std = @import("std");
const c = @import("../spin.zig").c;
const auth = @import("../util/auth.zig");

/// Send a text message via WhatsApp Cloud API
pub fn sendMessage(to: []const u8, text: []const u8) bool {
    const token = auth.getVariable("whatsapp_token") orelse return false;
    const phone_id = auth.getVariable("whatsapp_phone_id") orelse return false;
    if (token.len == 0 or phone_id.len == 0) return false;

    // Build JSON body
    var body_buf: [8192]u8 = undefined;
    var pos: usize = 0;

    const prefix = "{\"messaging_product\":\"whatsapp\",\"to\":\"";
    @memcpy(body_buf[pos .. pos + prefix.len], prefix);
    pos += prefix.len;

    @memcpy(body_buf[pos .. pos + to.len], to);
    pos += to.len;

    const mid = "\",\"type\":\"text\",\"text\":{\"body\":\"";
    @memcpy(body_buf[pos .. pos + mid.len], mid);
    pos += mid.len;

    // Escape text for JSON
    for (text) |ch| {
        if (pos >= body_buf.len - 10) break;
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
    }

    const suffix = "\"}}";
    @memcpy(body_buf[pos .. pos + suffix.len], suffix);
    pos += suffix.len;

    const body = body_buf[0..pos];

    // Build path: /v21.0/{phone_id}/messages
    var path_buf: [128]u8 = undefined;
    const path = std.fmt.bufPrint(&path_buf, "/v21.0/{s}/messages", .{phone_id}) catch return false;

    return doPost(token, path, body);
}

/// Reply in a group context (same as sendMessage but to the group sender)
pub fn replyInGroup(to: []const u8, text: []const u8) bool {
    return sendMessage(to, text);
}

fn doPost(token: []const u8, path: []const u8, body: []const u8) bool {
    const headers = c.wasi_http_0_2_0_types_constructor_fields();
    addHeader(headers, "content-type", "application/json");

    var auth_buf: [512]u8 = undefined;
    const auth_val = std.fmt.bufPrint(&auth_buf, "Bearer {s}", .{token}) catch return false;
    addHeader(headers, "authorization", auth_val);

    const req = c.wasi_http_0_2_0_types_constructor_outgoing_request(headers);
    const req_borrow = c.wasi_http_0_2_0_types_borrow_outgoing_request(req);

    var method = c.wasi_http_0_2_0_types_method_t{ .tag = c.WASI_HTTP_0_2_0_TYPES_METHOD_POST };
    _ = c.wasi_http_0_2_0_types_method_outgoing_request_set_method(req_borrow, &method);

    var scheme = c.wasi_http_0_2_0_types_scheme_t{ .tag = c.WASI_HTTP_0_2_0_TYPES_SCHEME_HTTPS };
    _ = c.wasi_http_0_2_0_types_method_outgoing_request_set_scheme(req_borrow, &scheme);

    var authority = c.http_trigger_string_t{ .ptr = @constCast("graph.facebook.com"), .len = 18 };
    _ = c.wasi_http_0_2_0_types_method_outgoing_request_set_authority(req_borrow, &authority);

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

    const stream_borrow = c.wasi_io_0_2_0_streams_borrow_output_stream(stream);
    var offset: usize = 0;
    while (offset < body.len) {
        var avail: u64 = 0;
        var cw_err: c.wasi_io_0_2_0_streams_stream_error_t = undefined;
        if (!c.wasi_io_0_2_0_streams_method_output_stream_check_write(stream_borrow, &avail, &cw_err) or avail == 0) {
            const sub = c.wasi_io_0_2_0_streams_method_output_stream_subscribe(stream_borrow);
            c.wasi_io_0_2_0_poll_method_pollable_block(c.wasi_io_0_2_0_poll_borrow_pollable(sub));
            c.wasi_io_0_2_0_poll_pollable_drop_own(sub);
            continue;
        }
        const can_write = if (avail > 4096) @as(usize, 4096) else @as(usize, @truncate(avail));
        const end = if (offset + can_write < body.len) offset + can_write else body.len;
        var write_err: c.wasi_io_0_2_0_streams_stream_error_t = undefined;
        var chunk_list = c.http_trigger_list_u8_t{ .ptr = @constCast(body.ptr + offset), .len = end - offset };
        _ = c.wasi_io_0_2_0_streams_method_output_stream_write(stream_borrow, &chunk_list, &write_err);
        offset = end;
    }
    var flush_err: c.wasi_io_0_2_0_streams_stream_error_t = undefined;
    _ = c.wasi_io_0_2_0_streams_method_output_stream_blocking_flush(stream_borrow, &flush_err);
    c.wasi_io_0_2_0_streams_output_stream_drop_own(stream);

    var finish_err: c.wasi_http_0_2_0_types_error_code_t = undefined;
    _ = c.wasi_http_0_2_0_types_static_outgoing_body_finish(out_body, null, &finish_err);

    // Send with 10s timeout
    const opts = c.wasi_http_0_2_0_types_constructor_request_options();
    const opts_borrow = c.wasi_http_0_2_0_types_borrow_request_options(opts);
    var timeout: u64 = 10_000_000_000;
    _ = c.wasi_http_0_2_0_types_method_request_options_set_connect_timeout(opts_borrow, &timeout);
    _ = c.wasi_http_0_2_0_types_method_request_options_set_first_byte_timeout(opts_borrow, &timeout);

    var opts_val = opts;
    var future: c.wasi_http_0_2_0_types_own_future_incoming_response_t = undefined;
    var send_err: c.wasi_http_0_2_0_outgoing_handler_error_code_t = undefined;
    if (!c.wasi_http_0_2_0_outgoing_handler_handle(req, &opts_val, &future, &send_err)) return false;

    // Wait for response
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

fn addHeader(headers_handle: c.wasi_http_0_2_0_types_own_fields_t, name: []const u8, value: []const u8) void {
    var key = c.wasi_http_0_2_0_types_field_key_t{ .ptr = @constCast(name.ptr), .len = name.len };
    var val = c.wasi_http_0_2_0_types_field_value_t{ .ptr = @constCast(value.ptr), .len = value.len };
    var err: c.wasi_http_0_2_0_types_header_error_t = undefined;
    _ = c.wasi_http_0_2_0_types_method_fields_append(
        c.wasi_http_0_2_0_types_borrow_fields(headers_handle),
        &key,
        &val,
        &err,
    );
}
