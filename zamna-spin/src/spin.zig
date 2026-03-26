// Central C import — all modules should use @import("spin.zig") to get the C types.
// Usage: const c = @import("../spin.zig").c; (or just @import("spin.zig") from main)
pub const c = @cImport({
    @cInclude("http_trigger.h");
});
