const std = @import("std");
const c = @import("../spin.zig").c;
const auth = @import("../util/auth.zig");

/// Call Claude API with system prompt and messages JSON array.
/// Returns raw response body or null on failure.
pub fn chat(system_prompt: []const u8, messages_json: []const u8) ?[]const u8 {
    const api_key = auth.getVariable("anthropic_api_key") orelse return null;
    if (api_key.len == 0) return null;

    // Build request body: {"model":"...","max_tokens":4096,"system":"...","messages":[...]}
    var body_buf: [65536]u8 = undefined;
    var pos: usize = 0;

    const prefix = "{\"model\":\"claude-sonnet-4-20250514\",\"max_tokens\":4096,\"system\":\"";
    @memcpy(body_buf[pos .. pos + prefix.len], prefix);
    pos += prefix.len;

    // Escape system prompt
    for (system_prompt) |ch| {
        if (pos >= body_buf.len - 256) break;
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

    const mid = "\",\"messages\":";
    @memcpy(body_buf[pos .. pos + mid.len], mid);
    pos += mid.len;

    // Messages JSON as-is
    if (pos + messages_json.len < body_buf.len - 2) {
        @memcpy(body_buf[pos .. pos + messages_json.len], messages_json);
        pos += messages_json.len;
    }

    body_buf[pos] = '}';
    pos += 1;

    const body = body_buf[0..pos];

    return doPost(api_key, body);
}

/// Extract text content from Claude API response
pub fn extractText(resp: []const u8) ?[]const u8 {
    // Find "type":"text" or "type": "text"
    const marker = std.mem.indexOf(u8, resp, "\"type\":\"text\"") orelse
        std.mem.indexOf(u8, resp, "\"type\": \"text\"") orelse return null;
    const after = resp[marker + 12 ..]; // skip past "type":"text"

    // Find "text":"
    const text_needle = "\"text\":\"";
    const text_alt = "\"text\": \"";
    var val_start: usize = 0;
    if (std.mem.indexOf(u8, after, text_needle)) |idx| {
        val_start = idx + text_needle.len;
    } else if (std.mem.indexOf(u8, after, text_alt)) |idx| {
        val_start = idx + text_alt.len;
    } else return null;

    // Extract until unescaped "
    var i = val_start;
    while (i < after.len) : (i += 1) {
        if (after[i] == '"' and (i == val_start or after[i - 1] != '\\')) {
            return after[val_start..i];
        }
    }
    return null;
}

fn doPost(api_key: []const u8, body: []const u8) ?[]const u8 {
    const headers = c.wasi_http_0_2_0_types_constructor_fields();
    addHeader(headers, "content-type", "application/json");
    addHeader(headers, "anthropic-version", "2023-06-01");

    var auth_buf: [256]u8 = undefined;
    const auth_val = std.fmt.bufPrint(&auth_buf, "{s}", .{api_key}) catch return null;
    addHeader(headers, "x-api-key", auth_val);

    const req = c.wasi_http_0_2_0_types_constructor_outgoing_request(headers);
    const req_borrow = c.wasi_http_0_2_0_types_borrow_outgoing_request(req);

    var method = c.wasi_http_0_2_0_types_method_t{ .tag = c.WASI_HTTP_0_2_0_TYPES_METHOD_POST };
    _ = c.wasi_http_0_2_0_types_method_outgoing_request_set_method(req_borrow, &method);

    var scheme = c.wasi_http_0_2_0_types_scheme_t{ .tag = c.WASI_HTTP_0_2_0_TYPES_SCHEME_HTTPS };
    _ = c.wasi_http_0_2_0_types_method_outgoing_request_set_scheme(req_borrow, &scheme);

    var authority = c.http_trigger_string_t{ .ptr = @constCast("api.anthropic.com"), .len = 17 };
    _ = c.wasi_http_0_2_0_types_method_outgoing_request_set_authority(req_borrow, &authority);

    var path_str = c.http_trigger_string_t{ .ptr = @constCast("/v1/messages"), .len = 12 };
    _ = c.wasi_http_0_2_0_types_method_outgoing_request_set_path_with_query(req_borrow, &path_str);

    // Write body in 4096-byte chunks (WASI blocking_write_and_flush limit)
    var out_body: c.wasi_http_0_2_0_types_own_outgoing_body_t = undefined;
    if (!c.wasi_http_0_2_0_types_method_outgoing_request_body(req_borrow, &out_body)) return null;

    var stream: c.wasi_io_0_2_0_streams_own_output_stream_t = undefined;
    if (c.wasi_http_0_2_0_types_method_outgoing_body_write(
        c.wasi_http_0_2_0_types_borrow_outgoing_body(out_body),
        &stream,
    )) {
        const stream_borrow = c.wasi_io_0_2_0_streams_borrow_output_stream(stream);
        var offset: usize = 0;
        while (offset < body.len) {
            // check-write tells us how many bytes can be written without blocking
            var avail: u64 = 0;
            var cw_err: c.wasi_io_0_2_0_streams_stream_error_t = undefined;
            if (!c.wasi_io_0_2_0_streams_method_output_stream_check_write(stream_borrow, &avail, &cw_err) or avail == 0) {
                // Wait until space is available
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
    }

    var finish_err: c.wasi_http_0_2_0_types_error_code_t = undefined;
    _ = c.wasi_http_0_2_0_types_static_outgoing_body_finish(out_body, null, &finish_err);

    // Send with 30s timeout (LLM can be slow)
    const opts = c.wasi_http_0_2_0_types_constructor_request_options();
    const opts_borrow = c.wasi_http_0_2_0_types_borrow_request_options(opts);
    var timeout: u64 = 30_000_000_000;
    _ = c.wasi_http_0_2_0_types_method_request_options_set_connect_timeout(opts_borrow, &timeout);
    _ = c.wasi_http_0_2_0_types_method_request_options_set_first_byte_timeout(opts_borrow, &timeout);

    var opts_val = opts;
    var future: c.wasi_http_0_2_0_types_own_future_incoming_response_t = undefined;
    var send_err: c.wasi_http_0_2_0_outgoing_handler_error_code_t = undefined;
    if (!c.wasi_http_0_2_0_outgoing_handler_handle(req, &opts_val, &future, &send_err)) return null;

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
        return null;
    }

    c.wasi_http_0_2_0_types_future_incoming_response_drop_own(future);
    if (resp_result.is_err) return null;
    const inner = resp_result.val.ok;
    if (inner.is_err) return null;

    const response = inner.val.ok;
    const resp_borrow = c.wasi_http_0_2_0_types_borrow_incoming_response(response);

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

    var data: c.http_trigger_list_u8_t = .{ .ptr = undefined, .len = 0 };
    var read_err: c.wasi_io_0_2_0_streams_stream_error_t = undefined;
    const ok = c.wasi_io_0_2_0_streams_method_input_stream_blocking_read(
        c.wasi_io_0_2_0_streams_borrow_input_stream(resp_stream),
        65536,
        &data,
        &read_err,
    );

    c.wasi_io_0_2_0_streams_input_stream_drop_own(resp_stream);
    c.wasi_http_0_2_0_types_incoming_body_drop_own(resp_body_handle);
    c.wasi_http_0_2_0_types_incoming_response_drop_own(response);

    if (ok and data.len > 0) return data.ptr[0..data.len];
    return null;
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
