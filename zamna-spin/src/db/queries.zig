const std = @import("std");
const c = @import("../spin.zig").c;
const schema = @import("schema.zig");

pub const Db = struct {
    conn: c.fermyon_spin_2_0_0_sqlite_own_connection_t,

    pub fn open() !Db {
        var conn: c.fermyon_spin_2_0_0_sqlite_own_connection_t = undefined;
        var err: c.fermyon_spin_2_0_0_sqlite_error_t = undefined;
        var name = c.http_trigger_string_t{ .ptr = @constCast("default"), .len = 7 };
        if (!c.fermyon_spin_2_0_0_sqlite_static_connection_open(&name, &conn, &err)) {
            return error.DbOpenFailed;
        }
        return .{ .conn = conn };
    }

    pub fn close(self: *Db) void {
        c.fermyon_spin_2_0_0_sqlite_connection_drop_own(self.conn);
    }

    pub fn initSchema(self: *Db) !void {
        for (schema.SCHEMA) |sql| {
            _ = try self.exec(sql, &.{});
        }
        // Seed NFT passes if empty
        const count_result = try self.exec("SELECT COUNT(*) as c FROM nft_passes", &.{});
        if (count_result.rows.len > 0 and count_result.rows.ptr[0].values.len > 0) {
            const val = count_result.rows.ptr[0].values.ptr[0];
            if (val.tag == c.FERMYON_SPIN_2_0_0_SQLITE_VALUE_INTEGER and val.val.integer == 0) {
                for (schema.NFT_SEEDS) |seed| {
                    var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{
                        textVal(seed[0]),
                        textVal(seed[1]),
                        textVal(seed[2]),
                        textVal(seed[3]),
                    };
                    _ = try self.execParams(
                        "INSERT INTO nft_passes (pass_type, name, description, image_url) VALUES (?, ?, ?, ?)",
                        &params,
                    );
                }
            }
        }
    }

    pub fn exec(self: *Db, sql: []const u8, params: []const c.fermyon_spin_2_0_0_sqlite_value_t) !c.fermyon_spin_2_0_0_sqlite_query_result_t {
        var stmt = c.http_trigger_string_t{ .ptr = @constCast(sql.ptr), .len = sql.len };
        var empty: c.fermyon_spin_2_0_0_sqlite_value_t = undefined;
        var param_list = c.fermyon_spin_2_0_0_sqlite_list_value_t{
            .ptr = if (params.len > 0) @constCast(params.ptr) else &empty,
            .len = params.len,
        };
        var result: c.fermyon_spin_2_0_0_sqlite_query_result_t = undefined;
        var err: c.fermyon_spin_2_0_0_sqlite_error_t = undefined;
        if (!c.fermyon_spin_2_0_0_sqlite_method_connection_execute(
            c.fermyon_spin_2_0_0_sqlite_borrow_connection(self.conn),
            &stmt,
            &param_list,
            &result,
            &err,
        )) {
            return error.DbExecFailed;
        }
        return result;
    }

    pub fn execParams(self: *Db, sql: []const u8, params: []c.fermyon_spin_2_0_0_sqlite_value_t) !c.fermyon_spin_2_0_0_sqlite_query_result_t {
        var stmt = c.http_trigger_string_t{ .ptr = @constCast(sql.ptr), .len = sql.len };
        var param_list = c.fermyon_spin_2_0_0_sqlite_list_value_t{
            .ptr = params.ptr,
            .len = params.len,
        };
        var result: c.fermyon_spin_2_0_0_sqlite_query_result_t = undefined;
        var err: c.fermyon_spin_2_0_0_sqlite_error_t = undefined;
        if (!c.fermyon_spin_2_0_0_sqlite_method_connection_execute(
            c.fermyon_spin_2_0_0_sqlite_borrow_connection(self.conn),
            &stmt,
            &param_list,
            &result,
            &err,
        )) {
            return error.DbExecFailed;
        }
        return result;
    }

    pub fn lastInsertRowid(self: *Db) i64 {
        const result = self.exec("SELECT last_insert_rowid()", &.{}) catch return 0;
        if (result.rows.len > 0 and result.rows.ptr[0].values.len > 0) {
            const v = result.rows.ptr[0].values.ptr[0];
            if (v.tag == c.FERMYON_SPIN_2_0_0_SQLITE_VALUE_INTEGER) return v.val.integer;
        }
        return 0;
    }

    pub fn changes(self: *Db) i64 {
        const result = self.exec("SELECT changes()", &.{}) catch return 0;
        if (result.rows.len > 0 and result.rows.ptr[0].values.len > 0) {
            const v = result.rows.ptr[0].values.ptr[0];
            if (v.tag == c.FERMYON_SPIN_2_0_0_SQLITE_VALUE_INTEGER) return v.val.integer;
        }
        return 0;
    }
};

// Value tag constants from C bindings
pub const VALUE_INTEGER = c.FERMYON_SPIN_2_0_0_SQLITE_VALUE_INTEGER;
pub const VALUE_REAL = c.FERMYON_SPIN_2_0_0_SQLITE_VALUE_REAL;
pub const VALUE_TEXT = c.FERMYON_SPIN_2_0_0_SQLITE_VALUE_TEXT;
pub const VALUE_BLOB = c.FERMYON_SPIN_2_0_0_SQLITE_VALUE_BLOB;
pub const VALUE_NULL = c.FERMYON_SPIN_2_0_0_SQLITE_VALUE_NULL;

pub fn textVal(s: []const u8) c.fermyon_spin_2_0_0_sqlite_value_t {
    var v: c.fermyon_spin_2_0_0_sqlite_value_t = undefined;
    v.tag = VALUE_TEXT;
    v.val = .{ .text = .{ .ptr = @constCast(s.ptr), .len = s.len } };
    return v;
}

pub fn intVal(i: i64) c.fermyon_spin_2_0_0_sqlite_value_t {
    var v: c.fermyon_spin_2_0_0_sqlite_value_t = undefined;
    v.tag = VALUE_INTEGER;
    v.val = .{ .integer = i };
    return v;
}

pub fn nullVal() c.fermyon_spin_2_0_0_sqlite_value_t {
    var v: c.fermyon_spin_2_0_0_sqlite_value_t = undefined;
    v.tag = VALUE_NULL;
    return v;
}

/// Extract text value from a result row column
pub fn getText(row: c.fermyon_spin_2_0_0_sqlite_row_result_t, col: usize) ?[]const u8 {
    if (col >= row.values.len) return null;
    const v = row.values.ptr[col];
    if (v.tag == VALUE_TEXT) {
        return v.val.text.ptr[0..v.val.text.len];
    }
    return null;
}

/// Extract integer value from a result row column
pub fn getInteger(row: c.fermyon_spin_2_0_0_sqlite_row_result_t, col: usize) ?i64 {
    if (col >= row.values.len) return null;
    const v = row.values.ptr[col];
    if (v.tag == VALUE_INTEGER) return v.val.integer;
    return null;
}

/// Serialize query result rows to a JSON array
pub fn rowsToJsonArray(buf: []u8, result: c.fermyon_spin_2_0_0_sqlite_query_result_t) []const u8 {
    const json = @import("../util/json.zig");
    var arr = json.ArrayBuilder.init(buf);

    const cols = result.columns;
    const rows = result.rows;

    for (0..rows.len) |ri| {
        const row = rows.ptr[ri];
        var obj_buf: [4096]u8 = undefined;
        var obj = json.Builder.init(&obj_buf);

        for (0..cols.len) |ci| {
            const col_name = cols.ptr[ci].ptr[0..cols.ptr[ci].len];
            if (ci < row.values.len) {
                const v = row.values.ptr[ci];
                switch (v.tag) {
                    VALUE_TEXT => obj.fieldStr(col_name, v.val.text.ptr[0..v.val.text.len]),
                    VALUE_INTEGER => obj.fieldInt(col_name, v.val.integer),
                    VALUE_NULL => obj.fieldStr(col_name, null),
                    else => obj.fieldStr(col_name, null),
                }
            }
        }
        arr.addRaw(obj.finish());
    }

    return arr.finish();
}
