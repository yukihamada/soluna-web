const c = @import("../spin.zig").c;
const http = @import("http.zig");

/// Check if the request has a valid admin key header.
/// Returns true if authorized, false otherwise.
pub fn isAdmin(req: http.Request) bool {
    const key = req.getHeader("x-admin-key") orelse return false;
    const admin_key = getVariable("admin_key") orelse return false;
    return std.mem.eql(u8, key, admin_key);
}

/// Get a Spin variable by name
pub fn getVariable(name: []const u8) ?[]const u8 {
    var name_str = c.http_trigger_string_t{ .ptr = @constCast(name.ptr), .len = name.len };
    var ret: c.http_trigger_string_t = undefined;
    var err: c.fermyon_spin_2_0_0_variables_error_t = undefined;
    if (c.fermyon_spin_2_0_0_variables_get(&name_str, &ret, &err)) {
        return ret.ptr[0..ret.len];
    }
    return null;
}

const std = @import("std");
