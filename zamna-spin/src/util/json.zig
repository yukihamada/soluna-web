const std = @import("std");

pub const Value = union(enum) {
    string: []const u8,
    integer: i64,
    float: f64,
    boolean: bool,
    null_val: void,
};

/// Simple JSON object builder using a fixed buffer
pub const Builder = struct {
    buf: []u8,
    pos: usize = 0,
    first: bool = true,

    pub fn init(buf: []u8) Builder {
        var b = Builder{ .buf = buf };
        b.putChar('{');
        return b;
    }

    pub fn field(self: *Builder, name: []const u8, value: Value) void {
        if (!self.first) self.putChar(',');
        self.first = false;
        self.putChar('"');
        self.putStr(name);
        self.putStr("\":");
        switch (value) {
            .string => |s| {
                self.putChar('"');
                self.putJsonStr(s);
                self.putChar('"');
            },
            .integer => |i| {
                var tmp: [20]u8 = undefined;
                const s = std.fmt.bufPrint(&tmp, "{d}", .{i}) catch "0";
                self.putStr(s);
            },
            .float => |f| {
                var tmp: [32]u8 = undefined;
                const s = std.fmt.bufPrint(&tmp, "{d}", .{f}) catch "0";
                self.putStr(s);
            },
            .boolean => |v| self.putStr(if (v) "true" else "false"),
            .null_val => self.putStr("null"),
        }
    }

    pub fn fieldBool(self: *Builder, name: []const u8, value: bool) void {
        self.field(name, .{ .boolean = value });
    }

    pub fn fieldStr(self: *Builder, name: []const u8, value: ?[]const u8) void {
        if (value) |v| {
            self.field(name, .{ .string = v });
        } else {
            self.field(name, .null_val);
        }
    }

    pub fn fieldInt(self: *Builder, name: []const u8, value: i64) void {
        self.field(name, .{ .integer = value });
    }

    pub fn finish(self: *Builder) []const u8 {
        self.putChar('}');
        return self.buf[0..self.pos];
    }

    fn putChar(self: *Builder, ch: u8) void {
        if (self.pos < self.buf.len) {
            self.buf[self.pos] = ch;
            self.pos += 1;
        }
    }

    fn putStr(self: *Builder, s: []const u8) void {
        for (s) |ch| self.putChar(ch);
    }

    fn putJsonStr(self: *Builder, s: []const u8) void {
        for (s) |ch| {
            switch (ch) {
                '"' => {
                    self.putChar('\\');
                    self.putChar('"');
                },
                '\\' => {
                    self.putChar('\\');
                    self.putChar('\\');
                },
                '\n' => {
                    self.putChar('\\');
                    self.putChar('n');
                },
                '\r' => {
                    self.putChar('\\');
                    self.putChar('r');
                },
                '\t' => {
                    self.putChar('\\');
                    self.putChar('t');
                },
                else => self.putChar(ch),
            }
        }
    }
};

/// Simple JSON array builder
pub const ArrayBuilder = struct {
    buf: []u8,
    pos: usize = 0,
    first: bool = true,

    pub fn init(buf: []u8) ArrayBuilder {
        var b = ArrayBuilder{ .buf = buf };
        b.putChar('[');
        return b;
    }

    pub fn addRaw(self: *ArrayBuilder, json: []const u8) void {
        if (!self.first) self.putChar(',');
        self.first = false;
        self.putStr(json);
    }

    pub fn finish(self: *ArrayBuilder) []const u8 {
        self.putChar(']');
        return self.buf[0..self.pos];
    }

    fn putChar(self: *ArrayBuilder, ch: u8) void {
        if (self.pos < self.buf.len) {
            self.buf[self.pos] = ch;
            self.pos += 1;
        }
    }

    fn putStr(self: *ArrayBuilder, s: []const u8) void {
        for (s) |ch| self.putChar(ch);
    }
};

/// Parse a JSON string field from body. Returns the value or null.
pub fn getStr(body: []const u8, key: []const u8) ?[]const u8 {
    // Simple parser: find "key":" and extract until next unescaped "
    var search_buf: [68]u8 = undefined;
    const needle = std.fmt.bufPrint(&search_buf, "\"{s}\":\"", .{key}) catch return null;

    const start = std.mem.indexOf(u8, body, needle) orelse {
        // Try with space: "key": "
        const needle2 = std.fmt.bufPrint(&search_buf, "\"{s}\": \"", .{key}) catch return null;
        const start2 = std.mem.indexOf(u8, body, needle2) orelse return null;
        const val_start = start2 + needle2.len;
        return extractJsonString(body, val_start);
    };

    const val_start = start + needle.len;
    return extractJsonString(body, val_start);
}

fn extractJsonString(body: []const u8, start: usize) ?[]const u8 {
    var i = start;
    while (i < body.len) : (i += 1) {
        if (body[i] == '"' and (i == start or body[i - 1] != '\\')) {
            return body[start..i];
        }
    }
    return null;
}

/// Parse a JSON number field from body
pub fn getInt(body: []const u8, key: []const u8) ?i64 {
    var search_buf: [68]u8 = undefined;
    const needle = std.fmt.bufPrint(&search_buf, "\"{s}\":", .{key}) catch return null;

    const start = std.mem.indexOf(u8, body, needle) orelse return null;
    var i = start + needle.len;

    // Skip whitespace
    while (i < body.len and body[i] == ' ') : (i += 1) {}

    // Parse number
    var end = i;
    if (end < body.len and body[end] == '-') end += 1;
    while (end < body.len and body[end] >= '0' and body[end] <= '9') : (end += 1) {}

    if (end == i) return null;
    return std.fmt.parseInt(i64, body[i..end], 10) catch null;
}

/// Parse a JSON array field (returns raw JSON)
pub fn getArr(body: []const u8, key: []const u8) ?[]const u8 {
    var search_buf: [68]u8 = undefined;
    const needle = std.fmt.bufPrint(&search_buf, "\"{s}\":", .{key}) catch return null;
    const start = std.mem.indexOf(u8, body, needle) orelse return null;
    var i = start + needle.len;
    while (i < body.len and body[i] == ' ') : (i += 1) {}
    if (i >= body.len or body[i] != '[') return null;

    var depth: usize = 0;
    var j = i;
    var in_str = false;
    while (j < body.len) : (j += 1) {
        if (body[j] == '"' and (j == 0 or body[j - 1] != '\\')) in_str = !in_str;
        if (in_str) continue;
        if (body[j] == '[') depth += 1;
        if (body[j] == ']') {
            depth -= 1;
            if (depth == 0) return body[i .. j + 1];
        }
    }
    return null;
}

/// Parse a JSON object field (returns raw JSON)
pub fn getObj(body: []const u8, key: []const u8) ?[]const u8 {
    var search_buf: [68]u8 = undefined;
    const needle = std.fmt.bufPrint(&search_buf, "\"{s}\":", .{key}) catch return null;
    const start = std.mem.indexOf(u8, body, needle) orelse return null;
    var i = start + needle.len;
    while (i < body.len and body[i] == ' ') : (i += 1) {}
    if (i >= body.len or body[i] != '{') return null;

    var depth: usize = 0;
    var j = i;
    while (j < body.len) : (j += 1) {
        if (body[j] == '{') depth += 1;
        if (body[j] == '}') {
            depth -= 1;
            if (depth == 0) return body[i .. j + 1];
        }
    }
    return null;
}
