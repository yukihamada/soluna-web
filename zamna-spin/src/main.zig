const c = @import("spin.zig").c;
const http = @import("util/http.zig");
const router = @import("router.zig");

// WASI reactor: libc requires main for linking
pub fn main() void {}

// ─── HTTP Handler (exported to Spin runtime) ────────────────────────────────
export fn exports_wasi_http_0_2_0_incoming_handler_handle(
    raw_request: c.exports_wasi_http_0_2_0_incoming_handler_own_incoming_request_t,
    response_out: c.exports_wasi_http_0_2_0_incoming_handler_own_response_outparam_t,
) void {
    const req = http.Request.init(raw_request);
    router.route(req, response_out);
}
