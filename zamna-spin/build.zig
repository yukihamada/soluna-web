const std = @import("std");

pub fn build(b: *std.Build) void {
    const optimize = b.standardOptimizeOption(.{});

    const target = b.resolveTargetQuery(.{
        .cpu_arch = .wasm32,
        .os_tag = .wasi,
    });

    // Create the root module with Zig source + C bindings
    const module = b.createModule(.{
        .root_source_file = b.path("src/main.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
    });

    // Add the generated C binding source
    module.addCSourceFile(.{
        .file = b.path("bindings/http_trigger.c"),
        .flags = &.{
            "-Ibindings",
            "-fno-sanitize=undefined",
        },
    });

    // Add include path for C headers
    module.addIncludePath(b.path("bindings"));

    // Add the component type object file
    module.addObjectFile(b.path("bindings/http_trigger_component_type.o"));

    // Build as executable (reactor)
    const exe = b.addExecutable(.{
        .name = "zamna-api",
        .root_module = module,
    });

    // Export the handler and cabi_realloc functions
    exe.rdynamic = true;
    exe.entry = .disabled;

    b.installArtifact(exe);

    // Post-build step: convert core module to component
    const component_step = b.addSystemCommand(&.{
        "wasm-tools",
        "component",
        "new",
    });
    component_step.addArtifactArg(exe);
    component_step.addArgs(&.{
        "--adapt",
        "wasi_snapshot_preview1.reactor.wasm",
        "-o",
        "main.wasm",
    });

    const component = b.step("component", "Build WASM component");
    component.dependOn(&component_step.step);

    // Default step builds both core module and component
    b.default_step.dependOn(&component_step.step);
}
