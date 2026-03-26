const std = @import("std");
const c = @import("../spin.zig").c;

pub const Method = enum {
    GET,
    POST,
    PUT,
    DELETE,
    HEAD,
    OPTIONS,
    PATCH,
    OTHER,
};

pub const Request = struct {
    raw: c.exports_wasi_http_0_2_0_incoming_handler_own_incoming_request_t,
    method: Method,
    path: []const u8,
    query: ?[]const u8,

    pub fn init(raw: c.exports_wasi_http_0_2_0_incoming_handler_own_incoming_request_t) Request {
        const borrow = c.wasi_http_0_2_0_types_borrow_incoming_request(raw);

        // Get method
        var method_val: c.wasi_http_0_2_0_types_method_t = undefined;
        c.wasi_http_0_2_0_types_method_incoming_request_method(borrow, &method_val);

        const method: Method = switch (method_val.tag) {
            c.WASI_HTTP_0_2_0_TYPES_METHOD_GET => .GET,
            c.WASI_HTTP_0_2_0_TYPES_METHOD_POST => .POST,
            c.WASI_HTTP_0_2_0_TYPES_METHOD_PUT => .PUT,
            c.WASI_HTTP_0_2_0_TYPES_METHOD_DELETE => .DELETE,
            c.WASI_HTTP_0_2_0_TYPES_METHOD_HEAD => .HEAD,
            c.WASI_HTTP_0_2_0_TYPES_METHOD_OPTIONS => .OPTIONS,
            c.WASI_HTTP_0_2_0_TYPES_METHOD_PATCH => .PATCH,
            else => .OTHER,
        };

        // Get path + query
        var path_str: c.http_trigger_string_t = undefined;
        const has_path = c.wasi_http_0_2_0_types_method_incoming_request_path_with_query(borrow, &path_str);
        const full_path: []const u8 = if (has_path) path_str.ptr[0..path_str.len] else "/";

        // Split path and query
        var path: []const u8 = full_path;
        var query: ?[]const u8 = null;
        if (std.mem.indexOf(u8, full_path, "?")) |qi| {
            path = full_path[0..qi];
            query = full_path[qi + 1 ..];
        }

        return .{ .raw = raw, .method = method, .path = path, .query = query };
    }

    pub fn getHeader(self: Request, name: []const u8) ?[]const u8 {
        const borrow = c.wasi_http_0_2_0_types_borrow_incoming_request(self.raw);
        const headers = c.wasi_http_0_2_0_types_method_incoming_request_headers(borrow);
        defer c.wasi_http_0_2_0_types_fields_drop_own(headers);

        var key = c.wasi_http_0_2_0_types_field_key_t{
            .ptr = @constCast(name.ptr),
            .len = name.len,
        };
        var values: c.http_trigger_list_field_value_t = undefined;
        c.wasi_http_0_2_0_types_method_fields_get(
            c.wasi_http_0_2_0_types_borrow_fields(headers),
            &key,
            &values,
        );

        if (values.len > 0) {
            const first = values.ptr[0];
            return first.ptr[0..first.len];
        }
        return null;
    }

    pub fn readBody(self: Request) ?[]const u8 {
        const borrow = c.wasi_http_0_2_0_types_borrow_incoming_request(self.raw);
        var body_handle: c.wasi_http_0_2_0_types_own_incoming_body_t = undefined;
        if (!c.wasi_http_0_2_0_types_method_incoming_request_consume(borrow, &body_handle)) return null;

        var stream: c.wasi_io_0_2_0_streams_own_input_stream_t = undefined;
        if (!c.wasi_http_0_2_0_types_method_incoming_body_stream(
            c.wasi_http_0_2_0_types_borrow_incoming_body(body_handle),
            &stream,
        )) return null;

        // Read up to 1MB
        var data: c.http_trigger_list_u8_t = .{ .ptr = undefined, .len = 0 };
        var err: c.wasi_io_0_2_0_streams_stream_error_t = undefined;
        const ok = c.wasi_io_0_2_0_streams_method_input_stream_blocking_read(
            c.wasi_io_0_2_0_streams_borrow_input_stream(stream),
            1048576,
            &data,
            &err,
        );

        c.wasi_io_0_2_0_streams_input_stream_drop_own(stream);
        c.wasi_http_0_2_0_types_incoming_body_drop_own(body_handle);

        if (ok and data.len > 0) return data.ptr[0..data.len];
        return null;
    }
};

pub fn sendResponse(
    response_out: c.exports_wasi_http_0_2_0_incoming_handler_own_response_outparam_t,
    status: u16,
    content_type: []const u8,
    body: []const u8,
) void {
    const headers = c.wasi_http_0_2_0_types_constructor_fields();

    // Content-Type
    addHeader(headers, "content-type", content_type);

    // CORS
    addHeader(headers, "access-control-allow-origin", "*");
    addHeader(headers, "access-control-allow-headers", "content-type, x-admin-key");

    const out_resp = c.wasi_http_0_2_0_types_constructor_outgoing_response(headers);
    _ = c.wasi_http_0_2_0_types_method_outgoing_response_set_status_code(
        c.wasi_http_0_2_0_types_borrow_outgoing_response(out_resp),
        status,
    );

    var body_handle: c.wasi_http_0_2_0_types_own_outgoing_body_t = undefined;
    _ = c.wasi_http_0_2_0_types_method_outgoing_response_body(
        c.wasi_http_0_2_0_types_borrow_outgoing_response(out_resp),
        &body_handle,
    );

    var stream: c.wasi_io_0_2_0_streams_own_output_stream_t = undefined;
    _ = c.wasi_http_0_2_0_types_method_outgoing_body_write(
        c.wasi_http_0_2_0_types_borrow_outgoing_body(body_handle),
        &stream,
    );

    var write_err: c.wasi_io_0_2_0_streams_stream_error_t = undefined;
    var body_list = c.http_trigger_list_u8_t{ .ptr = @constCast(body.ptr), .len = body.len };
    _ = c.wasi_io_0_2_0_streams_method_output_stream_blocking_write_and_flush(
        c.wasi_io_0_2_0_streams_borrow_output_stream(stream),
        &body_list,
        &write_err,
    );

    c.wasi_io_0_2_0_streams_output_stream_drop_own(stream);
    var finish_err: c.wasi_http_0_2_0_types_error_code_t = undefined;
    _ = c.wasi_http_0_2_0_types_static_outgoing_body_finish(body_handle, null, &finish_err);

    var resp_result: c.wasi_http_0_2_0_types_result_own_outgoing_response_error_code_t = undefined;
    resp_result.is_err = false;
    resp_result.val.ok = out_resp;
    c.wasi_http_0_2_0_types_static_response_outparam_set(response_out, &resp_result);
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

pub fn jsonOk(
    response_out: c.exports_wasi_http_0_2_0_incoming_handler_own_response_outparam_t,
    body: []const u8,
) void {
    sendResponse(response_out, 200, "application/json", body);
}

pub fn jsonError(
    response_out: c.exports_wasi_http_0_2_0_incoming_handler_own_response_outparam_t,
    status: u16,
    message: []const u8,
) void {
    var buf: [512]u8 = undefined;
    const body = std.fmt.bufPrint(&buf, "{{\"error\":\"{s}\"}}", .{message}) catch "{\"error\":\"error\"}";
    sendResponse(response_out, status, "application/json", body);
}

pub fn redirect(
    response_out: c.exports_wasi_http_0_2_0_incoming_handler_own_response_outparam_t,
    url: []const u8,
) void {
    const headers = c.wasi_http_0_2_0_types_constructor_fields();
    addHeader(headers, "location", url);
    addHeader(headers, "content-type", "text/plain");

    const out_resp = c.wasi_http_0_2_0_types_constructor_outgoing_response(headers);
    _ = c.wasi_http_0_2_0_types_method_outgoing_response_set_status_code(
        c.wasi_http_0_2_0_types_borrow_outgoing_response(out_resp),
        302,
    );

    var body_handle: c.wasi_http_0_2_0_types_own_outgoing_body_t = undefined;
    _ = c.wasi_http_0_2_0_types_method_outgoing_response_body(
        c.wasi_http_0_2_0_types_borrow_outgoing_response(out_resp),
        &body_handle,
    );

    var finish_err: c.wasi_http_0_2_0_types_error_code_t = undefined;
    _ = c.wasi_http_0_2_0_types_static_outgoing_body_finish(body_handle, null, &finish_err);

    var resp_result: c.wasi_http_0_2_0_types_result_own_outgoing_response_error_code_t = undefined;
    resp_result.is_err = false;
    resp_result.val.ok = out_resp;
    c.wasi_http_0_2_0_types_static_response_outparam_set(response_out, &resp_result);
}
