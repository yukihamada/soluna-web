pub const __builtin_bswap16 = @import("std").zig.c_builtins.__builtin_bswap16;
pub const __builtin_bswap32 = @import("std").zig.c_builtins.__builtin_bswap32;
pub const __builtin_bswap64 = @import("std").zig.c_builtins.__builtin_bswap64;
pub const __builtin_signbit = @import("std").zig.c_builtins.__builtin_signbit;
pub const __builtin_signbitf = @import("std").zig.c_builtins.__builtin_signbitf;
pub const __builtin_popcount = @import("std").zig.c_builtins.__builtin_popcount;
pub const __builtin_ctz = @import("std").zig.c_builtins.__builtin_ctz;
pub const __builtin_clz = @import("std").zig.c_builtins.__builtin_clz;
pub const __builtin_sqrt = @import("std").zig.c_builtins.__builtin_sqrt;
pub const __builtin_sqrtf = @import("std").zig.c_builtins.__builtin_sqrtf;
pub const __builtin_sin = @import("std").zig.c_builtins.__builtin_sin;
pub const __builtin_sinf = @import("std").zig.c_builtins.__builtin_sinf;
pub const __builtin_cos = @import("std").zig.c_builtins.__builtin_cos;
pub const __builtin_cosf = @import("std").zig.c_builtins.__builtin_cosf;
pub const __builtin_exp = @import("std").zig.c_builtins.__builtin_exp;
pub const __builtin_expf = @import("std").zig.c_builtins.__builtin_expf;
pub const __builtin_exp2 = @import("std").zig.c_builtins.__builtin_exp2;
pub const __builtin_exp2f = @import("std").zig.c_builtins.__builtin_exp2f;
pub const __builtin_log = @import("std").zig.c_builtins.__builtin_log;
pub const __builtin_logf = @import("std").zig.c_builtins.__builtin_logf;
pub const __builtin_log2 = @import("std").zig.c_builtins.__builtin_log2;
pub const __builtin_log2f = @import("std").zig.c_builtins.__builtin_log2f;
pub const __builtin_log10 = @import("std").zig.c_builtins.__builtin_log10;
pub const __builtin_log10f = @import("std").zig.c_builtins.__builtin_log10f;
pub const __builtin_abs = @import("std").zig.c_builtins.__builtin_abs;
pub const __builtin_labs = @import("std").zig.c_builtins.__builtin_labs;
pub const __builtin_llabs = @import("std").zig.c_builtins.__builtin_llabs;
pub const __builtin_fabs = @import("std").zig.c_builtins.__builtin_fabs;
pub const __builtin_fabsf = @import("std").zig.c_builtins.__builtin_fabsf;
pub const __builtin_floor = @import("std").zig.c_builtins.__builtin_floor;
pub const __builtin_floorf = @import("std").zig.c_builtins.__builtin_floorf;
pub const __builtin_ceil = @import("std").zig.c_builtins.__builtin_ceil;
pub const __builtin_ceilf = @import("std").zig.c_builtins.__builtin_ceilf;
pub const __builtin_trunc = @import("std").zig.c_builtins.__builtin_trunc;
pub const __builtin_truncf = @import("std").zig.c_builtins.__builtin_truncf;
pub const __builtin_round = @import("std").zig.c_builtins.__builtin_round;
pub const __builtin_roundf = @import("std").zig.c_builtins.__builtin_roundf;
pub const __builtin_strlen = @import("std").zig.c_builtins.__builtin_strlen;
pub const __builtin_strcmp = @import("std").zig.c_builtins.__builtin_strcmp;
pub const __builtin_object_size = @import("std").zig.c_builtins.__builtin_object_size;
pub const __builtin___memset_chk = @import("std").zig.c_builtins.__builtin___memset_chk;
pub const __builtin_memset = @import("std").zig.c_builtins.__builtin_memset;
pub const __builtin___memcpy_chk = @import("std").zig.c_builtins.__builtin___memcpy_chk;
pub const __builtin_memcpy = @import("std").zig.c_builtins.__builtin_memcpy;
pub const __builtin_expect = @import("std").zig.c_builtins.__builtin_expect;
pub const __builtin_nanf = @import("std").zig.c_builtins.__builtin_nanf;
pub const __builtin_huge_valf = @import("std").zig.c_builtins.__builtin_huge_valf;
pub const __builtin_inff = @import("std").zig.c_builtins.__builtin_inff;
pub const __builtin_isnan = @import("std").zig.c_builtins.__builtin_isnan;
pub const __builtin_isinf = @import("std").zig.c_builtins.__builtin_isinf;
pub const __builtin_isinf_sign = @import("std").zig.c_builtins.__builtin_isinf_sign;
pub const __has_builtin = @import("std").zig.c_builtins.__has_builtin;
pub const __builtin_assume = @import("std").zig.c_builtins.__builtin_assume;
pub const __builtin_unreachable = @import("std").zig.c_builtins.__builtin_unreachable;
pub const __builtin_constant_p = @import("std").zig.c_builtins.__builtin_constant_p;
pub const __builtin_mul_overflow = @import("std").zig.c_builtins.__builtin_mul_overflow;
pub const intmax_t = c_longlong;
pub const uintmax_t = c_ulonglong;
pub const time_t = c_longlong;
pub const suseconds_t = c_longlong;
pub const struct_timeval = extern struct {
    tv_sec: time_t = @import("std").mem.zeroes(time_t),
    tv_usec: suseconds_t = @import("std").mem.zeroes(suseconds_t),
};
pub const struct_timespec = extern struct {
    tv_sec: time_t = @import("std").mem.zeroes(time_t),
    tv_nsec: c_long = @import("std").mem.zeroes(c_long),
};
pub const struct_iovec = extern struct {
    iov_base: ?*anyopaque = @import("std").mem.zeroes(?*anyopaque),
    iov_len: usize = @import("std").mem.zeroes(usize),
};
pub const int_fast8_t = i8;
pub const int_fast64_t = i64;
pub const int_least8_t = i8;
pub const int_least16_t = i16;
pub const int_least32_t = i32;
pub const int_least64_t = i64;
pub const uint_fast8_t = u8;
pub const uint_fast64_t = u64;
pub const uint_least8_t = u8;
pub const uint_least16_t = u16;
pub const uint_least32_t = u32;
pub const uint_least64_t = u64;
pub const int_fast16_t = i16;
pub const int_fast32_t = i32;
pub const uint_fast16_t = u16;
pub const uint_fast32_t = u32;
pub const ptrdiff_t = c_long;
pub const wchar_t = c_int;
pub const max_align_t = extern struct {
    __clang_max_align_nonce1: c_longlong align(8) = @import("std").mem.zeroes(c_longlong),
    __clang_max_align_nonce2: c_longdouble align(16) = @import("std").mem.zeroes(c_longdouble),
};
pub const struct_http_trigger_string_t = extern struct {
    ptr: [*c]u8 = @import("std").mem.zeroes([*c]u8),
    len: usize = @import("std").mem.zeroes(usize),
};
pub const http_trigger_string_t = struct_http_trigger_string_t;
pub const struct_wasi_io_0_2_0_poll_own_pollable_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_io_0_2_0_poll_own_pollable_t = struct_wasi_io_0_2_0_poll_own_pollable_t;
pub const struct_wasi_io_0_2_0_poll_borrow_pollable_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_io_0_2_0_poll_borrow_pollable_t = struct_wasi_io_0_2_0_poll_borrow_pollable_t;
pub const wasi_io_0_2_0_poll_list_borrow_pollable_t = extern struct {
    ptr: [*c]wasi_io_0_2_0_poll_borrow_pollable_t = @import("std").mem.zeroes([*c]wasi_io_0_2_0_poll_borrow_pollable_t),
    len: usize = @import("std").mem.zeroes(usize),
};
pub const http_trigger_list_u32_t = extern struct {
    ptr: [*c]u32 = @import("std").mem.zeroes([*c]u32),
    len: usize = @import("std").mem.zeroes(usize),
};
pub const wasi_clocks_0_2_0_monotonic_clock_instant_t = u64;
pub const wasi_clocks_0_2_0_monotonic_clock_duration_t = u64;
pub const wasi_clocks_0_2_0_monotonic_clock_own_pollable_t = wasi_io_0_2_0_poll_own_pollable_t;
pub const struct_wasi_io_0_2_0_error_own_error_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_io_0_2_0_error_own_error_t = struct_wasi_io_0_2_0_error_own_error_t;
pub const struct_wasi_io_0_2_0_error_borrow_error_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_io_0_2_0_error_borrow_error_t = struct_wasi_io_0_2_0_error_borrow_error_t;
pub const wasi_io_0_2_0_streams_own_error_t = wasi_io_0_2_0_error_own_error_t;
const union_unnamed_1 = extern union {
    last_operation_failed: wasi_io_0_2_0_streams_own_error_t,
};
pub const struct_wasi_io_0_2_0_streams_stream_error_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_1 = @import("std").mem.zeroes(union_unnamed_1),
};
pub const wasi_io_0_2_0_streams_stream_error_t = struct_wasi_io_0_2_0_streams_stream_error_t;
pub const struct_wasi_io_0_2_0_streams_own_input_stream_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_io_0_2_0_streams_own_input_stream_t = struct_wasi_io_0_2_0_streams_own_input_stream_t;
pub const struct_wasi_io_0_2_0_streams_borrow_input_stream_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_io_0_2_0_streams_borrow_input_stream_t = struct_wasi_io_0_2_0_streams_borrow_input_stream_t;
pub const struct_wasi_io_0_2_0_streams_own_output_stream_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_io_0_2_0_streams_own_output_stream_t = struct_wasi_io_0_2_0_streams_own_output_stream_t;
pub const struct_wasi_io_0_2_0_streams_borrow_output_stream_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_io_0_2_0_streams_borrow_output_stream_t = struct_wasi_io_0_2_0_streams_borrow_output_stream_t;
pub const http_trigger_list_u8_t = extern struct {
    ptr: [*c]u8 = @import("std").mem.zeroes([*c]u8),
    len: usize = @import("std").mem.zeroes(usize),
};
const union_unnamed_2 = extern union {
    ok: http_trigger_list_u8_t,
    err: wasi_io_0_2_0_streams_stream_error_t,
};
pub const wasi_io_0_2_0_streams_result_list_u8_stream_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_2 = @import("std").mem.zeroes(union_unnamed_2),
};
const union_unnamed_3 = extern union {
    ok: u64,
    err: wasi_io_0_2_0_streams_stream_error_t,
};
pub const wasi_io_0_2_0_streams_result_u64_stream_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_3 = @import("std").mem.zeroes(union_unnamed_3),
};
pub const wasi_io_0_2_0_streams_own_pollable_t = wasi_io_0_2_0_poll_own_pollable_t;
const union_unnamed_4 = extern union {
    err: wasi_io_0_2_0_streams_stream_error_t,
};
pub const wasi_io_0_2_0_streams_result_void_stream_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_4 = @import("std").mem.zeroes(union_unnamed_4),
};
pub const wasi_http_0_2_0_types_duration_t = wasi_clocks_0_2_0_monotonic_clock_duration_t;
const union_unnamed_5 = extern union {
    other: http_trigger_string_t,
};
pub const struct_wasi_http_0_2_0_types_method_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_5 = @import("std").mem.zeroes(union_unnamed_5),
};
pub const wasi_http_0_2_0_types_method_t = struct_wasi_http_0_2_0_types_method_t;
const union_unnamed_6 = extern union {
    other: http_trigger_string_t,
};
pub const struct_wasi_http_0_2_0_types_scheme_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_6 = @import("std").mem.zeroes(union_unnamed_6),
};
pub const wasi_http_0_2_0_types_scheme_t = struct_wasi_http_0_2_0_types_scheme_t;
pub const http_trigger_option_string_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: http_trigger_string_t = @import("std").mem.zeroes(http_trigger_string_t),
};
pub const http_trigger_option_u16_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: u16 = @import("std").mem.zeroes(u16),
};
pub const struct_wasi_http_0_2_0_types_dns_error_payload_t = extern struct {
    rcode: http_trigger_option_string_t = @import("std").mem.zeroes(http_trigger_option_string_t),
    info_code: http_trigger_option_u16_t = @import("std").mem.zeroes(http_trigger_option_u16_t),
};
pub const wasi_http_0_2_0_types_dns_error_payload_t = struct_wasi_http_0_2_0_types_dns_error_payload_t;
pub const http_trigger_option_u8_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: u8 = @import("std").mem.zeroes(u8),
};
pub const struct_wasi_http_0_2_0_types_tls_alert_received_payload_t = extern struct {
    alert_id: http_trigger_option_u8_t = @import("std").mem.zeroes(http_trigger_option_u8_t),
    alert_message: http_trigger_option_string_t = @import("std").mem.zeroes(http_trigger_option_string_t),
};
pub const wasi_http_0_2_0_types_tls_alert_received_payload_t = struct_wasi_http_0_2_0_types_tls_alert_received_payload_t;
pub const http_trigger_option_u32_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: u32 = @import("std").mem.zeroes(u32),
};
pub const struct_wasi_http_0_2_0_types_field_size_payload_t = extern struct {
    field_name: http_trigger_option_string_t = @import("std").mem.zeroes(http_trigger_option_string_t),
    field_size: http_trigger_option_u32_t = @import("std").mem.zeroes(http_trigger_option_u32_t),
};
pub const wasi_http_0_2_0_types_field_size_payload_t = struct_wasi_http_0_2_0_types_field_size_payload_t;
pub const http_trigger_option_u64_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: u64 = @import("std").mem.zeroes(u64),
};
pub const wasi_http_0_2_0_types_option_field_size_payload_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: wasi_http_0_2_0_types_field_size_payload_t = @import("std").mem.zeroes(wasi_http_0_2_0_types_field_size_payload_t),
};
const union_unnamed_7 = extern union {
    dns_error: wasi_http_0_2_0_types_dns_error_payload_t,
    tls_alert_received: wasi_http_0_2_0_types_tls_alert_received_payload_t,
    http_request_body_size: http_trigger_option_u64_t,
    http_request_header_section_size: http_trigger_option_u32_t,
    http_request_header_size: wasi_http_0_2_0_types_option_field_size_payload_t,
    http_request_trailer_section_size: http_trigger_option_u32_t,
    http_request_trailer_size: wasi_http_0_2_0_types_field_size_payload_t,
    http_response_header_section_size: http_trigger_option_u32_t,
    http_response_header_size: wasi_http_0_2_0_types_field_size_payload_t,
    http_response_body_size: http_trigger_option_u64_t,
    http_response_trailer_section_size: http_trigger_option_u32_t,
    http_response_trailer_size: wasi_http_0_2_0_types_field_size_payload_t,
    http_response_transfer_coding: http_trigger_option_string_t,
    http_response_content_coding: http_trigger_option_string_t,
    internal_error: http_trigger_option_string_t,
};
pub const struct_wasi_http_0_2_0_types_error_code_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_7 = @import("std").mem.zeroes(union_unnamed_7),
};
pub const wasi_http_0_2_0_types_error_code_t = struct_wasi_http_0_2_0_types_error_code_t;
pub const struct_wasi_http_0_2_0_types_header_error_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
};
pub const wasi_http_0_2_0_types_header_error_t = struct_wasi_http_0_2_0_types_header_error_t;
pub const wasi_http_0_2_0_types_field_key_t = http_trigger_string_t;
pub const struct_wasi_http_0_2_0_types_field_value_t = extern struct {
    ptr: [*c]u8 = @import("std").mem.zeroes([*c]u8),
    len: usize = @import("std").mem.zeroes(usize),
};
pub const wasi_http_0_2_0_types_field_value_t = struct_wasi_http_0_2_0_types_field_value_t;
pub const struct_wasi_http_0_2_0_types_own_fields_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_own_fields_t = struct_wasi_http_0_2_0_types_own_fields_t;
pub const struct_wasi_http_0_2_0_types_borrow_fields_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_borrow_fields_t = struct_wasi_http_0_2_0_types_borrow_fields_t;
pub const struct_wasi_http_0_2_0_types_own_incoming_request_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_own_incoming_request_t = struct_wasi_http_0_2_0_types_own_incoming_request_t;
pub const struct_wasi_http_0_2_0_types_borrow_incoming_request_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_borrow_incoming_request_t = struct_wasi_http_0_2_0_types_borrow_incoming_request_t;
pub const struct_wasi_http_0_2_0_types_own_outgoing_request_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_own_outgoing_request_t = struct_wasi_http_0_2_0_types_own_outgoing_request_t;
pub const struct_wasi_http_0_2_0_types_borrow_outgoing_request_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_borrow_outgoing_request_t = struct_wasi_http_0_2_0_types_borrow_outgoing_request_t;
pub const struct_wasi_http_0_2_0_types_own_request_options_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_own_request_options_t = struct_wasi_http_0_2_0_types_own_request_options_t;
pub const struct_wasi_http_0_2_0_types_borrow_request_options_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_borrow_request_options_t = struct_wasi_http_0_2_0_types_borrow_request_options_t;
pub const struct_wasi_http_0_2_0_types_own_response_outparam_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_own_response_outparam_t = struct_wasi_http_0_2_0_types_own_response_outparam_t;
pub const struct_wasi_http_0_2_0_types_borrow_response_outparam_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_borrow_response_outparam_t = struct_wasi_http_0_2_0_types_borrow_response_outparam_t;
pub const wasi_http_0_2_0_types_status_code_t = u16;
pub const struct_wasi_http_0_2_0_types_own_incoming_response_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_own_incoming_response_t = struct_wasi_http_0_2_0_types_own_incoming_response_t;
pub const struct_wasi_http_0_2_0_types_borrow_incoming_response_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_borrow_incoming_response_t = struct_wasi_http_0_2_0_types_borrow_incoming_response_t;
pub const struct_wasi_http_0_2_0_types_own_incoming_body_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_own_incoming_body_t = struct_wasi_http_0_2_0_types_own_incoming_body_t;
pub const struct_wasi_http_0_2_0_types_borrow_incoming_body_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_borrow_incoming_body_t = struct_wasi_http_0_2_0_types_borrow_incoming_body_t;
pub const struct_wasi_http_0_2_0_types_own_future_trailers_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_own_future_trailers_t = struct_wasi_http_0_2_0_types_own_future_trailers_t;
pub const struct_wasi_http_0_2_0_types_borrow_future_trailers_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_borrow_future_trailers_t = struct_wasi_http_0_2_0_types_borrow_future_trailers_t;
pub const struct_wasi_http_0_2_0_types_own_outgoing_response_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_own_outgoing_response_t = struct_wasi_http_0_2_0_types_own_outgoing_response_t;
pub const struct_wasi_http_0_2_0_types_borrow_outgoing_response_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_borrow_outgoing_response_t = struct_wasi_http_0_2_0_types_borrow_outgoing_response_t;
pub const struct_wasi_http_0_2_0_types_own_outgoing_body_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_own_outgoing_body_t = struct_wasi_http_0_2_0_types_own_outgoing_body_t;
pub const struct_wasi_http_0_2_0_types_borrow_outgoing_body_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_borrow_outgoing_body_t = struct_wasi_http_0_2_0_types_borrow_outgoing_body_t;
pub const struct_wasi_http_0_2_0_types_own_future_incoming_response_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_own_future_incoming_response_t = struct_wasi_http_0_2_0_types_own_future_incoming_response_t;
pub const struct_wasi_http_0_2_0_types_borrow_future_incoming_response_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_http_0_2_0_types_borrow_future_incoming_response_t = struct_wasi_http_0_2_0_types_borrow_future_incoming_response_t;
pub const wasi_http_0_2_0_types_borrow_io_error_t = wasi_io_0_2_0_error_borrow_error_t;
pub const wasi_http_0_2_0_types_option_error_code_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: wasi_http_0_2_0_types_error_code_t = @import("std").mem.zeroes(wasi_http_0_2_0_types_error_code_t),
};
pub const http_trigger_tuple2_field_key_field_value_t = extern struct {
    f0: wasi_http_0_2_0_types_field_key_t = @import("std").mem.zeroes(wasi_http_0_2_0_types_field_key_t),
    f1: wasi_http_0_2_0_types_field_value_t = @import("std").mem.zeroes(wasi_http_0_2_0_types_field_value_t),
};
pub const http_trigger_list_tuple2_field_key_field_value_t = extern struct {
    ptr: [*c]http_trigger_tuple2_field_key_field_value_t = @import("std").mem.zeroes([*c]http_trigger_tuple2_field_key_field_value_t),
    len: usize = @import("std").mem.zeroes(usize),
};
const union_unnamed_8 = extern union {
    ok: wasi_http_0_2_0_types_own_fields_t,
    err: wasi_http_0_2_0_types_header_error_t,
};
pub const wasi_http_0_2_0_types_result_own_fields_header_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_8 = @import("std").mem.zeroes(union_unnamed_8),
};
pub const http_trigger_list_field_value_t = extern struct {
    ptr: [*c]wasi_http_0_2_0_types_field_value_t = @import("std").mem.zeroes([*c]wasi_http_0_2_0_types_field_value_t),
    len: usize = @import("std").mem.zeroes(usize),
};
const union_unnamed_9 = extern union {
    err: wasi_http_0_2_0_types_header_error_t,
};
pub const wasi_http_0_2_0_types_result_void_header_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_9 = @import("std").mem.zeroes(union_unnamed_9),
};
pub const wasi_http_0_2_0_types_option_scheme_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: wasi_http_0_2_0_types_scheme_t = @import("std").mem.zeroes(wasi_http_0_2_0_types_scheme_t),
};
pub const wasi_http_0_2_0_types_own_headers_t = wasi_http_0_2_0_types_own_fields_t;
const union_unnamed_10 = extern union {
    ok: wasi_http_0_2_0_types_own_incoming_body_t,
};
pub const wasi_http_0_2_0_types_result_own_incoming_body_void_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_10 = @import("std").mem.zeroes(union_unnamed_10),
};
const union_unnamed_11 = extern union {
    ok: wasi_http_0_2_0_types_own_outgoing_body_t,
};
pub const wasi_http_0_2_0_types_result_own_outgoing_body_void_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_11 = @import("std").mem.zeroes(union_unnamed_11),
};
pub const wasi_http_0_2_0_types_result_void_void_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
};
pub const http_trigger_option_duration_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: wasi_http_0_2_0_types_duration_t = @import("std").mem.zeroes(wasi_http_0_2_0_types_duration_t),
};
const union_unnamed_12 = extern union {
    ok: wasi_http_0_2_0_types_own_outgoing_response_t,
    err: wasi_http_0_2_0_types_error_code_t,
};
pub const wasi_http_0_2_0_types_result_own_outgoing_response_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_12 = @import("std").mem.zeroes(union_unnamed_12),
};
pub const wasi_http_0_2_0_types_own_input_stream_t = wasi_io_0_2_0_streams_own_input_stream_t;
const union_unnamed_13 = extern union {
    ok: wasi_http_0_2_0_types_own_input_stream_t,
};
pub const wasi_http_0_2_0_types_result_own_input_stream_void_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_13 = @import("std").mem.zeroes(union_unnamed_13),
};
pub const wasi_http_0_2_0_types_own_pollable_t = wasi_io_0_2_0_poll_own_pollable_t;
pub const wasi_http_0_2_0_types_own_trailers_t = wasi_http_0_2_0_types_own_fields_t;
pub const wasi_http_0_2_0_types_option_own_trailers_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: wasi_http_0_2_0_types_own_trailers_t = @import("std").mem.zeroes(wasi_http_0_2_0_types_own_trailers_t),
};
const union_unnamed_14 = extern union {
    ok: wasi_http_0_2_0_types_option_own_trailers_t,
    err: wasi_http_0_2_0_types_error_code_t,
};
pub const wasi_http_0_2_0_types_result_option_own_trailers_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_14 = @import("std").mem.zeroes(union_unnamed_14),
};
const union_unnamed_15 = extern union {
    ok: wasi_http_0_2_0_types_result_option_own_trailers_error_code_t,
};
pub const wasi_http_0_2_0_types_result_result_option_own_trailers_error_code_void_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_15 = @import("std").mem.zeroes(union_unnamed_15),
};
pub const wasi_http_0_2_0_types_option_result_result_option_own_trailers_error_code_void_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: wasi_http_0_2_0_types_result_result_option_own_trailers_error_code_void_t = @import("std").mem.zeroes(wasi_http_0_2_0_types_result_result_option_own_trailers_error_code_void_t),
};
pub const wasi_http_0_2_0_types_own_output_stream_t = wasi_io_0_2_0_streams_own_output_stream_t;
const union_unnamed_16 = extern union {
    ok: wasi_http_0_2_0_types_own_output_stream_t,
};
pub const wasi_http_0_2_0_types_result_own_output_stream_void_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_16 = @import("std").mem.zeroes(union_unnamed_16),
};
const union_unnamed_17 = extern union {
    err: wasi_http_0_2_0_types_error_code_t,
};
pub const wasi_http_0_2_0_types_result_void_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_17 = @import("std").mem.zeroes(union_unnamed_17),
};
const union_unnamed_18 = extern union {
    ok: wasi_http_0_2_0_types_own_incoming_response_t,
    err: wasi_http_0_2_0_types_error_code_t,
};
pub const wasi_http_0_2_0_types_result_own_incoming_response_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_18 = @import("std").mem.zeroes(union_unnamed_18),
};
const union_unnamed_19 = extern union {
    ok: wasi_http_0_2_0_types_result_own_incoming_response_error_code_t,
};
pub const wasi_http_0_2_0_types_result_result_own_incoming_response_error_code_void_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_19 = @import("std").mem.zeroes(union_unnamed_19),
};
pub const wasi_http_0_2_0_types_option_result_result_own_incoming_response_error_code_void_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: wasi_http_0_2_0_types_result_result_own_incoming_response_error_code_void_t = @import("std").mem.zeroes(wasi_http_0_2_0_types_result_result_own_incoming_response_error_code_void_t),
};
pub const wasi_http_0_2_0_outgoing_handler_error_code_t = wasi_http_0_2_0_types_error_code_t;
pub const wasi_http_0_2_0_outgoing_handler_own_outgoing_request_t = wasi_http_0_2_0_types_own_outgoing_request_t;
pub const wasi_http_0_2_0_outgoing_handler_own_request_options_t = wasi_http_0_2_0_types_own_request_options_t;
pub const wasi_http_0_2_0_outgoing_handler_option_own_request_options_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: wasi_http_0_2_0_outgoing_handler_own_request_options_t = @import("std").mem.zeroes(wasi_http_0_2_0_outgoing_handler_own_request_options_t),
};
pub const wasi_http_0_2_0_outgoing_handler_own_future_incoming_response_t = wasi_http_0_2_0_types_own_future_incoming_response_t;
const union_unnamed_20 = extern union {
    ok: wasi_http_0_2_0_outgoing_handler_own_future_incoming_response_t,
    err: wasi_http_0_2_0_outgoing_handler_error_code_t,
};
pub const wasi_http_0_2_0_outgoing_handler_result_own_future_incoming_response_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_20 = @import("std").mem.zeroes(union_unnamed_20),
};
pub const fermyon_spin_2_0_0_llm_inferencing_model_t = http_trigger_string_t;
pub const struct_fermyon_spin_2_0_0_llm_inferencing_params_t = extern struct {
    max_tokens: u32 = @import("std").mem.zeroes(u32),
    repeat_penalty: f32 = @import("std").mem.zeroes(f32),
    repeat_penalty_last_n_token_count: u32 = @import("std").mem.zeroes(u32),
    temperature: f32 = @import("std").mem.zeroes(f32),
    top_k: u32 = @import("std").mem.zeroes(u32),
    top_p: f32 = @import("std").mem.zeroes(f32),
};
pub const fermyon_spin_2_0_0_llm_inferencing_params_t = struct_fermyon_spin_2_0_0_llm_inferencing_params_t;
const union_unnamed_21 = extern union {
    runtime_error: http_trigger_string_t,
    invalid_input: http_trigger_string_t,
};
pub const struct_fermyon_spin_2_0_0_llm_error_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_21 = @import("std").mem.zeroes(union_unnamed_21),
};
pub const fermyon_spin_2_0_0_llm_error_t = struct_fermyon_spin_2_0_0_llm_error_t;
pub const struct_fermyon_spin_2_0_0_llm_inferencing_usage_t = extern struct {
    prompt_token_count: u32 = @import("std").mem.zeroes(u32),
    generated_token_count: u32 = @import("std").mem.zeroes(u32),
};
pub const fermyon_spin_2_0_0_llm_inferencing_usage_t = struct_fermyon_spin_2_0_0_llm_inferencing_usage_t;
pub const struct_fermyon_spin_2_0_0_llm_inferencing_result_t = extern struct {
    text: http_trigger_string_t = @import("std").mem.zeroes(http_trigger_string_t),
    usage: fermyon_spin_2_0_0_llm_inferencing_usage_t = @import("std").mem.zeroes(fermyon_spin_2_0_0_llm_inferencing_usage_t),
};
pub const fermyon_spin_2_0_0_llm_inferencing_result_t = struct_fermyon_spin_2_0_0_llm_inferencing_result_t;
pub const fermyon_spin_2_0_0_llm_embedding_model_t = http_trigger_string_t;
pub const struct_fermyon_spin_2_0_0_llm_embeddings_usage_t = extern struct {
    prompt_token_count: u32 = @import("std").mem.zeroes(u32),
};
pub const fermyon_spin_2_0_0_llm_embeddings_usage_t = struct_fermyon_spin_2_0_0_llm_embeddings_usage_t;
pub const http_trigger_list_f32_t = extern struct {
    ptr: [*c]f32 = @import("std").mem.zeroes([*c]f32),
    len: usize = @import("std").mem.zeroes(usize),
};
pub const http_trigger_list_list_f32_t = extern struct {
    ptr: [*c]http_trigger_list_f32_t = @import("std").mem.zeroes([*c]http_trigger_list_f32_t),
    len: usize = @import("std").mem.zeroes(usize),
};
pub const struct_fermyon_spin_2_0_0_llm_embeddings_result_t = extern struct {
    embeddings: http_trigger_list_list_f32_t = @import("std").mem.zeroes(http_trigger_list_list_f32_t),
    usage: fermyon_spin_2_0_0_llm_embeddings_usage_t = @import("std").mem.zeroes(fermyon_spin_2_0_0_llm_embeddings_usage_t),
};
pub const fermyon_spin_2_0_0_llm_embeddings_result_t = struct_fermyon_spin_2_0_0_llm_embeddings_result_t;
pub const fermyon_spin_2_0_0_llm_option_inferencing_params_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: fermyon_spin_2_0_0_llm_inferencing_params_t = @import("std").mem.zeroes(fermyon_spin_2_0_0_llm_inferencing_params_t),
};
const union_unnamed_22 = extern union {
    ok: fermyon_spin_2_0_0_llm_inferencing_result_t,
    err: fermyon_spin_2_0_0_llm_error_t,
};
pub const fermyon_spin_2_0_0_llm_result_inferencing_result_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_22 = @import("std").mem.zeroes(union_unnamed_22),
};
pub const http_trigger_list_string_t = extern struct {
    ptr: [*c]http_trigger_string_t = @import("std").mem.zeroes([*c]http_trigger_string_t),
    len: usize = @import("std").mem.zeroes(usize),
};
const union_unnamed_23 = extern union {
    ok: fermyon_spin_2_0_0_llm_embeddings_result_t,
    err: fermyon_spin_2_0_0_llm_error_t,
};
pub const fermyon_spin_2_0_0_llm_result_embeddings_result_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_23 = @import("std").mem.zeroes(union_unnamed_23),
};
const union_unnamed_24 = extern union {
    other: http_trigger_string_t,
};
pub const struct_fermyon_spin_2_0_0_redis_error_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_24 = @import("std").mem.zeroes(union_unnamed_24),
};
pub const fermyon_spin_2_0_0_redis_error_t = struct_fermyon_spin_2_0_0_redis_error_t;
pub const struct_fermyon_spin_2_0_0_redis_own_connection_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const fermyon_spin_2_0_0_redis_own_connection_t = struct_fermyon_spin_2_0_0_redis_own_connection_t;
pub const struct_fermyon_spin_2_0_0_redis_borrow_connection_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const fermyon_spin_2_0_0_redis_borrow_connection_t = struct_fermyon_spin_2_0_0_redis_borrow_connection_t;
pub const struct_fermyon_spin_2_0_0_redis_payload_t = extern struct {
    ptr: [*c]u8 = @import("std").mem.zeroes([*c]u8),
    len: usize = @import("std").mem.zeroes(usize),
};
pub const fermyon_spin_2_0_0_redis_payload_t = struct_fermyon_spin_2_0_0_redis_payload_t;
const union_unnamed_25 = extern union {
    int64: i64,
    binary: fermyon_spin_2_0_0_redis_payload_t,
};
pub const struct_fermyon_spin_2_0_0_redis_redis_parameter_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_25 = @import("std").mem.zeroes(union_unnamed_25),
};
pub const fermyon_spin_2_0_0_redis_redis_parameter_t = struct_fermyon_spin_2_0_0_redis_redis_parameter_t;
const union_unnamed_26 = extern union {
    status: http_trigger_string_t,
    int64: i64,
    binary: fermyon_spin_2_0_0_redis_payload_t,
};
pub const struct_fermyon_spin_2_0_0_redis_redis_result_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_26 = @import("std").mem.zeroes(union_unnamed_26),
};
pub const fermyon_spin_2_0_0_redis_redis_result_t = struct_fermyon_spin_2_0_0_redis_redis_result_t;
const union_unnamed_27 = extern union {
    ok: fermyon_spin_2_0_0_redis_own_connection_t,
    err: fermyon_spin_2_0_0_redis_error_t,
};
pub const fermyon_spin_2_0_0_redis_result_own_connection_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_27 = @import("std").mem.zeroes(union_unnamed_27),
};
const union_unnamed_28 = extern union {
    err: fermyon_spin_2_0_0_redis_error_t,
};
pub const fermyon_spin_2_0_0_redis_result_void_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_28 = @import("std").mem.zeroes(union_unnamed_28),
};
pub const http_trigger_option_payload_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: fermyon_spin_2_0_0_redis_payload_t = @import("std").mem.zeroes(fermyon_spin_2_0_0_redis_payload_t),
};
const union_unnamed_29 = extern union {
    ok: http_trigger_option_payload_t,
    err: fermyon_spin_2_0_0_redis_error_t,
};
pub const fermyon_spin_2_0_0_redis_result_option_payload_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_29 = @import("std").mem.zeroes(union_unnamed_29),
};
const union_unnamed_30 = extern union {
    ok: i64,
    err: fermyon_spin_2_0_0_redis_error_t,
};
pub const fermyon_spin_2_0_0_redis_result_s64_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_30 = @import("std").mem.zeroes(union_unnamed_30),
};
const union_unnamed_31 = extern union {
    ok: u32,
    err: fermyon_spin_2_0_0_redis_error_t,
};
pub const fermyon_spin_2_0_0_redis_result_u32_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_31 = @import("std").mem.zeroes(union_unnamed_31),
};
const union_unnamed_32 = extern union {
    ok: http_trigger_list_string_t,
    err: fermyon_spin_2_0_0_redis_error_t,
};
pub const fermyon_spin_2_0_0_redis_result_list_string_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_32 = @import("std").mem.zeroes(union_unnamed_32),
};
pub const fermyon_spin_2_0_0_redis_list_redis_parameter_t = extern struct {
    ptr: [*c]fermyon_spin_2_0_0_redis_redis_parameter_t = @import("std").mem.zeroes([*c]fermyon_spin_2_0_0_redis_redis_parameter_t),
    len: usize = @import("std").mem.zeroes(usize),
};
pub const fermyon_spin_2_0_0_redis_list_redis_result_t = extern struct {
    ptr: [*c]fermyon_spin_2_0_0_redis_redis_result_t = @import("std").mem.zeroes([*c]fermyon_spin_2_0_0_redis_redis_result_t),
    len: usize = @import("std").mem.zeroes(usize),
};
const union_unnamed_33 = extern union {
    ok: fermyon_spin_2_0_0_redis_list_redis_result_t,
    err: fermyon_spin_2_0_0_redis_error_t,
};
pub const fermyon_spin_2_0_0_redis_result_list_redis_result_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_33 = @import("std").mem.zeroes(union_unnamed_33),
};
const union_unnamed_34 = extern union {
    connection_failed: http_trigger_string_t,
    other: http_trigger_string_t,
};
pub const struct_fermyon_spin_2_0_0_mqtt_error_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_34 = @import("std").mem.zeroes(union_unnamed_34),
};
pub const fermyon_spin_2_0_0_mqtt_error_t = struct_fermyon_spin_2_0_0_mqtt_error_t;
pub const fermyon_spin_2_0_0_mqtt_qos_t = u8;
pub const struct_fermyon_spin_2_0_0_mqtt_own_connection_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const fermyon_spin_2_0_0_mqtt_own_connection_t = struct_fermyon_spin_2_0_0_mqtt_own_connection_t;
pub const struct_fermyon_spin_2_0_0_mqtt_borrow_connection_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const fermyon_spin_2_0_0_mqtt_borrow_connection_t = struct_fermyon_spin_2_0_0_mqtt_borrow_connection_t;
pub const struct_fermyon_spin_2_0_0_mqtt_payload_t = extern struct {
    ptr: [*c]u8 = @import("std").mem.zeroes([*c]u8),
    len: usize = @import("std").mem.zeroes(usize),
};
pub const fermyon_spin_2_0_0_mqtt_payload_t = struct_fermyon_spin_2_0_0_mqtt_payload_t;
const union_unnamed_35 = extern union {
    ok: fermyon_spin_2_0_0_mqtt_own_connection_t,
    err: fermyon_spin_2_0_0_mqtt_error_t,
};
pub const fermyon_spin_2_0_0_mqtt_result_own_connection_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_35 = @import("std").mem.zeroes(union_unnamed_35),
};
const union_unnamed_36 = extern union {
    err: fermyon_spin_2_0_0_mqtt_error_t,
};
pub const fermyon_spin_2_0_0_mqtt_result_void_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_36 = @import("std").mem.zeroes(union_unnamed_36),
};
const union_unnamed_37 = extern union {
    connection_failed: http_trigger_string_t,
    bad_parameter: http_trigger_string_t,
    query_failed: http_trigger_string_t,
    value_conversion_failed: http_trigger_string_t,
    other: http_trigger_string_t,
};
pub const struct_fermyon_spin_2_0_0_rdbms_types_error_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_37 = @import("std").mem.zeroes(union_unnamed_37),
};
pub const fermyon_spin_2_0_0_rdbms_types_error_t = struct_fermyon_spin_2_0_0_rdbms_types_error_t;
pub const fermyon_spin_2_0_0_rdbms_types_db_data_type_t = u8;
const union_unnamed_38 = extern union {
    boolean: bool,
    int8: i8,
    int16: i16,
    int32: i32,
    int64: i64,
    uint8: u8,
    uint16: u16,
    uint32: u32,
    uint64: u64,
    floating32: f32,
    floating64: f64,
    str: http_trigger_string_t,
    binary: http_trigger_list_u8_t,
};
pub const struct_fermyon_spin_2_0_0_rdbms_types_db_value_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_38 = @import("std").mem.zeroes(union_unnamed_38),
};
pub const fermyon_spin_2_0_0_rdbms_types_db_value_t = struct_fermyon_spin_2_0_0_rdbms_types_db_value_t;
const union_unnamed_39 = extern union {
    boolean: bool,
    int8: i8,
    int16: i16,
    int32: i32,
    int64: i64,
    uint8: u8,
    uint16: u16,
    uint32: u32,
    uint64: u64,
    floating32: f32,
    floating64: f64,
    str: http_trigger_string_t,
    binary: http_trigger_list_u8_t,
};
pub const struct_fermyon_spin_2_0_0_rdbms_types_parameter_value_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_39 = @import("std").mem.zeroes(union_unnamed_39),
};
pub const fermyon_spin_2_0_0_rdbms_types_parameter_value_t = struct_fermyon_spin_2_0_0_rdbms_types_parameter_value_t;
pub const struct_fermyon_spin_2_0_0_rdbms_types_column_t = extern struct {
    name: http_trigger_string_t = @import("std").mem.zeroes(http_trigger_string_t),
    data_type: fermyon_spin_2_0_0_rdbms_types_db_data_type_t = @import("std").mem.zeroes(fermyon_spin_2_0_0_rdbms_types_db_data_type_t),
};
pub const fermyon_spin_2_0_0_rdbms_types_column_t = struct_fermyon_spin_2_0_0_rdbms_types_column_t;
pub const struct_fermyon_spin_2_0_0_rdbms_types_row_t = extern struct {
    ptr: [*c]fermyon_spin_2_0_0_rdbms_types_db_value_t = @import("std").mem.zeroes([*c]fermyon_spin_2_0_0_rdbms_types_db_value_t),
    len: usize = @import("std").mem.zeroes(usize),
};
pub const fermyon_spin_2_0_0_rdbms_types_row_t = struct_fermyon_spin_2_0_0_rdbms_types_row_t;
pub const fermyon_spin_2_0_0_rdbms_types_list_column_t = extern struct {
    ptr: [*c]fermyon_spin_2_0_0_rdbms_types_column_t = @import("std").mem.zeroes([*c]fermyon_spin_2_0_0_rdbms_types_column_t),
    len: usize = @import("std").mem.zeroes(usize),
};
pub const fermyon_spin_2_0_0_rdbms_types_list_row_t = extern struct {
    ptr: [*c]fermyon_spin_2_0_0_rdbms_types_row_t = @import("std").mem.zeroes([*c]fermyon_spin_2_0_0_rdbms_types_row_t),
    len: usize = @import("std").mem.zeroes(usize),
};
pub const struct_fermyon_spin_2_0_0_rdbms_types_row_set_t = extern struct {
    columns: fermyon_spin_2_0_0_rdbms_types_list_column_t = @import("std").mem.zeroes(fermyon_spin_2_0_0_rdbms_types_list_column_t),
    rows: fermyon_spin_2_0_0_rdbms_types_list_row_t = @import("std").mem.zeroes(fermyon_spin_2_0_0_rdbms_types_list_row_t),
};
pub const fermyon_spin_2_0_0_rdbms_types_row_set_t = struct_fermyon_spin_2_0_0_rdbms_types_row_set_t;
pub const fermyon_spin_2_0_0_postgres_parameter_value_t = fermyon_spin_2_0_0_rdbms_types_parameter_value_t;
pub const fermyon_spin_2_0_0_postgres_row_set_t = fermyon_spin_2_0_0_rdbms_types_row_set_t;
pub const fermyon_spin_2_0_0_postgres_error_t = fermyon_spin_2_0_0_rdbms_types_error_t;
pub const struct_fermyon_spin_2_0_0_postgres_own_connection_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const fermyon_spin_2_0_0_postgres_own_connection_t = struct_fermyon_spin_2_0_0_postgres_own_connection_t;
pub const struct_fermyon_spin_2_0_0_postgres_borrow_connection_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const fermyon_spin_2_0_0_postgres_borrow_connection_t = struct_fermyon_spin_2_0_0_postgres_borrow_connection_t;
const union_unnamed_40 = extern union {
    ok: fermyon_spin_2_0_0_postgres_own_connection_t,
    err: fermyon_spin_2_0_0_postgres_error_t,
};
pub const fermyon_spin_2_0_0_postgres_result_own_connection_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_40 = @import("std").mem.zeroes(union_unnamed_40),
};
pub const fermyon_spin_2_0_0_postgres_list_parameter_value_t = extern struct {
    ptr: [*c]fermyon_spin_2_0_0_postgres_parameter_value_t = @import("std").mem.zeroes([*c]fermyon_spin_2_0_0_postgres_parameter_value_t),
    len: usize = @import("std").mem.zeroes(usize),
};
const union_unnamed_41 = extern union {
    ok: fermyon_spin_2_0_0_postgres_row_set_t,
    err: fermyon_spin_2_0_0_postgres_error_t,
};
pub const fermyon_spin_2_0_0_postgres_result_row_set_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_41 = @import("std").mem.zeroes(union_unnamed_41),
};
const union_unnamed_42 = extern union {
    ok: u64,
    err: fermyon_spin_2_0_0_postgres_error_t,
};
pub const fermyon_spin_2_0_0_postgres_result_u64_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_42 = @import("std").mem.zeroes(union_unnamed_42),
};
pub const fermyon_spin_2_0_0_mysql_parameter_value_t = fermyon_spin_2_0_0_rdbms_types_parameter_value_t;
pub const fermyon_spin_2_0_0_mysql_row_set_t = fermyon_spin_2_0_0_rdbms_types_row_set_t;
pub const fermyon_spin_2_0_0_mysql_error_t = fermyon_spin_2_0_0_rdbms_types_error_t;
pub const struct_fermyon_spin_2_0_0_mysql_own_connection_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const fermyon_spin_2_0_0_mysql_own_connection_t = struct_fermyon_spin_2_0_0_mysql_own_connection_t;
pub const struct_fermyon_spin_2_0_0_mysql_borrow_connection_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const fermyon_spin_2_0_0_mysql_borrow_connection_t = struct_fermyon_spin_2_0_0_mysql_borrow_connection_t;
const union_unnamed_43 = extern union {
    ok: fermyon_spin_2_0_0_mysql_own_connection_t,
    err: fermyon_spin_2_0_0_mysql_error_t,
};
pub const fermyon_spin_2_0_0_mysql_result_own_connection_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_43 = @import("std").mem.zeroes(union_unnamed_43),
};
pub const fermyon_spin_2_0_0_mysql_list_parameter_value_t = extern struct {
    ptr: [*c]fermyon_spin_2_0_0_mysql_parameter_value_t = @import("std").mem.zeroes([*c]fermyon_spin_2_0_0_mysql_parameter_value_t),
    len: usize = @import("std").mem.zeroes(usize),
};
const union_unnamed_44 = extern union {
    ok: fermyon_spin_2_0_0_mysql_row_set_t,
    err: fermyon_spin_2_0_0_mysql_error_t,
};
pub const fermyon_spin_2_0_0_mysql_result_row_set_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_44 = @import("std").mem.zeroes(union_unnamed_44),
};
const union_unnamed_45 = extern union {
    err: fermyon_spin_2_0_0_mysql_error_t,
};
pub const fermyon_spin_2_0_0_mysql_result_void_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_45 = @import("std").mem.zeroes(union_unnamed_45),
};
pub const struct_fermyon_spin_2_0_0_sqlite_own_connection_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const fermyon_spin_2_0_0_sqlite_own_connection_t = struct_fermyon_spin_2_0_0_sqlite_own_connection_t;
pub const struct_fermyon_spin_2_0_0_sqlite_borrow_connection_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const fermyon_spin_2_0_0_sqlite_borrow_connection_t = struct_fermyon_spin_2_0_0_sqlite_borrow_connection_t;
const union_unnamed_46 = extern union {
    io: http_trigger_string_t,
};
pub const struct_fermyon_spin_2_0_0_sqlite_error_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_46 = @import("std").mem.zeroes(union_unnamed_46),
};
pub const fermyon_spin_2_0_0_sqlite_error_t = struct_fermyon_spin_2_0_0_sqlite_error_t;
const union_unnamed_47 = extern union {
    integer: i64,
    real: f64,
    text: http_trigger_string_t,
    blob: http_trigger_list_u8_t,
};
pub const struct_fermyon_spin_2_0_0_sqlite_value_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_47 = @import("std").mem.zeroes(union_unnamed_47),
};
pub const fermyon_spin_2_0_0_sqlite_value_t = struct_fermyon_spin_2_0_0_sqlite_value_t;
pub const fermyon_spin_2_0_0_sqlite_list_value_t = extern struct {
    ptr: [*c]fermyon_spin_2_0_0_sqlite_value_t = @import("std").mem.zeroes([*c]fermyon_spin_2_0_0_sqlite_value_t),
    len: usize = @import("std").mem.zeroes(usize),
};
pub const struct_fermyon_spin_2_0_0_sqlite_row_result_t = extern struct {
    values: fermyon_spin_2_0_0_sqlite_list_value_t = @import("std").mem.zeroes(fermyon_spin_2_0_0_sqlite_list_value_t),
};
pub const fermyon_spin_2_0_0_sqlite_row_result_t = struct_fermyon_spin_2_0_0_sqlite_row_result_t;
pub const fermyon_spin_2_0_0_sqlite_list_row_result_t = extern struct {
    ptr: [*c]fermyon_spin_2_0_0_sqlite_row_result_t = @import("std").mem.zeroes([*c]fermyon_spin_2_0_0_sqlite_row_result_t),
    len: usize = @import("std").mem.zeroes(usize),
};
pub const struct_fermyon_spin_2_0_0_sqlite_query_result_t = extern struct {
    columns: http_trigger_list_string_t = @import("std").mem.zeroes(http_trigger_list_string_t),
    rows: fermyon_spin_2_0_0_sqlite_list_row_result_t = @import("std").mem.zeroes(fermyon_spin_2_0_0_sqlite_list_row_result_t),
};
pub const fermyon_spin_2_0_0_sqlite_query_result_t = struct_fermyon_spin_2_0_0_sqlite_query_result_t;
const union_unnamed_48 = extern union {
    ok: fermyon_spin_2_0_0_sqlite_own_connection_t,
    err: fermyon_spin_2_0_0_sqlite_error_t,
};
pub const fermyon_spin_2_0_0_sqlite_result_own_connection_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_48 = @import("std").mem.zeroes(union_unnamed_48),
};
const union_unnamed_49 = extern union {
    ok: fermyon_spin_2_0_0_sqlite_query_result_t,
    err: fermyon_spin_2_0_0_sqlite_error_t,
};
pub const fermyon_spin_2_0_0_sqlite_result_query_result_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_49 = @import("std").mem.zeroes(union_unnamed_49),
};
pub const struct_fermyon_spin_2_0_0_key_value_own_store_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const fermyon_spin_2_0_0_key_value_own_store_t = struct_fermyon_spin_2_0_0_key_value_own_store_t;
pub const struct_fermyon_spin_2_0_0_key_value_borrow_store_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const fermyon_spin_2_0_0_key_value_borrow_store_t = struct_fermyon_spin_2_0_0_key_value_borrow_store_t;
const union_unnamed_50 = extern union {
    other: http_trigger_string_t,
};
pub const struct_fermyon_spin_2_0_0_key_value_error_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_50 = @import("std").mem.zeroes(union_unnamed_50),
};
pub const fermyon_spin_2_0_0_key_value_error_t = struct_fermyon_spin_2_0_0_key_value_error_t;
const union_unnamed_51 = extern union {
    ok: fermyon_spin_2_0_0_key_value_own_store_t,
    err: fermyon_spin_2_0_0_key_value_error_t,
};
pub const fermyon_spin_2_0_0_key_value_result_own_store_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_51 = @import("std").mem.zeroes(union_unnamed_51),
};
pub const http_trigger_option_list_u8_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: http_trigger_list_u8_t = @import("std").mem.zeroes(http_trigger_list_u8_t),
};
const union_unnamed_52 = extern union {
    ok: http_trigger_option_list_u8_t,
    err: fermyon_spin_2_0_0_key_value_error_t,
};
pub const fermyon_spin_2_0_0_key_value_result_option_list_u8_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_52 = @import("std").mem.zeroes(union_unnamed_52),
};
const union_unnamed_53 = extern union {
    err: fermyon_spin_2_0_0_key_value_error_t,
};
pub const fermyon_spin_2_0_0_key_value_result_void_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_53 = @import("std").mem.zeroes(union_unnamed_53),
};
const union_unnamed_54 = extern union {
    ok: bool,
    err: fermyon_spin_2_0_0_key_value_error_t,
};
pub const fermyon_spin_2_0_0_key_value_result_bool_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_54 = @import("std").mem.zeroes(union_unnamed_54),
};
const union_unnamed_55 = extern union {
    ok: http_trigger_list_string_t,
    err: fermyon_spin_2_0_0_key_value_error_t,
};
pub const fermyon_spin_2_0_0_key_value_result_list_string_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_55 = @import("std").mem.zeroes(union_unnamed_55),
};
const union_unnamed_56 = extern union {
    invalid_name: http_trigger_string_t,
    undefined: http_trigger_string_t,
    provider: http_trigger_string_t,
    other: http_trigger_string_t,
};
pub const struct_fermyon_spin_2_0_0_variables_error_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_56 = @import("std").mem.zeroes(union_unnamed_56),
};
pub const fermyon_spin_2_0_0_variables_error_t = struct_fermyon_spin_2_0_0_variables_error_t;
const union_unnamed_57 = extern union {
    ok: http_trigger_string_t,
    err: fermyon_spin_2_0_0_variables_error_t,
};
pub const fermyon_spin_2_0_0_variables_result_string_error_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_57 = @import("std").mem.zeroes(union_unnamed_57),
};
pub const http_trigger_tuple2_string_string_t = extern struct {
    f0: http_trigger_string_t = @import("std").mem.zeroes(http_trigger_string_t),
    f1: http_trigger_string_t = @import("std").mem.zeroes(http_trigger_string_t),
};
pub const http_trigger_list_tuple2_string_string_t = extern struct {
    ptr: [*c]http_trigger_tuple2_string_string_t = @import("std").mem.zeroes([*c]http_trigger_tuple2_string_string_t),
    len: usize = @import("std").mem.zeroes(usize),
};
pub const wasi_cli_0_2_0_exit_result_void_void_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
};
pub const wasi_cli_0_2_0_stdin_own_input_stream_t = wasi_io_0_2_0_streams_own_input_stream_t;
pub const wasi_cli_0_2_0_stdout_own_output_stream_t = wasi_io_0_2_0_streams_own_output_stream_t;
pub const wasi_cli_0_2_0_stderr_own_output_stream_t = wasi_io_0_2_0_streams_own_output_stream_t;
pub const struct_wasi_cli_0_2_0_terminal_input_own_terminal_input_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_cli_0_2_0_terminal_input_own_terminal_input_t = struct_wasi_cli_0_2_0_terminal_input_own_terminal_input_t;
pub const struct_wasi_cli_0_2_0_terminal_input_borrow_terminal_input_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_cli_0_2_0_terminal_input_borrow_terminal_input_t = struct_wasi_cli_0_2_0_terminal_input_borrow_terminal_input_t;
pub const struct_wasi_cli_0_2_0_terminal_output_own_terminal_output_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_cli_0_2_0_terminal_output_own_terminal_output_t = struct_wasi_cli_0_2_0_terminal_output_own_terminal_output_t;
pub const struct_wasi_cli_0_2_0_terminal_output_borrow_terminal_output_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_cli_0_2_0_terminal_output_borrow_terminal_output_t = struct_wasi_cli_0_2_0_terminal_output_borrow_terminal_output_t;
pub const wasi_cli_0_2_0_terminal_stdin_own_terminal_input_t = wasi_cli_0_2_0_terminal_input_own_terminal_input_t;
pub const wasi_cli_0_2_0_terminal_stdin_option_own_terminal_input_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: wasi_cli_0_2_0_terminal_stdin_own_terminal_input_t = @import("std").mem.zeroes(wasi_cli_0_2_0_terminal_stdin_own_terminal_input_t),
};
pub const wasi_cli_0_2_0_terminal_stdout_own_terminal_output_t = wasi_cli_0_2_0_terminal_output_own_terminal_output_t;
pub const wasi_cli_0_2_0_terminal_stdout_option_own_terminal_output_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: wasi_cli_0_2_0_terminal_stdout_own_terminal_output_t = @import("std").mem.zeroes(wasi_cli_0_2_0_terminal_stdout_own_terminal_output_t),
};
pub const wasi_cli_0_2_0_terminal_stderr_own_terminal_output_t = wasi_cli_0_2_0_terminal_output_own_terminal_output_t;
pub const wasi_cli_0_2_0_terminal_stderr_option_own_terminal_output_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: wasi_cli_0_2_0_terminal_stderr_own_terminal_output_t = @import("std").mem.zeroes(wasi_cli_0_2_0_terminal_stderr_own_terminal_output_t),
};
pub const struct_wasi_clocks_0_2_0_wall_clock_datetime_t = extern struct {
    seconds: u64 = @import("std").mem.zeroes(u64),
    nanoseconds: u32 = @import("std").mem.zeroes(u32),
};
pub const wasi_clocks_0_2_0_wall_clock_datetime_t = struct_wasi_clocks_0_2_0_wall_clock_datetime_t;
pub const wasi_filesystem_0_2_0_types_datetime_t = wasi_clocks_0_2_0_wall_clock_datetime_t;
pub const wasi_filesystem_0_2_0_types_filesize_t = u64;
pub const wasi_filesystem_0_2_0_types_descriptor_type_t = u8;
pub const wasi_filesystem_0_2_0_types_descriptor_flags_t = u8;
pub const wasi_filesystem_0_2_0_types_path_flags_t = u8;
pub const wasi_filesystem_0_2_0_types_open_flags_t = u8;
pub const wasi_filesystem_0_2_0_types_link_count_t = u64;
pub const wasi_filesystem_0_2_0_types_option_datetime_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: wasi_filesystem_0_2_0_types_datetime_t = @import("std").mem.zeroes(wasi_filesystem_0_2_0_types_datetime_t),
};
pub const struct_wasi_filesystem_0_2_0_types_descriptor_stat_t = extern struct {
    type: wasi_filesystem_0_2_0_types_descriptor_type_t = @import("std").mem.zeroes(wasi_filesystem_0_2_0_types_descriptor_type_t),
    link_count: wasi_filesystem_0_2_0_types_link_count_t = @import("std").mem.zeroes(wasi_filesystem_0_2_0_types_link_count_t),
    size: wasi_filesystem_0_2_0_types_filesize_t = @import("std").mem.zeroes(wasi_filesystem_0_2_0_types_filesize_t),
    data_access_timestamp: wasi_filesystem_0_2_0_types_option_datetime_t = @import("std").mem.zeroes(wasi_filesystem_0_2_0_types_option_datetime_t),
    data_modification_timestamp: wasi_filesystem_0_2_0_types_option_datetime_t = @import("std").mem.zeroes(wasi_filesystem_0_2_0_types_option_datetime_t),
    status_change_timestamp: wasi_filesystem_0_2_0_types_option_datetime_t = @import("std").mem.zeroes(wasi_filesystem_0_2_0_types_option_datetime_t),
};
pub const wasi_filesystem_0_2_0_types_descriptor_stat_t = struct_wasi_filesystem_0_2_0_types_descriptor_stat_t;
const union_unnamed_58 = extern union {
    timestamp: wasi_filesystem_0_2_0_types_datetime_t,
};
pub const struct_wasi_filesystem_0_2_0_types_new_timestamp_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_58 = @import("std").mem.zeroes(union_unnamed_58),
};
pub const wasi_filesystem_0_2_0_types_new_timestamp_t = struct_wasi_filesystem_0_2_0_types_new_timestamp_t;
pub const struct_wasi_filesystem_0_2_0_types_directory_entry_t = extern struct {
    type: wasi_filesystem_0_2_0_types_descriptor_type_t = @import("std").mem.zeroes(wasi_filesystem_0_2_0_types_descriptor_type_t),
    name: http_trigger_string_t = @import("std").mem.zeroes(http_trigger_string_t),
};
pub const wasi_filesystem_0_2_0_types_directory_entry_t = struct_wasi_filesystem_0_2_0_types_directory_entry_t;
pub const wasi_filesystem_0_2_0_types_error_code_t = u8;
pub const wasi_filesystem_0_2_0_types_advice_t = u8;
pub const struct_wasi_filesystem_0_2_0_types_metadata_hash_value_t = extern struct {
    lower: u64 = @import("std").mem.zeroes(u64),
    upper: u64 = @import("std").mem.zeroes(u64),
};
pub const wasi_filesystem_0_2_0_types_metadata_hash_value_t = struct_wasi_filesystem_0_2_0_types_metadata_hash_value_t;
pub const struct_wasi_filesystem_0_2_0_types_own_descriptor_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_filesystem_0_2_0_types_own_descriptor_t = struct_wasi_filesystem_0_2_0_types_own_descriptor_t;
pub const struct_wasi_filesystem_0_2_0_types_borrow_descriptor_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_filesystem_0_2_0_types_borrow_descriptor_t = struct_wasi_filesystem_0_2_0_types_borrow_descriptor_t;
pub const struct_wasi_filesystem_0_2_0_types_own_directory_entry_stream_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_filesystem_0_2_0_types_own_directory_entry_stream_t = struct_wasi_filesystem_0_2_0_types_own_directory_entry_stream_t;
pub const struct_wasi_filesystem_0_2_0_types_borrow_directory_entry_stream_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_filesystem_0_2_0_types_borrow_directory_entry_stream_t = struct_wasi_filesystem_0_2_0_types_borrow_directory_entry_stream_t;
pub const wasi_filesystem_0_2_0_types_own_input_stream_t = wasi_io_0_2_0_streams_own_input_stream_t;
const union_unnamed_59 = extern union {
    ok: wasi_filesystem_0_2_0_types_own_input_stream_t,
    err: wasi_filesystem_0_2_0_types_error_code_t,
};
pub const wasi_filesystem_0_2_0_types_result_own_input_stream_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_59 = @import("std").mem.zeroes(union_unnamed_59),
};
pub const wasi_filesystem_0_2_0_types_own_output_stream_t = wasi_io_0_2_0_streams_own_output_stream_t;
const union_unnamed_60 = extern union {
    ok: wasi_filesystem_0_2_0_types_own_output_stream_t,
    err: wasi_filesystem_0_2_0_types_error_code_t,
};
pub const wasi_filesystem_0_2_0_types_result_own_output_stream_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_60 = @import("std").mem.zeroes(union_unnamed_60),
};
const union_unnamed_61 = extern union {
    err: wasi_filesystem_0_2_0_types_error_code_t,
};
pub const wasi_filesystem_0_2_0_types_result_void_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_61 = @import("std").mem.zeroes(union_unnamed_61),
};
const union_unnamed_62 = extern union {
    ok: wasi_filesystem_0_2_0_types_descriptor_flags_t,
    err: wasi_filesystem_0_2_0_types_error_code_t,
};
pub const wasi_filesystem_0_2_0_types_result_descriptor_flags_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_62 = @import("std").mem.zeroes(union_unnamed_62),
};
const union_unnamed_63 = extern union {
    ok: wasi_filesystem_0_2_0_types_descriptor_type_t,
    err: wasi_filesystem_0_2_0_types_error_code_t,
};
pub const wasi_filesystem_0_2_0_types_result_descriptor_type_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_63 = @import("std").mem.zeroes(union_unnamed_63),
};
pub const http_trigger_tuple2_list_u8_bool_t = extern struct {
    f0: http_trigger_list_u8_t = @import("std").mem.zeroes(http_trigger_list_u8_t),
    f1: bool = @import("std").mem.zeroes(bool),
};
const union_unnamed_64 = extern union {
    ok: http_trigger_tuple2_list_u8_bool_t,
    err: wasi_filesystem_0_2_0_types_error_code_t,
};
pub const wasi_filesystem_0_2_0_types_result_tuple2_list_u8_bool_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_64 = @import("std").mem.zeroes(union_unnamed_64),
};
const union_unnamed_65 = extern union {
    ok: wasi_filesystem_0_2_0_types_filesize_t,
    err: wasi_filesystem_0_2_0_types_error_code_t,
};
pub const wasi_filesystem_0_2_0_types_result_filesize_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_65 = @import("std").mem.zeroes(union_unnamed_65),
};
const union_unnamed_66 = extern union {
    ok: wasi_filesystem_0_2_0_types_own_directory_entry_stream_t,
    err: wasi_filesystem_0_2_0_types_error_code_t,
};
pub const wasi_filesystem_0_2_0_types_result_own_directory_entry_stream_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_66 = @import("std").mem.zeroes(union_unnamed_66),
};
const union_unnamed_67 = extern union {
    ok: wasi_filesystem_0_2_0_types_descriptor_stat_t,
    err: wasi_filesystem_0_2_0_types_error_code_t,
};
pub const wasi_filesystem_0_2_0_types_result_descriptor_stat_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_67 = @import("std").mem.zeroes(union_unnamed_67),
};
const union_unnamed_68 = extern union {
    ok: wasi_filesystem_0_2_0_types_own_descriptor_t,
    err: wasi_filesystem_0_2_0_types_error_code_t,
};
pub const wasi_filesystem_0_2_0_types_result_own_descriptor_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_68 = @import("std").mem.zeroes(union_unnamed_68),
};
const union_unnamed_69 = extern union {
    ok: http_trigger_string_t,
    err: wasi_filesystem_0_2_0_types_error_code_t,
};
pub const wasi_filesystem_0_2_0_types_result_string_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_69 = @import("std").mem.zeroes(union_unnamed_69),
};
const union_unnamed_70 = extern union {
    ok: wasi_filesystem_0_2_0_types_metadata_hash_value_t,
    err: wasi_filesystem_0_2_0_types_error_code_t,
};
pub const wasi_filesystem_0_2_0_types_result_metadata_hash_value_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_70 = @import("std").mem.zeroes(union_unnamed_70),
};
pub const wasi_filesystem_0_2_0_types_option_directory_entry_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: wasi_filesystem_0_2_0_types_directory_entry_t = @import("std").mem.zeroes(wasi_filesystem_0_2_0_types_directory_entry_t),
};
const union_unnamed_71 = extern union {
    ok: wasi_filesystem_0_2_0_types_option_directory_entry_t,
    err: wasi_filesystem_0_2_0_types_error_code_t,
};
pub const wasi_filesystem_0_2_0_types_result_option_directory_entry_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_71 = @import("std").mem.zeroes(union_unnamed_71),
};
pub const wasi_filesystem_0_2_0_types_borrow_error_t = wasi_io_0_2_0_error_borrow_error_t;
pub const wasi_filesystem_0_2_0_types_option_error_code_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: wasi_filesystem_0_2_0_types_error_code_t = @import("std").mem.zeroes(wasi_filesystem_0_2_0_types_error_code_t),
};
pub const wasi_filesystem_0_2_0_preopens_own_descriptor_t = wasi_filesystem_0_2_0_types_own_descriptor_t;
pub const wasi_filesystem_0_2_0_preopens_tuple2_own_descriptor_string_t = extern struct {
    f0: wasi_filesystem_0_2_0_preopens_own_descriptor_t = @import("std").mem.zeroes(wasi_filesystem_0_2_0_preopens_own_descriptor_t),
    f1: http_trigger_string_t = @import("std").mem.zeroes(http_trigger_string_t),
};
pub const wasi_filesystem_0_2_0_preopens_list_tuple2_own_descriptor_string_t = extern struct {
    ptr: [*c]wasi_filesystem_0_2_0_preopens_tuple2_own_descriptor_string_t = @import("std").mem.zeroes([*c]wasi_filesystem_0_2_0_preopens_tuple2_own_descriptor_string_t),
    len: usize = @import("std").mem.zeroes(usize),
};
pub const struct_wasi_sockets_0_2_0_network_own_network_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_sockets_0_2_0_network_own_network_t = struct_wasi_sockets_0_2_0_network_own_network_t;
pub const struct_wasi_sockets_0_2_0_network_borrow_network_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_sockets_0_2_0_network_borrow_network_t = struct_wasi_sockets_0_2_0_network_borrow_network_t;
pub const wasi_sockets_0_2_0_network_error_code_t = u8;
pub const wasi_sockets_0_2_0_network_ip_address_family_t = u8;
pub const struct_wasi_sockets_0_2_0_network_ipv4_address_t = extern struct {
    f0: u8 = @import("std").mem.zeroes(u8),
    f1: u8 = @import("std").mem.zeroes(u8),
    f2: u8 = @import("std").mem.zeroes(u8),
    f3: u8 = @import("std").mem.zeroes(u8),
};
pub const wasi_sockets_0_2_0_network_ipv4_address_t = struct_wasi_sockets_0_2_0_network_ipv4_address_t;
pub const struct_wasi_sockets_0_2_0_network_ipv6_address_t = extern struct {
    f0: u16 = @import("std").mem.zeroes(u16),
    f1: u16 = @import("std").mem.zeroes(u16),
    f2: u16 = @import("std").mem.zeroes(u16),
    f3: u16 = @import("std").mem.zeroes(u16),
    f4: u16 = @import("std").mem.zeroes(u16),
    f5: u16 = @import("std").mem.zeroes(u16),
    f6: u16 = @import("std").mem.zeroes(u16),
    f7: u16 = @import("std").mem.zeroes(u16),
};
pub const wasi_sockets_0_2_0_network_ipv6_address_t = struct_wasi_sockets_0_2_0_network_ipv6_address_t;
const union_unnamed_72 = extern union {
    ipv4: wasi_sockets_0_2_0_network_ipv4_address_t,
    ipv6: wasi_sockets_0_2_0_network_ipv6_address_t,
};
pub const struct_wasi_sockets_0_2_0_network_ip_address_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_72 = @import("std").mem.zeroes(union_unnamed_72),
};
pub const wasi_sockets_0_2_0_network_ip_address_t = struct_wasi_sockets_0_2_0_network_ip_address_t;
pub const struct_wasi_sockets_0_2_0_network_ipv4_socket_address_t = extern struct {
    port: u16 = @import("std").mem.zeroes(u16),
    address: wasi_sockets_0_2_0_network_ipv4_address_t = @import("std").mem.zeroes(wasi_sockets_0_2_0_network_ipv4_address_t),
};
pub const wasi_sockets_0_2_0_network_ipv4_socket_address_t = struct_wasi_sockets_0_2_0_network_ipv4_socket_address_t;
pub const struct_wasi_sockets_0_2_0_network_ipv6_socket_address_t = extern struct {
    port: u16 = @import("std").mem.zeroes(u16),
    flow_info: u32 = @import("std").mem.zeroes(u32),
    address: wasi_sockets_0_2_0_network_ipv6_address_t = @import("std").mem.zeroes(wasi_sockets_0_2_0_network_ipv6_address_t),
    scope_id: u32 = @import("std").mem.zeroes(u32),
};
pub const wasi_sockets_0_2_0_network_ipv6_socket_address_t = struct_wasi_sockets_0_2_0_network_ipv6_socket_address_t;
const union_unnamed_73 = extern union {
    ipv4: wasi_sockets_0_2_0_network_ipv4_socket_address_t,
    ipv6: wasi_sockets_0_2_0_network_ipv6_socket_address_t,
};
pub const struct_wasi_sockets_0_2_0_network_ip_socket_address_t = extern struct {
    tag: u8 = @import("std").mem.zeroes(u8),
    val: union_unnamed_73 = @import("std").mem.zeroes(union_unnamed_73),
};
pub const wasi_sockets_0_2_0_network_ip_socket_address_t = struct_wasi_sockets_0_2_0_network_ip_socket_address_t;
pub const wasi_sockets_0_2_0_instance_network_own_network_t = wasi_sockets_0_2_0_network_own_network_t;
pub const wasi_sockets_0_2_0_udp_error_code_t = wasi_sockets_0_2_0_network_error_code_t;
pub const wasi_sockets_0_2_0_udp_ip_socket_address_t = wasi_sockets_0_2_0_network_ip_socket_address_t;
pub const wasi_sockets_0_2_0_udp_ip_address_family_t = wasi_sockets_0_2_0_network_ip_address_family_t;
pub const struct_wasi_sockets_0_2_0_udp_incoming_datagram_t = extern struct {
    data: http_trigger_list_u8_t = @import("std").mem.zeroes(http_trigger_list_u8_t),
    remote_address: wasi_sockets_0_2_0_udp_ip_socket_address_t = @import("std").mem.zeroes(wasi_sockets_0_2_0_udp_ip_socket_address_t),
};
pub const wasi_sockets_0_2_0_udp_incoming_datagram_t = struct_wasi_sockets_0_2_0_udp_incoming_datagram_t;
pub const wasi_sockets_0_2_0_udp_option_ip_socket_address_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: wasi_sockets_0_2_0_udp_ip_socket_address_t = @import("std").mem.zeroes(wasi_sockets_0_2_0_udp_ip_socket_address_t),
};
pub const struct_wasi_sockets_0_2_0_udp_outgoing_datagram_t = extern struct {
    data: http_trigger_list_u8_t = @import("std").mem.zeroes(http_trigger_list_u8_t),
    remote_address: wasi_sockets_0_2_0_udp_option_ip_socket_address_t = @import("std").mem.zeroes(wasi_sockets_0_2_0_udp_option_ip_socket_address_t),
};
pub const wasi_sockets_0_2_0_udp_outgoing_datagram_t = struct_wasi_sockets_0_2_0_udp_outgoing_datagram_t;
pub const struct_wasi_sockets_0_2_0_udp_own_udp_socket_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_sockets_0_2_0_udp_own_udp_socket_t = struct_wasi_sockets_0_2_0_udp_own_udp_socket_t;
pub const struct_wasi_sockets_0_2_0_udp_borrow_udp_socket_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_sockets_0_2_0_udp_borrow_udp_socket_t = struct_wasi_sockets_0_2_0_udp_borrow_udp_socket_t;
pub const struct_wasi_sockets_0_2_0_udp_own_incoming_datagram_stream_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_sockets_0_2_0_udp_own_incoming_datagram_stream_t = struct_wasi_sockets_0_2_0_udp_own_incoming_datagram_stream_t;
pub const struct_wasi_sockets_0_2_0_udp_borrow_incoming_datagram_stream_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_sockets_0_2_0_udp_borrow_incoming_datagram_stream_t = struct_wasi_sockets_0_2_0_udp_borrow_incoming_datagram_stream_t;
pub const struct_wasi_sockets_0_2_0_udp_own_outgoing_datagram_stream_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_sockets_0_2_0_udp_own_outgoing_datagram_stream_t = struct_wasi_sockets_0_2_0_udp_own_outgoing_datagram_stream_t;
pub const struct_wasi_sockets_0_2_0_udp_borrow_outgoing_datagram_stream_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_sockets_0_2_0_udp_borrow_outgoing_datagram_stream_t = struct_wasi_sockets_0_2_0_udp_borrow_outgoing_datagram_stream_t;
pub const wasi_sockets_0_2_0_udp_borrow_network_t = wasi_sockets_0_2_0_network_borrow_network_t;
const union_unnamed_74 = extern union {
    err: wasi_sockets_0_2_0_udp_error_code_t,
};
pub const wasi_sockets_0_2_0_udp_result_void_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_74 = @import("std").mem.zeroes(union_unnamed_74),
};
pub const wasi_sockets_0_2_0_udp_tuple2_own_incoming_datagram_stream_own_outgoing_datagram_stream_t = extern struct {
    f0: wasi_sockets_0_2_0_udp_own_incoming_datagram_stream_t = @import("std").mem.zeroes(wasi_sockets_0_2_0_udp_own_incoming_datagram_stream_t),
    f1: wasi_sockets_0_2_0_udp_own_outgoing_datagram_stream_t = @import("std").mem.zeroes(wasi_sockets_0_2_0_udp_own_outgoing_datagram_stream_t),
};
const union_unnamed_75 = extern union {
    ok: wasi_sockets_0_2_0_udp_tuple2_own_incoming_datagram_stream_own_outgoing_datagram_stream_t,
    err: wasi_sockets_0_2_0_udp_error_code_t,
};
pub const wasi_sockets_0_2_0_udp_result_tuple2_own_incoming_datagram_stream_own_outgoing_datagram_stream_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_75 = @import("std").mem.zeroes(union_unnamed_75),
};
const union_unnamed_76 = extern union {
    ok: wasi_sockets_0_2_0_udp_ip_socket_address_t,
    err: wasi_sockets_0_2_0_udp_error_code_t,
};
pub const wasi_sockets_0_2_0_udp_result_ip_socket_address_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_76 = @import("std").mem.zeroes(union_unnamed_76),
};
const union_unnamed_77 = extern union {
    ok: u8,
    err: wasi_sockets_0_2_0_udp_error_code_t,
};
pub const wasi_sockets_0_2_0_udp_result_u8_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_77 = @import("std").mem.zeroes(union_unnamed_77),
};
const union_unnamed_78 = extern union {
    ok: u64,
    err: wasi_sockets_0_2_0_udp_error_code_t,
};
pub const wasi_sockets_0_2_0_udp_result_u64_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_78 = @import("std").mem.zeroes(union_unnamed_78),
};
pub const wasi_sockets_0_2_0_udp_own_pollable_t = wasi_io_0_2_0_poll_own_pollable_t;
pub const wasi_sockets_0_2_0_udp_list_incoming_datagram_t = extern struct {
    ptr: [*c]wasi_sockets_0_2_0_udp_incoming_datagram_t = @import("std").mem.zeroes([*c]wasi_sockets_0_2_0_udp_incoming_datagram_t),
    len: usize = @import("std").mem.zeroes(usize),
};
const union_unnamed_79 = extern union {
    ok: wasi_sockets_0_2_0_udp_list_incoming_datagram_t,
    err: wasi_sockets_0_2_0_udp_error_code_t,
};
pub const wasi_sockets_0_2_0_udp_result_list_incoming_datagram_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_79 = @import("std").mem.zeroes(union_unnamed_79),
};
pub const wasi_sockets_0_2_0_udp_list_outgoing_datagram_t = extern struct {
    ptr: [*c]wasi_sockets_0_2_0_udp_outgoing_datagram_t = @import("std").mem.zeroes([*c]wasi_sockets_0_2_0_udp_outgoing_datagram_t),
    len: usize = @import("std").mem.zeroes(usize),
};
pub const wasi_sockets_0_2_0_udp_create_socket_error_code_t = wasi_sockets_0_2_0_network_error_code_t;
pub const wasi_sockets_0_2_0_udp_create_socket_ip_address_family_t = wasi_sockets_0_2_0_network_ip_address_family_t;
pub const wasi_sockets_0_2_0_udp_create_socket_own_udp_socket_t = wasi_sockets_0_2_0_udp_own_udp_socket_t;
const union_unnamed_80 = extern union {
    ok: wasi_sockets_0_2_0_udp_create_socket_own_udp_socket_t,
    err: wasi_sockets_0_2_0_udp_create_socket_error_code_t,
};
pub const wasi_sockets_0_2_0_udp_create_socket_result_own_udp_socket_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_80 = @import("std").mem.zeroes(union_unnamed_80),
};
pub const wasi_sockets_0_2_0_tcp_duration_t = wasi_clocks_0_2_0_monotonic_clock_duration_t;
pub const wasi_sockets_0_2_0_tcp_error_code_t = wasi_sockets_0_2_0_network_error_code_t;
pub const wasi_sockets_0_2_0_tcp_ip_socket_address_t = wasi_sockets_0_2_0_network_ip_socket_address_t;
pub const wasi_sockets_0_2_0_tcp_ip_address_family_t = wasi_sockets_0_2_0_network_ip_address_family_t;
pub const wasi_sockets_0_2_0_tcp_shutdown_type_t = u8;
pub const struct_wasi_sockets_0_2_0_tcp_own_tcp_socket_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_sockets_0_2_0_tcp_own_tcp_socket_t = struct_wasi_sockets_0_2_0_tcp_own_tcp_socket_t;
pub const struct_wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t = struct_wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t;
pub const wasi_sockets_0_2_0_tcp_borrow_network_t = wasi_sockets_0_2_0_network_borrow_network_t;
const union_unnamed_81 = extern union {
    err: wasi_sockets_0_2_0_tcp_error_code_t,
};
pub const wasi_sockets_0_2_0_tcp_result_void_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_81 = @import("std").mem.zeroes(union_unnamed_81),
};
pub const wasi_sockets_0_2_0_tcp_own_input_stream_t = wasi_io_0_2_0_streams_own_input_stream_t;
pub const wasi_sockets_0_2_0_tcp_own_output_stream_t = wasi_io_0_2_0_streams_own_output_stream_t;
pub const wasi_sockets_0_2_0_tcp_tuple2_own_input_stream_own_output_stream_t = extern struct {
    f0: wasi_sockets_0_2_0_tcp_own_input_stream_t = @import("std").mem.zeroes(wasi_sockets_0_2_0_tcp_own_input_stream_t),
    f1: wasi_sockets_0_2_0_tcp_own_output_stream_t = @import("std").mem.zeroes(wasi_sockets_0_2_0_tcp_own_output_stream_t),
};
const union_unnamed_82 = extern union {
    ok: wasi_sockets_0_2_0_tcp_tuple2_own_input_stream_own_output_stream_t,
    err: wasi_sockets_0_2_0_tcp_error_code_t,
};
pub const wasi_sockets_0_2_0_tcp_result_tuple2_own_input_stream_own_output_stream_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_82 = @import("std").mem.zeroes(union_unnamed_82),
};
pub const wasi_sockets_0_2_0_tcp_tuple3_own_tcp_socket_own_input_stream_own_output_stream_t = extern struct {
    f0: wasi_sockets_0_2_0_tcp_own_tcp_socket_t = @import("std").mem.zeroes(wasi_sockets_0_2_0_tcp_own_tcp_socket_t),
    f1: wasi_sockets_0_2_0_tcp_own_input_stream_t = @import("std").mem.zeroes(wasi_sockets_0_2_0_tcp_own_input_stream_t),
    f2: wasi_sockets_0_2_0_tcp_own_output_stream_t = @import("std").mem.zeroes(wasi_sockets_0_2_0_tcp_own_output_stream_t),
};
const union_unnamed_83 = extern union {
    ok: wasi_sockets_0_2_0_tcp_tuple3_own_tcp_socket_own_input_stream_own_output_stream_t,
    err: wasi_sockets_0_2_0_tcp_error_code_t,
};
pub const wasi_sockets_0_2_0_tcp_result_tuple3_own_tcp_socket_own_input_stream_own_output_stream_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_83 = @import("std").mem.zeroes(union_unnamed_83),
};
const union_unnamed_84 = extern union {
    ok: wasi_sockets_0_2_0_tcp_ip_socket_address_t,
    err: wasi_sockets_0_2_0_tcp_error_code_t,
};
pub const wasi_sockets_0_2_0_tcp_result_ip_socket_address_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_84 = @import("std").mem.zeroes(union_unnamed_84),
};
const union_unnamed_85 = extern union {
    ok: bool,
    err: wasi_sockets_0_2_0_tcp_error_code_t,
};
pub const wasi_sockets_0_2_0_tcp_result_bool_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_85 = @import("std").mem.zeroes(union_unnamed_85),
};
const union_unnamed_86 = extern union {
    ok: wasi_sockets_0_2_0_tcp_duration_t,
    err: wasi_sockets_0_2_0_tcp_error_code_t,
};
pub const wasi_sockets_0_2_0_tcp_result_duration_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_86 = @import("std").mem.zeroes(union_unnamed_86),
};
const union_unnamed_87 = extern union {
    ok: u32,
    err: wasi_sockets_0_2_0_tcp_error_code_t,
};
pub const wasi_sockets_0_2_0_tcp_result_u32_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_87 = @import("std").mem.zeroes(union_unnamed_87),
};
const union_unnamed_88 = extern union {
    ok: u8,
    err: wasi_sockets_0_2_0_tcp_error_code_t,
};
pub const wasi_sockets_0_2_0_tcp_result_u8_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_88 = @import("std").mem.zeroes(union_unnamed_88),
};
const union_unnamed_89 = extern union {
    ok: u64,
    err: wasi_sockets_0_2_0_tcp_error_code_t,
};
pub const wasi_sockets_0_2_0_tcp_result_u64_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_89 = @import("std").mem.zeroes(union_unnamed_89),
};
pub const wasi_sockets_0_2_0_tcp_own_pollable_t = wasi_io_0_2_0_poll_own_pollable_t;
pub const wasi_sockets_0_2_0_tcp_create_socket_error_code_t = wasi_sockets_0_2_0_network_error_code_t;
pub const wasi_sockets_0_2_0_tcp_create_socket_ip_address_family_t = wasi_sockets_0_2_0_network_ip_address_family_t;
pub const wasi_sockets_0_2_0_tcp_create_socket_own_tcp_socket_t = wasi_sockets_0_2_0_tcp_own_tcp_socket_t;
const union_unnamed_90 = extern union {
    ok: wasi_sockets_0_2_0_tcp_create_socket_own_tcp_socket_t,
    err: wasi_sockets_0_2_0_tcp_create_socket_error_code_t,
};
pub const wasi_sockets_0_2_0_tcp_create_socket_result_own_tcp_socket_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_90 = @import("std").mem.zeroes(union_unnamed_90),
};
pub const wasi_sockets_0_2_0_ip_name_lookup_error_code_t = wasi_sockets_0_2_0_network_error_code_t;
pub const wasi_sockets_0_2_0_ip_name_lookup_ip_address_t = wasi_sockets_0_2_0_network_ip_address_t;
pub const struct_wasi_sockets_0_2_0_ip_name_lookup_own_resolve_address_stream_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_sockets_0_2_0_ip_name_lookup_own_resolve_address_stream_t = struct_wasi_sockets_0_2_0_ip_name_lookup_own_resolve_address_stream_t;
pub const struct_wasi_sockets_0_2_0_ip_name_lookup_borrow_resolve_address_stream_t = extern struct {
    __handle: i32 = @import("std").mem.zeroes(i32),
};
pub const wasi_sockets_0_2_0_ip_name_lookup_borrow_resolve_address_stream_t = struct_wasi_sockets_0_2_0_ip_name_lookup_borrow_resolve_address_stream_t;
pub const wasi_sockets_0_2_0_ip_name_lookup_borrow_network_t = wasi_sockets_0_2_0_network_borrow_network_t;
const union_unnamed_91 = extern union {
    ok: wasi_sockets_0_2_0_ip_name_lookup_own_resolve_address_stream_t,
    err: wasi_sockets_0_2_0_ip_name_lookup_error_code_t,
};
pub const wasi_sockets_0_2_0_ip_name_lookup_result_own_resolve_address_stream_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_91 = @import("std").mem.zeroes(union_unnamed_91),
};
pub const wasi_sockets_0_2_0_ip_name_lookup_option_ip_address_t = extern struct {
    is_some: bool = @import("std").mem.zeroes(bool),
    val: wasi_sockets_0_2_0_ip_name_lookup_ip_address_t = @import("std").mem.zeroes(wasi_sockets_0_2_0_ip_name_lookup_ip_address_t),
};
const union_unnamed_92 = extern union {
    ok: wasi_sockets_0_2_0_ip_name_lookup_option_ip_address_t,
    err: wasi_sockets_0_2_0_ip_name_lookup_error_code_t,
};
pub const wasi_sockets_0_2_0_ip_name_lookup_result_option_ip_address_error_code_t = extern struct {
    is_err: bool = @import("std").mem.zeroes(bool),
    val: union_unnamed_92 = @import("std").mem.zeroes(union_unnamed_92),
};
pub const wasi_sockets_0_2_0_ip_name_lookup_own_pollable_t = wasi_io_0_2_0_poll_own_pollable_t;
pub const http_trigger_tuple2_u64_u64_t = extern struct {
    f0: u64 = @import("std").mem.zeroes(u64),
    f1: u64 = @import("std").mem.zeroes(u64),
};
pub const exports_wasi_http_0_2_0_incoming_handler_own_incoming_request_t = wasi_http_0_2_0_types_own_incoming_request_t;
pub const exports_wasi_http_0_2_0_incoming_handler_own_response_outparam_t = wasi_http_0_2_0_types_own_response_outparam_t;
pub extern fn wasi_io_0_2_0_poll_method_pollable_ready(self: wasi_io_0_2_0_poll_borrow_pollable_t) bool;
pub extern fn wasi_io_0_2_0_poll_method_pollable_block(self: wasi_io_0_2_0_poll_borrow_pollable_t) void;
pub extern fn wasi_io_0_2_0_poll_poll(in: [*c]wasi_io_0_2_0_poll_list_borrow_pollable_t, ret: [*c]http_trigger_list_u32_t) void;
pub extern fn wasi_clocks_0_2_0_monotonic_clock_now() wasi_clocks_0_2_0_monotonic_clock_instant_t;
pub extern fn wasi_clocks_0_2_0_monotonic_clock_resolution() wasi_clocks_0_2_0_monotonic_clock_duration_t;
pub extern fn wasi_clocks_0_2_0_monotonic_clock_subscribe_instant(when: wasi_clocks_0_2_0_monotonic_clock_instant_t) wasi_clocks_0_2_0_monotonic_clock_own_pollable_t;
pub extern fn wasi_clocks_0_2_0_monotonic_clock_subscribe_duration(when: wasi_clocks_0_2_0_monotonic_clock_duration_t) wasi_clocks_0_2_0_monotonic_clock_own_pollable_t;
pub extern fn wasi_io_0_2_0_error_method_error_to_debug_string(self: wasi_io_0_2_0_error_borrow_error_t, ret: [*c]http_trigger_string_t) void;
pub extern fn wasi_io_0_2_0_streams_method_input_stream_read(self: wasi_io_0_2_0_streams_borrow_input_stream_t, len: u64, ret: [*c]http_trigger_list_u8_t, err: [*c]wasi_io_0_2_0_streams_stream_error_t) bool;
pub extern fn wasi_io_0_2_0_streams_method_input_stream_blocking_read(self: wasi_io_0_2_0_streams_borrow_input_stream_t, len: u64, ret: [*c]http_trigger_list_u8_t, err: [*c]wasi_io_0_2_0_streams_stream_error_t) bool;
pub extern fn wasi_io_0_2_0_streams_method_input_stream_skip(self: wasi_io_0_2_0_streams_borrow_input_stream_t, len: u64, ret: [*c]u64, err: [*c]wasi_io_0_2_0_streams_stream_error_t) bool;
pub extern fn wasi_io_0_2_0_streams_method_input_stream_blocking_skip(self: wasi_io_0_2_0_streams_borrow_input_stream_t, len: u64, ret: [*c]u64, err: [*c]wasi_io_0_2_0_streams_stream_error_t) bool;
pub extern fn wasi_io_0_2_0_streams_method_input_stream_subscribe(self: wasi_io_0_2_0_streams_borrow_input_stream_t) wasi_io_0_2_0_streams_own_pollable_t;
pub extern fn wasi_io_0_2_0_streams_method_output_stream_check_write(self: wasi_io_0_2_0_streams_borrow_output_stream_t, ret: [*c]u64, err: [*c]wasi_io_0_2_0_streams_stream_error_t) bool;
pub extern fn wasi_io_0_2_0_streams_method_output_stream_write(self: wasi_io_0_2_0_streams_borrow_output_stream_t, contents: [*c]http_trigger_list_u8_t, err: [*c]wasi_io_0_2_0_streams_stream_error_t) bool;
pub extern fn wasi_io_0_2_0_streams_method_output_stream_blocking_write_and_flush(self: wasi_io_0_2_0_streams_borrow_output_stream_t, contents: [*c]http_trigger_list_u8_t, err: [*c]wasi_io_0_2_0_streams_stream_error_t) bool;
pub extern fn wasi_io_0_2_0_streams_method_output_stream_flush(self: wasi_io_0_2_0_streams_borrow_output_stream_t, err: [*c]wasi_io_0_2_0_streams_stream_error_t) bool;
pub extern fn wasi_io_0_2_0_streams_method_output_stream_blocking_flush(self: wasi_io_0_2_0_streams_borrow_output_stream_t, err: [*c]wasi_io_0_2_0_streams_stream_error_t) bool;
pub extern fn wasi_io_0_2_0_streams_method_output_stream_subscribe(self: wasi_io_0_2_0_streams_borrow_output_stream_t) wasi_io_0_2_0_streams_own_pollable_t;
pub extern fn wasi_io_0_2_0_streams_method_output_stream_write_zeroes(self: wasi_io_0_2_0_streams_borrow_output_stream_t, len: u64, err: [*c]wasi_io_0_2_0_streams_stream_error_t) bool;
pub extern fn wasi_io_0_2_0_streams_method_output_stream_blocking_write_zeroes_and_flush(self: wasi_io_0_2_0_streams_borrow_output_stream_t, len: u64, err: [*c]wasi_io_0_2_0_streams_stream_error_t) bool;
pub extern fn wasi_io_0_2_0_streams_method_output_stream_splice(self: wasi_io_0_2_0_streams_borrow_output_stream_t, src: wasi_io_0_2_0_streams_borrow_input_stream_t, len: u64, ret: [*c]u64, err: [*c]wasi_io_0_2_0_streams_stream_error_t) bool;
pub extern fn wasi_io_0_2_0_streams_method_output_stream_blocking_splice(self: wasi_io_0_2_0_streams_borrow_output_stream_t, src: wasi_io_0_2_0_streams_borrow_input_stream_t, len: u64, ret: [*c]u64, err: [*c]wasi_io_0_2_0_streams_stream_error_t) bool;
pub extern fn wasi_http_0_2_0_types_http_error_code(err_: wasi_http_0_2_0_types_borrow_io_error_t, ret: [*c]wasi_http_0_2_0_types_error_code_t) bool;
pub extern fn wasi_http_0_2_0_types_constructor_fields() wasi_http_0_2_0_types_own_fields_t;
pub extern fn wasi_http_0_2_0_types_static_fields_from_list(entries: [*c]http_trigger_list_tuple2_field_key_field_value_t, ret: [*c]wasi_http_0_2_0_types_own_fields_t, err: [*c]wasi_http_0_2_0_types_header_error_t) bool;
pub extern fn wasi_http_0_2_0_types_method_fields_get(self: wasi_http_0_2_0_types_borrow_fields_t, name: [*c]wasi_http_0_2_0_types_field_key_t, ret: [*c]http_trigger_list_field_value_t) void;
pub extern fn wasi_http_0_2_0_types_method_fields_has(self: wasi_http_0_2_0_types_borrow_fields_t, name: [*c]wasi_http_0_2_0_types_field_key_t) bool;
pub extern fn wasi_http_0_2_0_types_method_fields_set(self: wasi_http_0_2_0_types_borrow_fields_t, name: [*c]wasi_http_0_2_0_types_field_key_t, value: [*c]http_trigger_list_field_value_t, err: [*c]wasi_http_0_2_0_types_header_error_t) bool;
pub extern fn wasi_http_0_2_0_types_method_fields_delete(self: wasi_http_0_2_0_types_borrow_fields_t, name: [*c]wasi_http_0_2_0_types_field_key_t, err: [*c]wasi_http_0_2_0_types_header_error_t) bool;
pub extern fn wasi_http_0_2_0_types_method_fields_append(self: wasi_http_0_2_0_types_borrow_fields_t, name: [*c]wasi_http_0_2_0_types_field_key_t, value: [*c]wasi_http_0_2_0_types_field_value_t, err: [*c]wasi_http_0_2_0_types_header_error_t) bool;
pub extern fn wasi_http_0_2_0_types_method_fields_entries(self: wasi_http_0_2_0_types_borrow_fields_t, ret: [*c]http_trigger_list_tuple2_field_key_field_value_t) void;
pub extern fn wasi_http_0_2_0_types_method_fields_clone(self: wasi_http_0_2_0_types_borrow_fields_t) wasi_http_0_2_0_types_own_fields_t;
pub extern fn wasi_http_0_2_0_types_method_incoming_request_method(self: wasi_http_0_2_0_types_borrow_incoming_request_t, ret: [*c]wasi_http_0_2_0_types_method_t) void;
pub extern fn wasi_http_0_2_0_types_method_incoming_request_path_with_query(self: wasi_http_0_2_0_types_borrow_incoming_request_t, ret: [*c]http_trigger_string_t) bool;
pub extern fn wasi_http_0_2_0_types_method_incoming_request_scheme(self: wasi_http_0_2_0_types_borrow_incoming_request_t, ret: [*c]wasi_http_0_2_0_types_scheme_t) bool;
pub extern fn wasi_http_0_2_0_types_method_incoming_request_authority(self: wasi_http_0_2_0_types_borrow_incoming_request_t, ret: [*c]http_trigger_string_t) bool;
pub extern fn wasi_http_0_2_0_types_method_incoming_request_headers(self: wasi_http_0_2_0_types_borrow_incoming_request_t) wasi_http_0_2_0_types_own_headers_t;
pub extern fn wasi_http_0_2_0_types_method_incoming_request_consume(self: wasi_http_0_2_0_types_borrow_incoming_request_t, ret: [*c]wasi_http_0_2_0_types_own_incoming_body_t) bool;
pub extern fn wasi_http_0_2_0_types_constructor_outgoing_request(headers: wasi_http_0_2_0_types_own_headers_t) wasi_http_0_2_0_types_own_outgoing_request_t;
pub extern fn wasi_http_0_2_0_types_method_outgoing_request_body(self: wasi_http_0_2_0_types_borrow_outgoing_request_t, ret: [*c]wasi_http_0_2_0_types_own_outgoing_body_t) bool;
pub extern fn wasi_http_0_2_0_types_method_outgoing_request_method(self: wasi_http_0_2_0_types_borrow_outgoing_request_t, ret: [*c]wasi_http_0_2_0_types_method_t) void;
pub extern fn wasi_http_0_2_0_types_method_outgoing_request_set_method(self: wasi_http_0_2_0_types_borrow_outgoing_request_t, method: [*c]wasi_http_0_2_0_types_method_t) bool;
pub extern fn wasi_http_0_2_0_types_method_outgoing_request_path_with_query(self: wasi_http_0_2_0_types_borrow_outgoing_request_t, ret: [*c]http_trigger_string_t) bool;
pub extern fn wasi_http_0_2_0_types_method_outgoing_request_set_path_with_query(self: wasi_http_0_2_0_types_borrow_outgoing_request_t, maybe_path_with_query: [*c]http_trigger_string_t) bool;
pub extern fn wasi_http_0_2_0_types_method_outgoing_request_scheme(self: wasi_http_0_2_0_types_borrow_outgoing_request_t, ret: [*c]wasi_http_0_2_0_types_scheme_t) bool;
pub extern fn wasi_http_0_2_0_types_method_outgoing_request_set_scheme(self: wasi_http_0_2_0_types_borrow_outgoing_request_t, maybe_scheme: [*c]wasi_http_0_2_0_types_scheme_t) bool;
pub extern fn wasi_http_0_2_0_types_method_outgoing_request_authority(self: wasi_http_0_2_0_types_borrow_outgoing_request_t, ret: [*c]http_trigger_string_t) bool;
pub extern fn wasi_http_0_2_0_types_method_outgoing_request_set_authority(self: wasi_http_0_2_0_types_borrow_outgoing_request_t, maybe_authority: [*c]http_trigger_string_t) bool;
pub extern fn wasi_http_0_2_0_types_method_outgoing_request_headers(self: wasi_http_0_2_0_types_borrow_outgoing_request_t) wasi_http_0_2_0_types_own_headers_t;
pub extern fn wasi_http_0_2_0_types_constructor_request_options() wasi_http_0_2_0_types_own_request_options_t;
pub extern fn wasi_http_0_2_0_types_method_request_options_connect_timeout(self: wasi_http_0_2_0_types_borrow_request_options_t, ret: [*c]wasi_http_0_2_0_types_duration_t) bool;
pub extern fn wasi_http_0_2_0_types_method_request_options_set_connect_timeout(self: wasi_http_0_2_0_types_borrow_request_options_t, maybe_duration: [*c]wasi_http_0_2_0_types_duration_t) bool;
pub extern fn wasi_http_0_2_0_types_method_request_options_first_byte_timeout(self: wasi_http_0_2_0_types_borrow_request_options_t, ret: [*c]wasi_http_0_2_0_types_duration_t) bool;
pub extern fn wasi_http_0_2_0_types_method_request_options_set_first_byte_timeout(self: wasi_http_0_2_0_types_borrow_request_options_t, maybe_duration: [*c]wasi_http_0_2_0_types_duration_t) bool;
pub extern fn wasi_http_0_2_0_types_method_request_options_between_bytes_timeout(self: wasi_http_0_2_0_types_borrow_request_options_t, ret: [*c]wasi_http_0_2_0_types_duration_t) bool;
pub extern fn wasi_http_0_2_0_types_method_request_options_set_between_bytes_timeout(self: wasi_http_0_2_0_types_borrow_request_options_t, maybe_duration: [*c]wasi_http_0_2_0_types_duration_t) bool;
pub extern fn wasi_http_0_2_0_types_static_response_outparam_set(param: wasi_http_0_2_0_types_own_response_outparam_t, response: [*c]wasi_http_0_2_0_types_result_own_outgoing_response_error_code_t) void;
pub extern fn wasi_http_0_2_0_types_method_incoming_response_status(self: wasi_http_0_2_0_types_borrow_incoming_response_t) wasi_http_0_2_0_types_status_code_t;
pub extern fn wasi_http_0_2_0_types_method_incoming_response_headers(self: wasi_http_0_2_0_types_borrow_incoming_response_t) wasi_http_0_2_0_types_own_headers_t;
pub extern fn wasi_http_0_2_0_types_method_incoming_response_consume(self: wasi_http_0_2_0_types_borrow_incoming_response_t, ret: [*c]wasi_http_0_2_0_types_own_incoming_body_t) bool;
pub extern fn wasi_http_0_2_0_types_method_incoming_body_stream(self: wasi_http_0_2_0_types_borrow_incoming_body_t, ret: [*c]wasi_http_0_2_0_types_own_input_stream_t) bool;
pub extern fn wasi_http_0_2_0_types_static_incoming_body_finish(this_: wasi_http_0_2_0_types_own_incoming_body_t) wasi_http_0_2_0_types_own_future_trailers_t;
pub extern fn wasi_http_0_2_0_types_method_future_trailers_subscribe(self: wasi_http_0_2_0_types_borrow_future_trailers_t) wasi_http_0_2_0_types_own_pollable_t;
pub extern fn wasi_http_0_2_0_types_method_future_trailers_get(self: wasi_http_0_2_0_types_borrow_future_trailers_t, ret: [*c]wasi_http_0_2_0_types_result_result_option_own_trailers_error_code_void_t) bool;
pub extern fn wasi_http_0_2_0_types_constructor_outgoing_response(headers: wasi_http_0_2_0_types_own_headers_t) wasi_http_0_2_0_types_own_outgoing_response_t;
pub extern fn wasi_http_0_2_0_types_method_outgoing_response_status_code(self: wasi_http_0_2_0_types_borrow_outgoing_response_t) wasi_http_0_2_0_types_status_code_t;
pub extern fn wasi_http_0_2_0_types_method_outgoing_response_set_status_code(self: wasi_http_0_2_0_types_borrow_outgoing_response_t, status_code: wasi_http_0_2_0_types_status_code_t) bool;
pub extern fn wasi_http_0_2_0_types_method_outgoing_response_headers(self: wasi_http_0_2_0_types_borrow_outgoing_response_t) wasi_http_0_2_0_types_own_headers_t;
pub extern fn wasi_http_0_2_0_types_method_outgoing_response_body(self: wasi_http_0_2_0_types_borrow_outgoing_response_t, ret: [*c]wasi_http_0_2_0_types_own_outgoing_body_t) bool;
pub extern fn wasi_http_0_2_0_types_method_outgoing_body_write(self: wasi_http_0_2_0_types_borrow_outgoing_body_t, ret: [*c]wasi_http_0_2_0_types_own_output_stream_t) bool;
pub extern fn wasi_http_0_2_0_types_static_outgoing_body_finish(this_: wasi_http_0_2_0_types_own_outgoing_body_t, maybe_trailers: [*c]wasi_http_0_2_0_types_own_trailers_t, err: [*c]wasi_http_0_2_0_types_error_code_t) bool;
pub extern fn wasi_http_0_2_0_types_method_future_incoming_response_subscribe(self: wasi_http_0_2_0_types_borrow_future_incoming_response_t) wasi_http_0_2_0_types_own_pollable_t;
pub extern fn wasi_http_0_2_0_types_method_future_incoming_response_get(self: wasi_http_0_2_0_types_borrow_future_incoming_response_t, ret: [*c]wasi_http_0_2_0_types_result_result_own_incoming_response_error_code_void_t) bool;
pub extern fn wasi_http_0_2_0_outgoing_handler_handle(request: wasi_http_0_2_0_outgoing_handler_own_outgoing_request_t, maybe_options: [*c]wasi_http_0_2_0_outgoing_handler_own_request_options_t, ret: [*c]wasi_http_0_2_0_outgoing_handler_own_future_incoming_response_t, err: [*c]wasi_http_0_2_0_outgoing_handler_error_code_t) bool;
pub extern fn fermyon_spin_2_0_0_llm_infer(model: [*c]fermyon_spin_2_0_0_llm_inferencing_model_t, prompt: [*c]http_trigger_string_t, maybe_params: [*c]fermyon_spin_2_0_0_llm_inferencing_params_t, ret: [*c]fermyon_spin_2_0_0_llm_inferencing_result_t, err: [*c]fermyon_spin_2_0_0_llm_error_t) bool;
pub extern fn fermyon_spin_2_0_0_llm_generate_embeddings(model: [*c]fermyon_spin_2_0_0_llm_embedding_model_t, text: [*c]http_trigger_list_string_t, ret: [*c]fermyon_spin_2_0_0_llm_embeddings_result_t, err: [*c]fermyon_spin_2_0_0_llm_error_t) bool;
pub extern fn fermyon_spin_2_0_0_redis_static_connection_open(address: [*c]http_trigger_string_t, ret: [*c]fermyon_spin_2_0_0_redis_own_connection_t, err: [*c]fermyon_spin_2_0_0_redis_error_t) bool;
pub extern fn fermyon_spin_2_0_0_redis_method_connection_publish(self: fermyon_spin_2_0_0_redis_borrow_connection_t, channel: [*c]http_trigger_string_t, payload: [*c]fermyon_spin_2_0_0_redis_payload_t, err: [*c]fermyon_spin_2_0_0_redis_error_t) bool;
pub extern fn fermyon_spin_2_0_0_redis_method_connection_get(self: fermyon_spin_2_0_0_redis_borrow_connection_t, key: [*c]http_trigger_string_t, ret: [*c]http_trigger_option_payload_t, err: [*c]fermyon_spin_2_0_0_redis_error_t) bool;
pub extern fn fermyon_spin_2_0_0_redis_method_connection_set(self: fermyon_spin_2_0_0_redis_borrow_connection_t, key: [*c]http_trigger_string_t, value: [*c]fermyon_spin_2_0_0_redis_payload_t, err: [*c]fermyon_spin_2_0_0_redis_error_t) bool;
pub extern fn fermyon_spin_2_0_0_redis_method_connection_incr(self: fermyon_spin_2_0_0_redis_borrow_connection_t, key: [*c]http_trigger_string_t, ret: [*c]i64, err: [*c]fermyon_spin_2_0_0_redis_error_t) bool;
pub extern fn fermyon_spin_2_0_0_redis_method_connection_del(self: fermyon_spin_2_0_0_redis_borrow_connection_t, keys: [*c]http_trigger_list_string_t, ret: [*c]u32, err: [*c]fermyon_spin_2_0_0_redis_error_t) bool;
pub extern fn fermyon_spin_2_0_0_redis_method_connection_sadd(self: fermyon_spin_2_0_0_redis_borrow_connection_t, key: [*c]http_trigger_string_t, values: [*c]http_trigger_list_string_t, ret: [*c]u32, err: [*c]fermyon_spin_2_0_0_redis_error_t) bool;
pub extern fn fermyon_spin_2_0_0_redis_method_connection_smembers(self: fermyon_spin_2_0_0_redis_borrow_connection_t, key: [*c]http_trigger_string_t, ret: [*c]http_trigger_list_string_t, err: [*c]fermyon_spin_2_0_0_redis_error_t) bool;
pub extern fn fermyon_spin_2_0_0_redis_method_connection_srem(self: fermyon_spin_2_0_0_redis_borrow_connection_t, key: [*c]http_trigger_string_t, values: [*c]http_trigger_list_string_t, ret: [*c]u32, err: [*c]fermyon_spin_2_0_0_redis_error_t) bool;
pub extern fn fermyon_spin_2_0_0_redis_method_connection_execute(self: fermyon_spin_2_0_0_redis_borrow_connection_t, command: [*c]http_trigger_string_t, arguments: [*c]fermyon_spin_2_0_0_redis_list_redis_parameter_t, ret: [*c]fermyon_spin_2_0_0_redis_list_redis_result_t, err: [*c]fermyon_spin_2_0_0_redis_error_t) bool;
pub extern fn fermyon_spin_2_0_0_mqtt_static_connection_open(address: [*c]http_trigger_string_t, username: [*c]http_trigger_string_t, password: [*c]http_trigger_string_t, keep_alive_interval_in_secs: u64, ret: [*c]fermyon_spin_2_0_0_mqtt_own_connection_t, err: [*c]fermyon_spin_2_0_0_mqtt_error_t) bool;
pub extern fn fermyon_spin_2_0_0_mqtt_method_connection_publish(self: fermyon_spin_2_0_0_mqtt_borrow_connection_t, topic: [*c]http_trigger_string_t, payload: [*c]fermyon_spin_2_0_0_mqtt_payload_t, qos: fermyon_spin_2_0_0_mqtt_qos_t, err: [*c]fermyon_spin_2_0_0_mqtt_error_t) bool;
pub extern fn fermyon_spin_2_0_0_postgres_static_connection_open(address: [*c]http_trigger_string_t, ret: [*c]fermyon_spin_2_0_0_postgres_own_connection_t, err: [*c]fermyon_spin_2_0_0_postgres_error_t) bool;
pub extern fn fermyon_spin_2_0_0_postgres_method_connection_query(self: fermyon_spin_2_0_0_postgres_borrow_connection_t, statement: [*c]http_trigger_string_t, params: [*c]fermyon_spin_2_0_0_postgres_list_parameter_value_t, ret: [*c]fermyon_spin_2_0_0_postgres_row_set_t, err: [*c]fermyon_spin_2_0_0_postgres_error_t) bool;
pub extern fn fermyon_spin_2_0_0_postgres_method_connection_execute(self: fermyon_spin_2_0_0_postgres_borrow_connection_t, statement: [*c]http_trigger_string_t, params: [*c]fermyon_spin_2_0_0_postgres_list_parameter_value_t, ret: [*c]u64, err: [*c]fermyon_spin_2_0_0_postgres_error_t) bool;
pub extern fn fermyon_spin_2_0_0_mysql_static_connection_open(address: [*c]http_trigger_string_t, ret: [*c]fermyon_spin_2_0_0_mysql_own_connection_t, err: [*c]fermyon_spin_2_0_0_mysql_error_t) bool;
pub extern fn fermyon_spin_2_0_0_mysql_method_connection_query(self: fermyon_spin_2_0_0_mysql_borrow_connection_t, statement: [*c]http_trigger_string_t, params: [*c]fermyon_spin_2_0_0_mysql_list_parameter_value_t, ret: [*c]fermyon_spin_2_0_0_mysql_row_set_t, err: [*c]fermyon_spin_2_0_0_mysql_error_t) bool;
pub extern fn fermyon_spin_2_0_0_mysql_method_connection_execute(self: fermyon_spin_2_0_0_mysql_borrow_connection_t, statement: [*c]http_trigger_string_t, params: [*c]fermyon_spin_2_0_0_mysql_list_parameter_value_t, err: [*c]fermyon_spin_2_0_0_mysql_error_t) bool;
pub extern fn fermyon_spin_2_0_0_sqlite_static_connection_open(database: [*c]http_trigger_string_t, ret: [*c]fermyon_spin_2_0_0_sqlite_own_connection_t, err: [*c]fermyon_spin_2_0_0_sqlite_error_t) bool;
pub extern fn fermyon_spin_2_0_0_sqlite_method_connection_execute(self: fermyon_spin_2_0_0_sqlite_borrow_connection_t, statement: [*c]http_trigger_string_t, parameters: [*c]fermyon_spin_2_0_0_sqlite_list_value_t, ret: [*c]fermyon_spin_2_0_0_sqlite_query_result_t, err: [*c]fermyon_spin_2_0_0_sqlite_error_t) bool;
pub extern fn fermyon_spin_2_0_0_key_value_static_store_open(label: [*c]http_trigger_string_t, ret: [*c]fermyon_spin_2_0_0_key_value_own_store_t, err: [*c]fermyon_spin_2_0_0_key_value_error_t) bool;
pub extern fn fermyon_spin_2_0_0_key_value_method_store_get(self: fermyon_spin_2_0_0_key_value_borrow_store_t, key: [*c]http_trigger_string_t, ret: [*c]http_trigger_option_list_u8_t, err: [*c]fermyon_spin_2_0_0_key_value_error_t) bool;
pub extern fn fermyon_spin_2_0_0_key_value_method_store_set(self: fermyon_spin_2_0_0_key_value_borrow_store_t, key: [*c]http_trigger_string_t, value: [*c]http_trigger_list_u8_t, err: [*c]fermyon_spin_2_0_0_key_value_error_t) bool;
pub extern fn fermyon_spin_2_0_0_key_value_method_store_delete(self: fermyon_spin_2_0_0_key_value_borrow_store_t, key: [*c]http_trigger_string_t, err: [*c]fermyon_spin_2_0_0_key_value_error_t) bool;
pub extern fn fermyon_spin_2_0_0_key_value_method_store_exists(self: fermyon_spin_2_0_0_key_value_borrow_store_t, key: [*c]http_trigger_string_t, ret: [*c]bool, err: [*c]fermyon_spin_2_0_0_key_value_error_t) bool;
pub extern fn fermyon_spin_2_0_0_key_value_method_store_get_keys(self: fermyon_spin_2_0_0_key_value_borrow_store_t, ret: [*c]http_trigger_list_string_t, err: [*c]fermyon_spin_2_0_0_key_value_error_t) bool;
pub extern fn fermyon_spin_2_0_0_variables_get(name: [*c]http_trigger_string_t, ret: [*c]http_trigger_string_t, err: [*c]fermyon_spin_2_0_0_variables_error_t) bool;
pub extern fn wasi_cli_0_2_0_environment_get_environment(ret: [*c]http_trigger_list_tuple2_string_string_t) void;
pub extern fn wasi_cli_0_2_0_environment_get_arguments(ret: [*c]http_trigger_list_string_t) void;
pub extern fn wasi_cli_0_2_0_environment_initial_cwd(ret: [*c]http_trigger_string_t) bool;
pub extern fn wasi_cli_0_2_0_exit_exit(status: [*c]wasi_cli_0_2_0_exit_result_void_void_t) void;
pub extern fn wasi_cli_0_2_0_stdin_get_stdin() wasi_cli_0_2_0_stdin_own_input_stream_t;
pub extern fn wasi_cli_0_2_0_stdout_get_stdout() wasi_cli_0_2_0_stdout_own_output_stream_t;
pub extern fn wasi_cli_0_2_0_stderr_get_stderr() wasi_cli_0_2_0_stderr_own_output_stream_t;
pub extern fn wasi_cli_0_2_0_terminal_stdin_get_terminal_stdin(ret: [*c]wasi_cli_0_2_0_terminal_stdin_own_terminal_input_t) bool;
pub extern fn wasi_cli_0_2_0_terminal_stdout_get_terminal_stdout(ret: [*c]wasi_cli_0_2_0_terminal_stdout_own_terminal_output_t) bool;
pub extern fn wasi_cli_0_2_0_terminal_stderr_get_terminal_stderr(ret: [*c]wasi_cli_0_2_0_terminal_stderr_own_terminal_output_t) bool;
pub extern fn wasi_clocks_0_2_0_wall_clock_now(ret: [*c]wasi_clocks_0_2_0_wall_clock_datetime_t) void;
pub extern fn wasi_clocks_0_2_0_wall_clock_resolution(ret: [*c]wasi_clocks_0_2_0_wall_clock_datetime_t) void;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_read_via_stream(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, offset: wasi_filesystem_0_2_0_types_filesize_t, ret: [*c]wasi_filesystem_0_2_0_types_own_input_stream_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_write_via_stream(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, offset: wasi_filesystem_0_2_0_types_filesize_t, ret: [*c]wasi_filesystem_0_2_0_types_own_output_stream_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_append_via_stream(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, ret: [*c]wasi_filesystem_0_2_0_types_own_output_stream_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_advise(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, offset: wasi_filesystem_0_2_0_types_filesize_t, length: wasi_filesystem_0_2_0_types_filesize_t, advice: wasi_filesystem_0_2_0_types_advice_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_sync_data(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_get_flags(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, ret: [*c]wasi_filesystem_0_2_0_types_descriptor_flags_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_get_type(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, ret: [*c]wasi_filesystem_0_2_0_types_descriptor_type_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_set_size(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, size: wasi_filesystem_0_2_0_types_filesize_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_set_times(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, data_access_timestamp: [*c]wasi_filesystem_0_2_0_types_new_timestamp_t, data_modification_timestamp: [*c]wasi_filesystem_0_2_0_types_new_timestamp_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_read(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, length: wasi_filesystem_0_2_0_types_filesize_t, offset: wasi_filesystem_0_2_0_types_filesize_t, ret: [*c]http_trigger_tuple2_list_u8_bool_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_write(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, buffer: [*c]http_trigger_list_u8_t, offset: wasi_filesystem_0_2_0_types_filesize_t, ret: [*c]wasi_filesystem_0_2_0_types_filesize_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_read_directory(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, ret: [*c]wasi_filesystem_0_2_0_types_own_directory_entry_stream_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_sync(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_create_directory_at(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, path: [*c]http_trigger_string_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_stat(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, ret: [*c]wasi_filesystem_0_2_0_types_descriptor_stat_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_stat_at(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, path_flags: wasi_filesystem_0_2_0_types_path_flags_t, path: [*c]http_trigger_string_t, ret: [*c]wasi_filesystem_0_2_0_types_descriptor_stat_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_set_times_at(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, path_flags: wasi_filesystem_0_2_0_types_path_flags_t, path: [*c]http_trigger_string_t, data_access_timestamp: [*c]wasi_filesystem_0_2_0_types_new_timestamp_t, data_modification_timestamp: [*c]wasi_filesystem_0_2_0_types_new_timestamp_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_link_at(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, old_path_flags: wasi_filesystem_0_2_0_types_path_flags_t, old_path: [*c]http_trigger_string_t, new_descriptor: wasi_filesystem_0_2_0_types_borrow_descriptor_t, new_path: [*c]http_trigger_string_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_open_at(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, path_flags: wasi_filesystem_0_2_0_types_path_flags_t, path: [*c]http_trigger_string_t, open_flags: wasi_filesystem_0_2_0_types_open_flags_t, flags: wasi_filesystem_0_2_0_types_descriptor_flags_t, ret: [*c]wasi_filesystem_0_2_0_types_own_descriptor_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_readlink_at(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, path: [*c]http_trigger_string_t, ret: [*c]http_trigger_string_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_remove_directory_at(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, path: [*c]http_trigger_string_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_rename_at(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, old_path: [*c]http_trigger_string_t, new_descriptor: wasi_filesystem_0_2_0_types_borrow_descriptor_t, new_path: [*c]http_trigger_string_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_symlink_at(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, old_path: [*c]http_trigger_string_t, new_path: [*c]http_trigger_string_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_unlink_file_at(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, path: [*c]http_trigger_string_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_is_same_object(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, other: wasi_filesystem_0_2_0_types_borrow_descriptor_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_metadata_hash(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, ret: [*c]wasi_filesystem_0_2_0_types_metadata_hash_value_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_descriptor_metadata_hash_at(self: wasi_filesystem_0_2_0_types_borrow_descriptor_t, path_flags: wasi_filesystem_0_2_0_types_path_flags_t, path: [*c]http_trigger_string_t, ret: [*c]wasi_filesystem_0_2_0_types_metadata_hash_value_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_method_directory_entry_stream_read_directory_entry(self: wasi_filesystem_0_2_0_types_borrow_directory_entry_stream_t, ret: [*c]wasi_filesystem_0_2_0_types_option_directory_entry_t, err: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_types_filesystem_error_code(err_: wasi_filesystem_0_2_0_types_borrow_error_t, ret: [*c]wasi_filesystem_0_2_0_types_error_code_t) bool;
pub extern fn wasi_filesystem_0_2_0_preopens_get_directories(ret: [*c]wasi_filesystem_0_2_0_preopens_list_tuple2_own_descriptor_string_t) void;
pub extern fn wasi_sockets_0_2_0_instance_network_instance_network() wasi_sockets_0_2_0_instance_network_own_network_t;
pub extern fn wasi_sockets_0_2_0_udp_method_udp_socket_start_bind(self: wasi_sockets_0_2_0_udp_borrow_udp_socket_t, network: wasi_sockets_0_2_0_udp_borrow_network_t, local_address: [*c]wasi_sockets_0_2_0_udp_ip_socket_address_t, err: [*c]wasi_sockets_0_2_0_udp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_udp_method_udp_socket_finish_bind(self: wasi_sockets_0_2_0_udp_borrow_udp_socket_t, err: [*c]wasi_sockets_0_2_0_udp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_udp_method_udp_socket_stream(self: wasi_sockets_0_2_0_udp_borrow_udp_socket_t, maybe_remote_address: [*c]wasi_sockets_0_2_0_udp_ip_socket_address_t, ret: [*c]wasi_sockets_0_2_0_udp_tuple2_own_incoming_datagram_stream_own_outgoing_datagram_stream_t, err: [*c]wasi_sockets_0_2_0_udp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_udp_method_udp_socket_local_address(self: wasi_sockets_0_2_0_udp_borrow_udp_socket_t, ret: [*c]wasi_sockets_0_2_0_udp_ip_socket_address_t, err: [*c]wasi_sockets_0_2_0_udp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_udp_method_udp_socket_remote_address(self: wasi_sockets_0_2_0_udp_borrow_udp_socket_t, ret: [*c]wasi_sockets_0_2_0_udp_ip_socket_address_t, err: [*c]wasi_sockets_0_2_0_udp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_udp_method_udp_socket_address_family(self: wasi_sockets_0_2_0_udp_borrow_udp_socket_t) wasi_sockets_0_2_0_udp_ip_address_family_t;
pub extern fn wasi_sockets_0_2_0_udp_method_udp_socket_unicast_hop_limit(self: wasi_sockets_0_2_0_udp_borrow_udp_socket_t, ret: [*c]u8, err: [*c]wasi_sockets_0_2_0_udp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_udp_method_udp_socket_set_unicast_hop_limit(self: wasi_sockets_0_2_0_udp_borrow_udp_socket_t, value: u8, err: [*c]wasi_sockets_0_2_0_udp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_udp_method_udp_socket_receive_buffer_size(self: wasi_sockets_0_2_0_udp_borrow_udp_socket_t, ret: [*c]u64, err: [*c]wasi_sockets_0_2_0_udp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_udp_method_udp_socket_set_receive_buffer_size(self: wasi_sockets_0_2_0_udp_borrow_udp_socket_t, value: u64, err: [*c]wasi_sockets_0_2_0_udp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_udp_method_udp_socket_send_buffer_size(self: wasi_sockets_0_2_0_udp_borrow_udp_socket_t, ret: [*c]u64, err: [*c]wasi_sockets_0_2_0_udp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_udp_method_udp_socket_set_send_buffer_size(self: wasi_sockets_0_2_0_udp_borrow_udp_socket_t, value: u64, err: [*c]wasi_sockets_0_2_0_udp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_udp_method_udp_socket_subscribe(self: wasi_sockets_0_2_0_udp_borrow_udp_socket_t) wasi_sockets_0_2_0_udp_own_pollable_t;
pub extern fn wasi_sockets_0_2_0_udp_method_incoming_datagram_stream_receive(self: wasi_sockets_0_2_0_udp_borrow_incoming_datagram_stream_t, max_results: u64, ret: [*c]wasi_sockets_0_2_0_udp_list_incoming_datagram_t, err: [*c]wasi_sockets_0_2_0_udp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_udp_method_incoming_datagram_stream_subscribe(self: wasi_sockets_0_2_0_udp_borrow_incoming_datagram_stream_t) wasi_sockets_0_2_0_udp_own_pollable_t;
pub extern fn wasi_sockets_0_2_0_udp_method_outgoing_datagram_stream_check_send(self: wasi_sockets_0_2_0_udp_borrow_outgoing_datagram_stream_t, ret: [*c]u64, err: [*c]wasi_sockets_0_2_0_udp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_udp_method_outgoing_datagram_stream_send(self: wasi_sockets_0_2_0_udp_borrow_outgoing_datagram_stream_t, datagrams: [*c]wasi_sockets_0_2_0_udp_list_outgoing_datagram_t, ret: [*c]u64, err: [*c]wasi_sockets_0_2_0_udp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_udp_method_outgoing_datagram_stream_subscribe(self: wasi_sockets_0_2_0_udp_borrow_outgoing_datagram_stream_t) wasi_sockets_0_2_0_udp_own_pollable_t;
pub extern fn wasi_sockets_0_2_0_udp_create_socket_create_udp_socket(address_family: wasi_sockets_0_2_0_udp_create_socket_ip_address_family_t, ret: [*c]wasi_sockets_0_2_0_udp_create_socket_own_udp_socket_t, err: [*c]wasi_sockets_0_2_0_udp_create_socket_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_start_bind(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, network: wasi_sockets_0_2_0_tcp_borrow_network_t, local_address: [*c]wasi_sockets_0_2_0_tcp_ip_socket_address_t, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_finish_bind(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_start_connect(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, network: wasi_sockets_0_2_0_tcp_borrow_network_t, remote_address: [*c]wasi_sockets_0_2_0_tcp_ip_socket_address_t, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_finish_connect(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, ret: [*c]wasi_sockets_0_2_0_tcp_tuple2_own_input_stream_own_output_stream_t, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_start_listen(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_finish_listen(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_accept(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, ret: [*c]wasi_sockets_0_2_0_tcp_tuple3_own_tcp_socket_own_input_stream_own_output_stream_t, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_local_address(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, ret: [*c]wasi_sockets_0_2_0_tcp_ip_socket_address_t, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_remote_address(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, ret: [*c]wasi_sockets_0_2_0_tcp_ip_socket_address_t, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_is_listening(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_address_family(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t) wasi_sockets_0_2_0_tcp_ip_address_family_t;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_set_listen_backlog_size(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, value: u64, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_keep_alive_enabled(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, ret: [*c]bool, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_set_keep_alive_enabled(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, value: bool, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_keep_alive_idle_time(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, ret: [*c]wasi_sockets_0_2_0_tcp_duration_t, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_set_keep_alive_idle_time(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, value: wasi_sockets_0_2_0_tcp_duration_t, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_keep_alive_interval(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, ret: [*c]wasi_sockets_0_2_0_tcp_duration_t, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_set_keep_alive_interval(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, value: wasi_sockets_0_2_0_tcp_duration_t, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_keep_alive_count(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, ret: [*c]u32, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_set_keep_alive_count(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, value: u32, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_hop_limit(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, ret: [*c]u8, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_set_hop_limit(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, value: u8, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_receive_buffer_size(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, ret: [*c]u64, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_set_receive_buffer_size(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, value: u64, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_send_buffer_size(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, ret: [*c]u64, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_set_send_buffer_size(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, value: u64, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_subscribe(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t) wasi_sockets_0_2_0_tcp_own_pollable_t;
pub extern fn wasi_sockets_0_2_0_tcp_method_tcp_socket_shutdown(self: wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t, shutdown_type: wasi_sockets_0_2_0_tcp_shutdown_type_t, err: [*c]wasi_sockets_0_2_0_tcp_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_tcp_create_socket_create_tcp_socket(address_family: wasi_sockets_0_2_0_tcp_create_socket_ip_address_family_t, ret: [*c]wasi_sockets_0_2_0_tcp_create_socket_own_tcp_socket_t, err: [*c]wasi_sockets_0_2_0_tcp_create_socket_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_ip_name_lookup_resolve_addresses(network: wasi_sockets_0_2_0_ip_name_lookup_borrow_network_t, name: [*c]http_trigger_string_t, ret: [*c]wasi_sockets_0_2_0_ip_name_lookup_own_resolve_address_stream_t, err: [*c]wasi_sockets_0_2_0_ip_name_lookup_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_ip_name_lookup_method_resolve_address_stream_resolve_next_address(self: wasi_sockets_0_2_0_ip_name_lookup_borrow_resolve_address_stream_t, ret: [*c]wasi_sockets_0_2_0_ip_name_lookup_option_ip_address_t, err: [*c]wasi_sockets_0_2_0_ip_name_lookup_error_code_t) bool;
pub extern fn wasi_sockets_0_2_0_ip_name_lookup_method_resolve_address_stream_subscribe(self: wasi_sockets_0_2_0_ip_name_lookup_borrow_resolve_address_stream_t) wasi_sockets_0_2_0_ip_name_lookup_own_pollable_t;
pub extern fn wasi_random_0_2_0_random_get_random_bytes(len: u64, ret: [*c]http_trigger_list_u8_t) void;
pub extern fn wasi_random_0_2_0_random_get_random_u64() u64;
pub extern fn wasi_random_0_2_0_insecure_get_insecure_random_bytes(len: u64, ret: [*c]http_trigger_list_u8_t) void;
pub extern fn wasi_random_0_2_0_insecure_get_insecure_random_u64() u64;
pub extern fn wasi_random_0_2_0_insecure_seed_insecure_seed(ret: [*c]http_trigger_tuple2_u64_u64_t) void;
pub extern fn exports_wasi_http_0_2_0_incoming_handler_handle(request: exports_wasi_http_0_2_0_incoming_handler_own_incoming_request_t, response_out: exports_wasi_http_0_2_0_incoming_handler_own_response_outparam_t) void;
pub extern fn wasi_io_0_2_0_poll_pollable_drop_own(handle: wasi_io_0_2_0_poll_own_pollable_t) void;
pub extern fn wasi_io_0_2_0_poll_borrow_pollable(handle: wasi_io_0_2_0_poll_own_pollable_t) wasi_io_0_2_0_poll_borrow_pollable_t;
pub extern fn wasi_io_0_2_0_poll_list_borrow_pollable_free(ptr: [*c]wasi_io_0_2_0_poll_list_borrow_pollable_t) void;
pub extern fn http_trigger_list_u32_free(ptr: [*c]http_trigger_list_u32_t) void;
pub extern fn wasi_io_0_2_0_error_error_drop_own(handle: wasi_io_0_2_0_error_own_error_t) void;
pub extern fn wasi_io_0_2_0_error_borrow_error(handle: wasi_io_0_2_0_error_own_error_t) wasi_io_0_2_0_error_borrow_error_t;
pub extern fn wasi_io_0_2_0_streams_stream_error_free(ptr: [*c]wasi_io_0_2_0_streams_stream_error_t) void;
pub extern fn wasi_io_0_2_0_streams_input_stream_drop_own(handle: wasi_io_0_2_0_streams_own_input_stream_t) void;
pub extern fn wasi_io_0_2_0_streams_borrow_input_stream(handle: wasi_io_0_2_0_streams_own_input_stream_t) wasi_io_0_2_0_streams_borrow_input_stream_t;
pub extern fn wasi_io_0_2_0_streams_output_stream_drop_own(handle: wasi_io_0_2_0_streams_own_output_stream_t) void;
pub extern fn wasi_io_0_2_0_streams_borrow_output_stream(handle: wasi_io_0_2_0_streams_own_output_stream_t) wasi_io_0_2_0_streams_borrow_output_stream_t;
pub extern fn http_trigger_list_u8_free(ptr: [*c]http_trigger_list_u8_t) void;
pub extern fn wasi_io_0_2_0_streams_result_list_u8_stream_error_free(ptr: [*c]wasi_io_0_2_0_streams_result_list_u8_stream_error_t) void;
pub extern fn wasi_io_0_2_0_streams_result_u64_stream_error_free(ptr: [*c]wasi_io_0_2_0_streams_result_u64_stream_error_t) void;
pub extern fn wasi_io_0_2_0_streams_result_void_stream_error_free(ptr: [*c]wasi_io_0_2_0_streams_result_void_stream_error_t) void;
pub extern fn wasi_http_0_2_0_types_method_free(ptr: [*c]wasi_http_0_2_0_types_method_t) void;
pub extern fn wasi_http_0_2_0_types_scheme_free(ptr: [*c]wasi_http_0_2_0_types_scheme_t) void;
pub extern fn http_trigger_option_string_free(ptr: [*c]http_trigger_option_string_t) void;
pub extern fn http_trigger_option_u16_free(ptr: [*c]http_trigger_option_u16_t) void;
pub extern fn wasi_http_0_2_0_types_dns_error_payload_free(ptr: [*c]wasi_http_0_2_0_types_dns_error_payload_t) void;
pub extern fn http_trigger_option_u8_free(ptr: [*c]http_trigger_option_u8_t) void;
pub extern fn wasi_http_0_2_0_types_tls_alert_received_payload_free(ptr: [*c]wasi_http_0_2_0_types_tls_alert_received_payload_t) void;
pub extern fn http_trigger_option_u32_free(ptr: [*c]http_trigger_option_u32_t) void;
pub extern fn wasi_http_0_2_0_types_field_size_payload_free(ptr: [*c]wasi_http_0_2_0_types_field_size_payload_t) void;
pub extern fn http_trigger_option_u64_free(ptr: [*c]http_trigger_option_u64_t) void;
pub extern fn wasi_http_0_2_0_types_option_field_size_payload_free(ptr: [*c]wasi_http_0_2_0_types_option_field_size_payload_t) void;
pub extern fn wasi_http_0_2_0_types_error_code_free(ptr: [*c]wasi_http_0_2_0_types_error_code_t) void;
pub extern fn wasi_http_0_2_0_types_header_error_free(ptr: [*c]wasi_http_0_2_0_types_header_error_t) void;
pub extern fn wasi_http_0_2_0_types_field_key_free(ptr: [*c]wasi_http_0_2_0_types_field_key_t) void;
pub extern fn wasi_http_0_2_0_types_field_value_free(ptr: [*c]wasi_http_0_2_0_types_field_value_t) void;
pub extern fn wasi_http_0_2_0_types_fields_drop_own(handle: wasi_http_0_2_0_types_own_fields_t) void;
pub extern fn wasi_http_0_2_0_types_borrow_fields(handle: wasi_http_0_2_0_types_own_fields_t) wasi_http_0_2_0_types_borrow_fields_t;
pub extern fn wasi_http_0_2_0_types_incoming_request_drop_own(handle: wasi_http_0_2_0_types_own_incoming_request_t) void;
pub extern fn wasi_http_0_2_0_types_borrow_incoming_request(handle: wasi_http_0_2_0_types_own_incoming_request_t) wasi_http_0_2_0_types_borrow_incoming_request_t;
pub extern fn wasi_http_0_2_0_types_outgoing_request_drop_own(handle: wasi_http_0_2_0_types_own_outgoing_request_t) void;
pub extern fn wasi_http_0_2_0_types_borrow_outgoing_request(handle: wasi_http_0_2_0_types_own_outgoing_request_t) wasi_http_0_2_0_types_borrow_outgoing_request_t;
pub extern fn wasi_http_0_2_0_types_request_options_drop_own(handle: wasi_http_0_2_0_types_own_request_options_t) void;
pub extern fn wasi_http_0_2_0_types_borrow_request_options(handle: wasi_http_0_2_0_types_own_request_options_t) wasi_http_0_2_0_types_borrow_request_options_t;
pub extern fn wasi_http_0_2_0_types_response_outparam_drop_own(handle: wasi_http_0_2_0_types_own_response_outparam_t) void;
pub extern fn wasi_http_0_2_0_types_borrow_response_outparam(handle: wasi_http_0_2_0_types_own_response_outparam_t) wasi_http_0_2_0_types_borrow_response_outparam_t;
pub extern fn wasi_http_0_2_0_types_incoming_response_drop_own(handle: wasi_http_0_2_0_types_own_incoming_response_t) void;
pub extern fn wasi_http_0_2_0_types_borrow_incoming_response(handle: wasi_http_0_2_0_types_own_incoming_response_t) wasi_http_0_2_0_types_borrow_incoming_response_t;
pub extern fn wasi_http_0_2_0_types_incoming_body_drop_own(handle: wasi_http_0_2_0_types_own_incoming_body_t) void;
pub extern fn wasi_http_0_2_0_types_borrow_incoming_body(handle: wasi_http_0_2_0_types_own_incoming_body_t) wasi_http_0_2_0_types_borrow_incoming_body_t;
pub extern fn wasi_http_0_2_0_types_future_trailers_drop_own(handle: wasi_http_0_2_0_types_own_future_trailers_t) void;
pub extern fn wasi_http_0_2_0_types_borrow_future_trailers(handle: wasi_http_0_2_0_types_own_future_trailers_t) wasi_http_0_2_0_types_borrow_future_trailers_t;
pub extern fn wasi_http_0_2_0_types_outgoing_response_drop_own(handle: wasi_http_0_2_0_types_own_outgoing_response_t) void;
pub extern fn wasi_http_0_2_0_types_borrow_outgoing_response(handle: wasi_http_0_2_0_types_own_outgoing_response_t) wasi_http_0_2_0_types_borrow_outgoing_response_t;
pub extern fn wasi_http_0_2_0_types_outgoing_body_drop_own(handle: wasi_http_0_2_0_types_own_outgoing_body_t) void;
pub extern fn wasi_http_0_2_0_types_borrow_outgoing_body(handle: wasi_http_0_2_0_types_own_outgoing_body_t) wasi_http_0_2_0_types_borrow_outgoing_body_t;
pub extern fn wasi_http_0_2_0_types_future_incoming_response_drop_own(handle: wasi_http_0_2_0_types_own_future_incoming_response_t) void;
pub extern fn wasi_http_0_2_0_types_borrow_future_incoming_response(handle: wasi_http_0_2_0_types_own_future_incoming_response_t) wasi_http_0_2_0_types_borrow_future_incoming_response_t;
pub extern fn wasi_http_0_2_0_types_option_error_code_free(ptr: [*c]wasi_http_0_2_0_types_option_error_code_t) void;
pub extern fn http_trigger_tuple2_field_key_field_value_free(ptr: [*c]http_trigger_tuple2_field_key_field_value_t) void;
pub extern fn http_trigger_list_tuple2_field_key_field_value_free(ptr: [*c]http_trigger_list_tuple2_field_key_field_value_t) void;
pub extern fn wasi_http_0_2_0_types_result_own_fields_header_error_free(ptr: [*c]wasi_http_0_2_0_types_result_own_fields_header_error_t) void;
pub extern fn http_trigger_list_field_value_free(ptr: [*c]http_trigger_list_field_value_t) void;
pub extern fn wasi_http_0_2_0_types_result_void_header_error_free(ptr: [*c]wasi_http_0_2_0_types_result_void_header_error_t) void;
pub extern fn wasi_http_0_2_0_types_option_scheme_free(ptr: [*c]wasi_http_0_2_0_types_option_scheme_t) void;
pub extern fn wasi_http_0_2_0_types_result_own_incoming_body_void_free(ptr: [*c]wasi_http_0_2_0_types_result_own_incoming_body_void_t) void;
pub extern fn wasi_http_0_2_0_types_result_own_outgoing_body_void_free(ptr: [*c]wasi_http_0_2_0_types_result_own_outgoing_body_void_t) void;
pub extern fn wasi_http_0_2_0_types_result_void_void_free(ptr: [*c]wasi_http_0_2_0_types_result_void_void_t) void;
pub extern fn http_trigger_option_duration_free(ptr: [*c]http_trigger_option_duration_t) void;
pub extern fn wasi_http_0_2_0_types_result_own_outgoing_response_error_code_free(ptr: [*c]wasi_http_0_2_0_types_result_own_outgoing_response_error_code_t) void;
pub extern fn wasi_http_0_2_0_types_result_own_input_stream_void_free(ptr: [*c]wasi_http_0_2_0_types_result_own_input_stream_void_t) void;
pub extern fn wasi_http_0_2_0_types_option_own_trailers_free(ptr: [*c]wasi_http_0_2_0_types_option_own_trailers_t) void;
pub extern fn wasi_http_0_2_0_types_result_option_own_trailers_error_code_free(ptr: [*c]wasi_http_0_2_0_types_result_option_own_trailers_error_code_t) void;
pub extern fn wasi_http_0_2_0_types_result_result_option_own_trailers_error_code_void_free(ptr: [*c]wasi_http_0_2_0_types_result_result_option_own_trailers_error_code_void_t) void;
pub extern fn wasi_http_0_2_0_types_option_result_result_option_own_trailers_error_code_void_free(ptr: [*c]wasi_http_0_2_0_types_option_result_result_option_own_trailers_error_code_void_t) void;
pub extern fn wasi_http_0_2_0_types_result_own_output_stream_void_free(ptr: [*c]wasi_http_0_2_0_types_result_own_output_stream_void_t) void;
pub extern fn wasi_http_0_2_0_types_result_void_error_code_free(ptr: [*c]wasi_http_0_2_0_types_result_void_error_code_t) void;
pub extern fn wasi_http_0_2_0_types_result_own_incoming_response_error_code_free(ptr: [*c]wasi_http_0_2_0_types_result_own_incoming_response_error_code_t) void;
pub extern fn wasi_http_0_2_0_types_result_result_own_incoming_response_error_code_void_free(ptr: [*c]wasi_http_0_2_0_types_result_result_own_incoming_response_error_code_void_t) void;
pub extern fn wasi_http_0_2_0_types_option_result_result_own_incoming_response_error_code_void_free(ptr: [*c]wasi_http_0_2_0_types_option_result_result_own_incoming_response_error_code_void_t) void;
pub extern fn wasi_http_0_2_0_outgoing_handler_error_code_free(ptr: [*c]wasi_http_0_2_0_outgoing_handler_error_code_t) void;
pub extern fn wasi_http_0_2_0_outgoing_handler_option_own_request_options_free(ptr: [*c]wasi_http_0_2_0_outgoing_handler_option_own_request_options_t) void;
pub extern fn wasi_http_0_2_0_outgoing_handler_result_own_future_incoming_response_error_code_free(ptr: [*c]wasi_http_0_2_0_outgoing_handler_result_own_future_incoming_response_error_code_t) void;
pub extern fn fermyon_spin_2_0_0_llm_inferencing_model_free(ptr: [*c]fermyon_spin_2_0_0_llm_inferencing_model_t) void;
pub extern fn fermyon_spin_2_0_0_llm_error_free(ptr: [*c]fermyon_spin_2_0_0_llm_error_t) void;
pub extern fn fermyon_spin_2_0_0_llm_inferencing_result_free(ptr: [*c]fermyon_spin_2_0_0_llm_inferencing_result_t) void;
pub extern fn fermyon_spin_2_0_0_llm_embedding_model_free(ptr: [*c]fermyon_spin_2_0_0_llm_embedding_model_t) void;
pub extern fn http_trigger_list_f32_free(ptr: [*c]http_trigger_list_f32_t) void;
pub extern fn http_trigger_list_list_f32_free(ptr: [*c]http_trigger_list_list_f32_t) void;
pub extern fn fermyon_spin_2_0_0_llm_embeddings_result_free(ptr: [*c]fermyon_spin_2_0_0_llm_embeddings_result_t) void;
pub extern fn fermyon_spin_2_0_0_llm_option_inferencing_params_free(ptr: [*c]fermyon_spin_2_0_0_llm_option_inferencing_params_t) void;
pub extern fn fermyon_spin_2_0_0_llm_result_inferencing_result_error_free(ptr: [*c]fermyon_spin_2_0_0_llm_result_inferencing_result_error_t) void;
pub extern fn http_trigger_list_string_free(ptr: [*c]http_trigger_list_string_t) void;
pub extern fn fermyon_spin_2_0_0_llm_result_embeddings_result_error_free(ptr: [*c]fermyon_spin_2_0_0_llm_result_embeddings_result_error_t) void;
pub extern fn fermyon_spin_2_0_0_redis_error_free(ptr: [*c]fermyon_spin_2_0_0_redis_error_t) void;
pub extern fn fermyon_spin_2_0_0_redis_connection_drop_own(handle: fermyon_spin_2_0_0_redis_own_connection_t) void;
pub extern fn fermyon_spin_2_0_0_redis_borrow_connection(handle: fermyon_spin_2_0_0_redis_own_connection_t) fermyon_spin_2_0_0_redis_borrow_connection_t;
pub extern fn fermyon_spin_2_0_0_redis_payload_free(ptr: [*c]fermyon_spin_2_0_0_redis_payload_t) void;
pub extern fn fermyon_spin_2_0_0_redis_redis_parameter_free(ptr: [*c]fermyon_spin_2_0_0_redis_redis_parameter_t) void;
pub extern fn fermyon_spin_2_0_0_redis_redis_result_free(ptr: [*c]fermyon_spin_2_0_0_redis_redis_result_t) void;
pub extern fn fermyon_spin_2_0_0_redis_result_own_connection_error_free(ptr: [*c]fermyon_spin_2_0_0_redis_result_own_connection_error_t) void;
pub extern fn fermyon_spin_2_0_0_redis_result_void_error_free(ptr: [*c]fermyon_spin_2_0_0_redis_result_void_error_t) void;
pub extern fn http_trigger_option_payload_free(ptr: [*c]http_trigger_option_payload_t) void;
pub extern fn fermyon_spin_2_0_0_redis_result_option_payload_error_free(ptr: [*c]fermyon_spin_2_0_0_redis_result_option_payload_error_t) void;
pub extern fn fermyon_spin_2_0_0_redis_result_s64_error_free(ptr: [*c]fermyon_spin_2_0_0_redis_result_s64_error_t) void;
pub extern fn fermyon_spin_2_0_0_redis_result_u32_error_free(ptr: [*c]fermyon_spin_2_0_0_redis_result_u32_error_t) void;
pub extern fn fermyon_spin_2_0_0_redis_result_list_string_error_free(ptr: [*c]fermyon_spin_2_0_0_redis_result_list_string_error_t) void;
pub extern fn fermyon_spin_2_0_0_redis_list_redis_parameter_free(ptr: [*c]fermyon_spin_2_0_0_redis_list_redis_parameter_t) void;
pub extern fn fermyon_spin_2_0_0_redis_list_redis_result_free(ptr: [*c]fermyon_spin_2_0_0_redis_list_redis_result_t) void;
pub extern fn fermyon_spin_2_0_0_redis_result_list_redis_result_error_free(ptr: [*c]fermyon_spin_2_0_0_redis_result_list_redis_result_error_t) void;
pub extern fn fermyon_spin_2_0_0_mqtt_error_free(ptr: [*c]fermyon_spin_2_0_0_mqtt_error_t) void;
pub extern fn fermyon_spin_2_0_0_mqtt_connection_drop_own(handle: fermyon_spin_2_0_0_mqtt_own_connection_t) void;
pub extern fn fermyon_spin_2_0_0_mqtt_borrow_connection(handle: fermyon_spin_2_0_0_mqtt_own_connection_t) fermyon_spin_2_0_0_mqtt_borrow_connection_t;
pub extern fn fermyon_spin_2_0_0_mqtt_payload_free(ptr: [*c]fermyon_spin_2_0_0_mqtt_payload_t) void;
pub extern fn fermyon_spin_2_0_0_mqtt_result_own_connection_error_free(ptr: [*c]fermyon_spin_2_0_0_mqtt_result_own_connection_error_t) void;
pub extern fn fermyon_spin_2_0_0_mqtt_result_void_error_free(ptr: [*c]fermyon_spin_2_0_0_mqtt_result_void_error_t) void;
pub extern fn fermyon_spin_2_0_0_rdbms_types_error_free(ptr: [*c]fermyon_spin_2_0_0_rdbms_types_error_t) void;
pub extern fn fermyon_spin_2_0_0_rdbms_types_db_value_free(ptr: [*c]fermyon_spin_2_0_0_rdbms_types_db_value_t) void;
pub extern fn fermyon_spin_2_0_0_rdbms_types_parameter_value_free(ptr: [*c]fermyon_spin_2_0_0_rdbms_types_parameter_value_t) void;
pub extern fn fermyon_spin_2_0_0_rdbms_types_column_free(ptr: [*c]fermyon_spin_2_0_0_rdbms_types_column_t) void;
pub extern fn fermyon_spin_2_0_0_rdbms_types_row_free(ptr: [*c]fermyon_spin_2_0_0_rdbms_types_row_t) void;
pub extern fn fermyon_spin_2_0_0_rdbms_types_list_column_free(ptr: [*c]fermyon_spin_2_0_0_rdbms_types_list_column_t) void;
pub extern fn fermyon_spin_2_0_0_rdbms_types_list_row_free(ptr: [*c]fermyon_spin_2_0_0_rdbms_types_list_row_t) void;
pub extern fn fermyon_spin_2_0_0_rdbms_types_row_set_free(ptr: [*c]fermyon_spin_2_0_0_rdbms_types_row_set_t) void;
pub extern fn fermyon_spin_2_0_0_postgres_parameter_value_free(ptr: [*c]fermyon_spin_2_0_0_postgres_parameter_value_t) void;
pub extern fn fermyon_spin_2_0_0_postgres_row_set_free(ptr: [*c]fermyon_spin_2_0_0_postgres_row_set_t) void;
pub extern fn fermyon_spin_2_0_0_postgres_error_free(ptr: [*c]fermyon_spin_2_0_0_postgres_error_t) void;
pub extern fn fermyon_spin_2_0_0_postgres_connection_drop_own(handle: fermyon_spin_2_0_0_postgres_own_connection_t) void;
pub extern fn fermyon_spin_2_0_0_postgres_borrow_connection(handle: fermyon_spin_2_0_0_postgres_own_connection_t) fermyon_spin_2_0_0_postgres_borrow_connection_t;
pub extern fn fermyon_spin_2_0_0_postgres_result_own_connection_error_free(ptr: [*c]fermyon_spin_2_0_0_postgres_result_own_connection_error_t) void;
pub extern fn fermyon_spin_2_0_0_postgres_list_parameter_value_free(ptr: [*c]fermyon_spin_2_0_0_postgres_list_parameter_value_t) void;
pub extern fn fermyon_spin_2_0_0_postgres_result_row_set_error_free(ptr: [*c]fermyon_spin_2_0_0_postgres_result_row_set_error_t) void;
pub extern fn fermyon_spin_2_0_0_postgres_result_u64_error_free(ptr: [*c]fermyon_spin_2_0_0_postgres_result_u64_error_t) void;
pub extern fn fermyon_spin_2_0_0_mysql_parameter_value_free(ptr: [*c]fermyon_spin_2_0_0_mysql_parameter_value_t) void;
pub extern fn fermyon_spin_2_0_0_mysql_row_set_free(ptr: [*c]fermyon_spin_2_0_0_mysql_row_set_t) void;
pub extern fn fermyon_spin_2_0_0_mysql_error_free(ptr: [*c]fermyon_spin_2_0_0_mysql_error_t) void;
pub extern fn fermyon_spin_2_0_0_mysql_connection_drop_own(handle: fermyon_spin_2_0_0_mysql_own_connection_t) void;
pub extern fn fermyon_spin_2_0_0_mysql_borrow_connection(handle: fermyon_spin_2_0_0_mysql_own_connection_t) fermyon_spin_2_0_0_mysql_borrow_connection_t;
pub extern fn fermyon_spin_2_0_0_mysql_result_own_connection_error_free(ptr: [*c]fermyon_spin_2_0_0_mysql_result_own_connection_error_t) void;
pub extern fn fermyon_spin_2_0_0_mysql_list_parameter_value_free(ptr: [*c]fermyon_spin_2_0_0_mysql_list_parameter_value_t) void;
pub extern fn fermyon_spin_2_0_0_mysql_result_row_set_error_free(ptr: [*c]fermyon_spin_2_0_0_mysql_result_row_set_error_t) void;
pub extern fn fermyon_spin_2_0_0_mysql_result_void_error_free(ptr: [*c]fermyon_spin_2_0_0_mysql_result_void_error_t) void;
pub extern fn fermyon_spin_2_0_0_sqlite_connection_drop_own(handle: fermyon_spin_2_0_0_sqlite_own_connection_t) void;
pub extern fn fermyon_spin_2_0_0_sqlite_borrow_connection(handle: fermyon_spin_2_0_0_sqlite_own_connection_t) fermyon_spin_2_0_0_sqlite_borrow_connection_t;
pub extern fn fermyon_spin_2_0_0_sqlite_error_free(ptr: [*c]fermyon_spin_2_0_0_sqlite_error_t) void;
pub extern fn fermyon_spin_2_0_0_sqlite_value_free(ptr: [*c]fermyon_spin_2_0_0_sqlite_value_t) void;
pub extern fn fermyon_spin_2_0_0_sqlite_list_value_free(ptr: [*c]fermyon_spin_2_0_0_sqlite_list_value_t) void;
pub extern fn fermyon_spin_2_0_0_sqlite_row_result_free(ptr: [*c]fermyon_spin_2_0_0_sqlite_row_result_t) void;
pub extern fn fermyon_spin_2_0_0_sqlite_list_row_result_free(ptr: [*c]fermyon_spin_2_0_0_sqlite_list_row_result_t) void;
pub extern fn fermyon_spin_2_0_0_sqlite_query_result_free(ptr: [*c]fermyon_spin_2_0_0_sqlite_query_result_t) void;
pub extern fn fermyon_spin_2_0_0_sqlite_result_own_connection_error_free(ptr: [*c]fermyon_spin_2_0_0_sqlite_result_own_connection_error_t) void;
pub extern fn fermyon_spin_2_0_0_sqlite_result_query_result_error_free(ptr: [*c]fermyon_spin_2_0_0_sqlite_result_query_result_error_t) void;
pub extern fn fermyon_spin_2_0_0_key_value_store_drop_own(handle: fermyon_spin_2_0_0_key_value_own_store_t) void;
pub extern fn fermyon_spin_2_0_0_key_value_borrow_store(handle: fermyon_spin_2_0_0_key_value_own_store_t) fermyon_spin_2_0_0_key_value_borrow_store_t;
pub extern fn fermyon_spin_2_0_0_key_value_error_free(ptr: [*c]fermyon_spin_2_0_0_key_value_error_t) void;
pub extern fn fermyon_spin_2_0_0_key_value_result_own_store_error_free(ptr: [*c]fermyon_spin_2_0_0_key_value_result_own_store_error_t) void;
pub extern fn http_trigger_option_list_u8_free(ptr: [*c]http_trigger_option_list_u8_t) void;
pub extern fn fermyon_spin_2_0_0_key_value_result_option_list_u8_error_free(ptr: [*c]fermyon_spin_2_0_0_key_value_result_option_list_u8_error_t) void;
pub extern fn fermyon_spin_2_0_0_key_value_result_void_error_free(ptr: [*c]fermyon_spin_2_0_0_key_value_result_void_error_t) void;
pub extern fn fermyon_spin_2_0_0_key_value_result_bool_error_free(ptr: [*c]fermyon_spin_2_0_0_key_value_result_bool_error_t) void;
pub extern fn fermyon_spin_2_0_0_key_value_result_list_string_error_free(ptr: [*c]fermyon_spin_2_0_0_key_value_result_list_string_error_t) void;
pub extern fn fermyon_spin_2_0_0_variables_error_free(ptr: [*c]fermyon_spin_2_0_0_variables_error_t) void;
pub extern fn fermyon_spin_2_0_0_variables_result_string_error_free(ptr: [*c]fermyon_spin_2_0_0_variables_result_string_error_t) void;
pub extern fn http_trigger_tuple2_string_string_free(ptr: [*c]http_trigger_tuple2_string_string_t) void;
pub extern fn http_trigger_list_tuple2_string_string_free(ptr: [*c]http_trigger_list_tuple2_string_string_t) void;
pub extern fn wasi_cli_0_2_0_exit_result_void_void_free(ptr: [*c]wasi_cli_0_2_0_exit_result_void_void_t) void;
pub extern fn wasi_cli_0_2_0_terminal_input_terminal_input_drop_own(handle: wasi_cli_0_2_0_terminal_input_own_terminal_input_t) void;
pub extern fn wasi_cli_0_2_0_terminal_input_borrow_terminal_input(handle: wasi_cli_0_2_0_terminal_input_own_terminal_input_t) wasi_cli_0_2_0_terminal_input_borrow_terminal_input_t;
pub extern fn wasi_cli_0_2_0_terminal_output_terminal_output_drop_own(handle: wasi_cli_0_2_0_terminal_output_own_terminal_output_t) void;
pub extern fn wasi_cli_0_2_0_terminal_output_borrow_terminal_output(handle: wasi_cli_0_2_0_terminal_output_own_terminal_output_t) wasi_cli_0_2_0_terminal_output_borrow_terminal_output_t;
pub extern fn wasi_cli_0_2_0_terminal_stdin_option_own_terminal_input_free(ptr: [*c]wasi_cli_0_2_0_terminal_stdin_option_own_terminal_input_t) void;
pub extern fn wasi_cli_0_2_0_terminal_stdout_option_own_terminal_output_free(ptr: [*c]wasi_cli_0_2_0_terminal_stdout_option_own_terminal_output_t) void;
pub extern fn wasi_cli_0_2_0_terminal_stderr_option_own_terminal_output_free(ptr: [*c]wasi_cli_0_2_0_terminal_stderr_option_own_terminal_output_t) void;
pub extern fn wasi_filesystem_0_2_0_types_option_datetime_free(ptr: [*c]wasi_filesystem_0_2_0_types_option_datetime_t) void;
pub extern fn wasi_filesystem_0_2_0_types_descriptor_stat_free(ptr: [*c]wasi_filesystem_0_2_0_types_descriptor_stat_t) void;
pub extern fn wasi_filesystem_0_2_0_types_new_timestamp_free(ptr: [*c]wasi_filesystem_0_2_0_types_new_timestamp_t) void;
pub extern fn wasi_filesystem_0_2_0_types_directory_entry_free(ptr: [*c]wasi_filesystem_0_2_0_types_directory_entry_t) void;
pub extern fn wasi_filesystem_0_2_0_types_descriptor_drop_own(handle: wasi_filesystem_0_2_0_types_own_descriptor_t) void;
pub extern fn wasi_filesystem_0_2_0_types_borrow_descriptor(handle: wasi_filesystem_0_2_0_types_own_descriptor_t) wasi_filesystem_0_2_0_types_borrow_descriptor_t;
pub extern fn wasi_filesystem_0_2_0_types_directory_entry_stream_drop_own(handle: wasi_filesystem_0_2_0_types_own_directory_entry_stream_t) void;
pub extern fn wasi_filesystem_0_2_0_types_borrow_directory_entry_stream(handle: wasi_filesystem_0_2_0_types_own_directory_entry_stream_t) wasi_filesystem_0_2_0_types_borrow_directory_entry_stream_t;
pub extern fn wasi_filesystem_0_2_0_types_result_own_input_stream_error_code_free(ptr: [*c]wasi_filesystem_0_2_0_types_result_own_input_stream_error_code_t) void;
pub extern fn wasi_filesystem_0_2_0_types_result_own_output_stream_error_code_free(ptr: [*c]wasi_filesystem_0_2_0_types_result_own_output_stream_error_code_t) void;
pub extern fn wasi_filesystem_0_2_0_types_result_void_error_code_free(ptr: [*c]wasi_filesystem_0_2_0_types_result_void_error_code_t) void;
pub extern fn wasi_filesystem_0_2_0_types_result_descriptor_flags_error_code_free(ptr: [*c]wasi_filesystem_0_2_0_types_result_descriptor_flags_error_code_t) void;
pub extern fn wasi_filesystem_0_2_0_types_result_descriptor_type_error_code_free(ptr: [*c]wasi_filesystem_0_2_0_types_result_descriptor_type_error_code_t) void;
pub extern fn wasi_filesystem_0_2_0_types_result_tuple2_list_u8_bool_error_code_free(ptr: [*c]wasi_filesystem_0_2_0_types_result_tuple2_list_u8_bool_error_code_t) void;
pub extern fn wasi_filesystem_0_2_0_types_result_filesize_error_code_free(ptr: [*c]wasi_filesystem_0_2_0_types_result_filesize_error_code_t) void;
pub extern fn wasi_filesystem_0_2_0_types_result_own_directory_entry_stream_error_code_free(ptr: [*c]wasi_filesystem_0_2_0_types_result_own_directory_entry_stream_error_code_t) void;
pub extern fn wasi_filesystem_0_2_0_types_result_descriptor_stat_error_code_free(ptr: [*c]wasi_filesystem_0_2_0_types_result_descriptor_stat_error_code_t) void;
pub extern fn wasi_filesystem_0_2_0_types_result_own_descriptor_error_code_free(ptr: [*c]wasi_filesystem_0_2_0_types_result_own_descriptor_error_code_t) void;
pub extern fn wasi_filesystem_0_2_0_types_result_string_error_code_free(ptr: [*c]wasi_filesystem_0_2_0_types_result_string_error_code_t) void;
pub extern fn wasi_filesystem_0_2_0_types_result_metadata_hash_value_error_code_free(ptr: [*c]wasi_filesystem_0_2_0_types_result_metadata_hash_value_error_code_t) void;
pub extern fn wasi_filesystem_0_2_0_types_option_directory_entry_free(ptr: [*c]wasi_filesystem_0_2_0_types_option_directory_entry_t) void;
pub extern fn wasi_filesystem_0_2_0_types_result_option_directory_entry_error_code_free(ptr: [*c]wasi_filesystem_0_2_0_types_result_option_directory_entry_error_code_t) void;
pub extern fn wasi_filesystem_0_2_0_types_option_error_code_free(ptr: [*c]wasi_filesystem_0_2_0_types_option_error_code_t) void;
pub extern fn wasi_filesystem_0_2_0_preopens_tuple2_own_descriptor_string_free(ptr: [*c]wasi_filesystem_0_2_0_preopens_tuple2_own_descriptor_string_t) void;
pub extern fn wasi_filesystem_0_2_0_preopens_list_tuple2_own_descriptor_string_free(ptr: [*c]wasi_filesystem_0_2_0_preopens_list_tuple2_own_descriptor_string_t) void;
pub extern fn wasi_sockets_0_2_0_network_network_drop_own(handle: wasi_sockets_0_2_0_network_own_network_t) void;
pub extern fn wasi_sockets_0_2_0_network_borrow_network(handle: wasi_sockets_0_2_0_network_own_network_t) wasi_sockets_0_2_0_network_borrow_network_t;
pub extern fn wasi_sockets_0_2_0_network_ip_address_free(ptr: [*c]wasi_sockets_0_2_0_network_ip_address_t) void;
pub extern fn wasi_sockets_0_2_0_network_ip_socket_address_free(ptr: [*c]wasi_sockets_0_2_0_network_ip_socket_address_t) void;
pub extern fn wasi_sockets_0_2_0_udp_ip_socket_address_free(ptr: [*c]wasi_sockets_0_2_0_udp_ip_socket_address_t) void;
pub extern fn wasi_sockets_0_2_0_udp_incoming_datagram_free(ptr: [*c]wasi_sockets_0_2_0_udp_incoming_datagram_t) void;
pub extern fn wasi_sockets_0_2_0_udp_option_ip_socket_address_free(ptr: [*c]wasi_sockets_0_2_0_udp_option_ip_socket_address_t) void;
pub extern fn wasi_sockets_0_2_0_udp_outgoing_datagram_free(ptr: [*c]wasi_sockets_0_2_0_udp_outgoing_datagram_t) void;
pub extern fn wasi_sockets_0_2_0_udp_udp_socket_drop_own(handle: wasi_sockets_0_2_0_udp_own_udp_socket_t) void;
pub extern fn wasi_sockets_0_2_0_udp_borrow_udp_socket(handle: wasi_sockets_0_2_0_udp_own_udp_socket_t) wasi_sockets_0_2_0_udp_borrow_udp_socket_t;
pub extern fn wasi_sockets_0_2_0_udp_incoming_datagram_stream_drop_own(handle: wasi_sockets_0_2_0_udp_own_incoming_datagram_stream_t) void;
pub extern fn wasi_sockets_0_2_0_udp_borrow_incoming_datagram_stream(handle: wasi_sockets_0_2_0_udp_own_incoming_datagram_stream_t) wasi_sockets_0_2_0_udp_borrow_incoming_datagram_stream_t;
pub extern fn wasi_sockets_0_2_0_udp_outgoing_datagram_stream_drop_own(handle: wasi_sockets_0_2_0_udp_own_outgoing_datagram_stream_t) void;
pub extern fn wasi_sockets_0_2_0_udp_borrow_outgoing_datagram_stream(handle: wasi_sockets_0_2_0_udp_own_outgoing_datagram_stream_t) wasi_sockets_0_2_0_udp_borrow_outgoing_datagram_stream_t;
pub extern fn wasi_sockets_0_2_0_udp_result_void_error_code_free(ptr: [*c]wasi_sockets_0_2_0_udp_result_void_error_code_t) void;
pub extern fn wasi_sockets_0_2_0_udp_result_tuple2_own_incoming_datagram_stream_own_outgoing_datagram_stream_error_code_free(ptr: [*c]wasi_sockets_0_2_0_udp_result_tuple2_own_incoming_datagram_stream_own_outgoing_datagram_stream_error_code_t) void;
pub extern fn wasi_sockets_0_2_0_udp_result_ip_socket_address_error_code_free(ptr: [*c]wasi_sockets_0_2_0_udp_result_ip_socket_address_error_code_t) void;
pub extern fn wasi_sockets_0_2_0_udp_result_u8_error_code_free(ptr: [*c]wasi_sockets_0_2_0_udp_result_u8_error_code_t) void;
pub extern fn wasi_sockets_0_2_0_udp_result_u64_error_code_free(ptr: [*c]wasi_sockets_0_2_0_udp_result_u64_error_code_t) void;
pub extern fn wasi_sockets_0_2_0_udp_list_incoming_datagram_free(ptr: [*c]wasi_sockets_0_2_0_udp_list_incoming_datagram_t) void;
pub extern fn wasi_sockets_0_2_0_udp_result_list_incoming_datagram_error_code_free(ptr: [*c]wasi_sockets_0_2_0_udp_result_list_incoming_datagram_error_code_t) void;
pub extern fn wasi_sockets_0_2_0_udp_list_outgoing_datagram_free(ptr: [*c]wasi_sockets_0_2_0_udp_list_outgoing_datagram_t) void;
pub extern fn wasi_sockets_0_2_0_udp_create_socket_result_own_udp_socket_error_code_free(ptr: [*c]wasi_sockets_0_2_0_udp_create_socket_result_own_udp_socket_error_code_t) void;
pub extern fn wasi_sockets_0_2_0_tcp_ip_socket_address_free(ptr: [*c]wasi_sockets_0_2_0_tcp_ip_socket_address_t) void;
pub extern fn wasi_sockets_0_2_0_tcp_tcp_socket_drop_own(handle: wasi_sockets_0_2_0_tcp_own_tcp_socket_t) void;
pub extern fn wasi_sockets_0_2_0_tcp_borrow_tcp_socket(handle: wasi_sockets_0_2_0_tcp_own_tcp_socket_t) wasi_sockets_0_2_0_tcp_borrow_tcp_socket_t;
pub extern fn wasi_sockets_0_2_0_tcp_result_void_error_code_free(ptr: [*c]wasi_sockets_0_2_0_tcp_result_void_error_code_t) void;
pub extern fn wasi_sockets_0_2_0_tcp_result_tuple2_own_input_stream_own_output_stream_error_code_free(ptr: [*c]wasi_sockets_0_2_0_tcp_result_tuple2_own_input_stream_own_output_stream_error_code_t) void;
pub extern fn wasi_sockets_0_2_0_tcp_result_tuple3_own_tcp_socket_own_input_stream_own_output_stream_error_code_free(ptr: [*c]wasi_sockets_0_2_0_tcp_result_tuple3_own_tcp_socket_own_input_stream_own_output_stream_error_code_t) void;
pub extern fn wasi_sockets_0_2_0_tcp_result_ip_socket_address_error_code_free(ptr: [*c]wasi_sockets_0_2_0_tcp_result_ip_socket_address_error_code_t) void;
pub extern fn wasi_sockets_0_2_0_tcp_result_bool_error_code_free(ptr: [*c]wasi_sockets_0_2_0_tcp_result_bool_error_code_t) void;
pub extern fn wasi_sockets_0_2_0_tcp_result_duration_error_code_free(ptr: [*c]wasi_sockets_0_2_0_tcp_result_duration_error_code_t) void;
pub extern fn wasi_sockets_0_2_0_tcp_result_u32_error_code_free(ptr: [*c]wasi_sockets_0_2_0_tcp_result_u32_error_code_t) void;
pub extern fn wasi_sockets_0_2_0_tcp_result_u8_error_code_free(ptr: [*c]wasi_sockets_0_2_0_tcp_result_u8_error_code_t) void;
pub extern fn wasi_sockets_0_2_0_tcp_result_u64_error_code_free(ptr: [*c]wasi_sockets_0_2_0_tcp_result_u64_error_code_t) void;
pub extern fn wasi_sockets_0_2_0_tcp_create_socket_result_own_tcp_socket_error_code_free(ptr: [*c]wasi_sockets_0_2_0_tcp_create_socket_result_own_tcp_socket_error_code_t) void;
pub extern fn wasi_sockets_0_2_0_ip_name_lookup_ip_address_free(ptr: [*c]wasi_sockets_0_2_0_ip_name_lookup_ip_address_t) void;
pub extern fn wasi_sockets_0_2_0_ip_name_lookup_resolve_address_stream_drop_own(handle: wasi_sockets_0_2_0_ip_name_lookup_own_resolve_address_stream_t) void;
pub extern fn wasi_sockets_0_2_0_ip_name_lookup_borrow_resolve_address_stream(handle: wasi_sockets_0_2_0_ip_name_lookup_own_resolve_address_stream_t) wasi_sockets_0_2_0_ip_name_lookup_borrow_resolve_address_stream_t;
pub extern fn wasi_sockets_0_2_0_ip_name_lookup_result_own_resolve_address_stream_error_code_free(ptr: [*c]wasi_sockets_0_2_0_ip_name_lookup_result_own_resolve_address_stream_error_code_t) void;
pub extern fn wasi_sockets_0_2_0_ip_name_lookup_option_ip_address_free(ptr: [*c]wasi_sockets_0_2_0_ip_name_lookup_option_ip_address_t) void;
pub extern fn wasi_sockets_0_2_0_ip_name_lookup_result_option_ip_address_error_code_free(ptr: [*c]wasi_sockets_0_2_0_ip_name_lookup_result_option_ip_address_error_code_t) void;
pub extern fn http_trigger_string_set(ret: [*c]http_trigger_string_t, s: [*c]const u8) void;
pub extern fn http_trigger_string_dup(ret: [*c]http_trigger_string_t, s: [*c]const u8) void;
pub extern fn http_trigger_string_dup_n(ret: [*c]http_trigger_string_t, s: [*c]const u8, len: usize) void;
pub extern fn http_trigger_string_free(ret: [*c]http_trigger_string_t) void;
pub const __llvm__ = @as(c_int, 1);
pub const __clang__ = @as(c_int, 1);
pub const __clang_major__ = @as(c_int, 20);
pub const __clang_minor__ = @as(c_int, 1);
pub const __clang_patchlevel__ = @as(c_int, 8);
pub const __clang_version__ = "20.1.8 ";
pub const __GNUC__ = @as(c_int, 4);
pub const __GNUC_MINOR__ = @as(c_int, 2);
pub const __GNUC_PATCHLEVEL__ = @as(c_int, 1);
pub const __GXX_ABI_VERSION = @as(c_int, 1002);
pub const __ATOMIC_RELAXED = @as(c_int, 0);
pub const __ATOMIC_CONSUME = @as(c_int, 1);
pub const __ATOMIC_ACQUIRE = @as(c_int, 2);
pub const __ATOMIC_RELEASE = @as(c_int, 3);
pub const __ATOMIC_ACQ_REL = @as(c_int, 4);
pub const __ATOMIC_SEQ_CST = @as(c_int, 5);
pub const __MEMORY_SCOPE_SYSTEM = @as(c_int, 0);
pub const __MEMORY_SCOPE_DEVICE = @as(c_int, 1);
pub const __MEMORY_SCOPE_WRKGRP = @as(c_int, 2);
pub const __MEMORY_SCOPE_WVFRNT = @as(c_int, 3);
pub const __MEMORY_SCOPE_SINGLE = @as(c_int, 4);
pub const __OPENCL_MEMORY_SCOPE_WORK_ITEM = @as(c_int, 0);
pub const __OPENCL_MEMORY_SCOPE_WORK_GROUP = @as(c_int, 1);
pub const __OPENCL_MEMORY_SCOPE_DEVICE = @as(c_int, 2);
pub const __OPENCL_MEMORY_SCOPE_ALL_SVM_DEVICES = @as(c_int, 3);
pub const __OPENCL_MEMORY_SCOPE_SUB_GROUP = @as(c_int, 4);
pub const __FPCLASS_SNAN = @as(c_int, 0x0001);
pub const __FPCLASS_QNAN = @as(c_int, 0x0002);
pub const __FPCLASS_NEGINF = @as(c_int, 0x0004);
pub const __FPCLASS_NEGNORMAL = @as(c_int, 0x0008);
pub const __FPCLASS_NEGSUBNORMAL = @as(c_int, 0x0010);
pub const __FPCLASS_NEGZERO = @as(c_int, 0x0020);
pub const __FPCLASS_POSZERO = @as(c_int, 0x0040);
pub const __FPCLASS_POSSUBNORMAL = @as(c_int, 0x0080);
pub const __FPCLASS_POSNORMAL = @as(c_int, 0x0100);
pub const __FPCLASS_POSINF = @as(c_int, 0x0200);
pub const __PRAGMA_REDEFINE_EXTNAME = @as(c_int, 1);
pub const __VERSION__ = "Homebrew Clang 20.1.8";
pub const __OBJC_BOOL_IS_BOOL = @as(c_int, 0);
pub const __CONSTANT_CFSTRINGS__ = @as(c_int, 1);
pub const __clang_literal_encoding__ = "UTF-8";
pub const __clang_wide_literal_encoding__ = "UTF-32";
pub const __OPTIMIZE__ = @as(c_int, 1);
pub const __OPTIMIZE_SIZE__ = @as(c_int, 1);
pub const __ORDER_LITTLE_ENDIAN__ = @as(c_int, 1234);
pub const __ORDER_BIG_ENDIAN__ = @as(c_int, 4321);
pub const __ORDER_PDP_ENDIAN__ = @as(c_int, 3412);
pub const __BYTE_ORDER__ = __ORDER_LITTLE_ENDIAN__;
pub const __LITTLE_ENDIAN__ = @as(c_int, 1);
pub const _ILP32 = @as(c_int, 1);
pub const __ILP32__ = @as(c_int, 1);
pub const __CHAR_BIT__ = @as(c_int, 8);
pub const __BOOL_WIDTH__ = @as(c_int, 1);
pub const __SHRT_WIDTH__ = @as(c_int, 16);
pub const __INT_WIDTH__ = @as(c_int, 32);
pub const __LONG_WIDTH__ = @as(c_int, 32);
pub const __LLONG_WIDTH__ = @as(c_int, 64);
pub const __BITINT_MAXWIDTH__ = @as(c_int, 128);
pub const __SCHAR_MAX__ = @as(c_int, 127);
pub const __SHRT_MAX__ = @as(c_int, 32767);
pub const __INT_MAX__ = @import("std").zig.c_translation.promoteIntLiteral(c_int, 2147483647, .decimal);
pub const __LONG_MAX__ = @as(c_long, 2147483647);
pub const __LONG_LONG_MAX__ = @as(c_longlong, 9223372036854775807);
pub const __WCHAR_MAX__ = @import("std").zig.c_translation.promoteIntLiteral(c_int, 2147483647, .decimal);
pub const __WCHAR_WIDTH__ = @as(c_int, 32);
pub const __WINT_MAX__ = @import("std").zig.c_translation.promoteIntLiteral(c_int, 2147483647, .decimal);
pub const __WINT_WIDTH__ = @as(c_int, 32);
pub const __INTMAX_MAX__ = @as(c_longlong, 9223372036854775807);
pub const __INTMAX_WIDTH__ = @as(c_int, 64);
pub const __SIZE_MAX__ = @as(c_ulong, 4294967295);
pub const __SIZE_WIDTH__ = @as(c_int, 32);
pub const __UINTMAX_MAX__ = @as(c_ulonglong, 18446744073709551615);
pub const __UINTMAX_WIDTH__ = @as(c_int, 64);
pub const __PTRDIFF_MAX__ = @as(c_long, 2147483647);
pub const __PTRDIFF_WIDTH__ = @as(c_int, 32);
pub const __INTPTR_MAX__ = @as(c_long, 2147483647);
pub const __INTPTR_WIDTH__ = @as(c_int, 32);
pub const __UINTPTR_MAX__ = @as(c_ulong, 4294967295);
pub const __UINTPTR_WIDTH__ = @as(c_int, 32);
pub const __SIZEOF_DOUBLE__ = @as(c_int, 8);
pub const __SIZEOF_FLOAT__ = @as(c_int, 4);
pub const __SIZEOF_INT__ = @as(c_int, 4);
pub const __SIZEOF_LONG__ = @as(c_int, 4);
pub const __SIZEOF_LONG_DOUBLE__ = @as(c_int, 16);
pub const __SIZEOF_LONG_LONG__ = @as(c_int, 8);
pub const __SIZEOF_POINTER__ = @as(c_int, 4);
pub const __SIZEOF_SHORT__ = @as(c_int, 2);
pub const __SIZEOF_PTRDIFF_T__ = @as(c_int, 4);
pub const __SIZEOF_SIZE_T__ = @as(c_int, 4);
pub const __SIZEOF_WCHAR_T__ = @as(c_int, 4);
pub const __SIZEOF_WINT_T__ = @as(c_int, 4);
pub const __SIZEOF_INT128__ = @as(c_int, 16);
pub const __INTMAX_TYPE__ = c_longlong;
pub const __INTMAX_FMTd__ = "lld";
pub const __INTMAX_FMTi__ = "lli";
pub const __INTMAX_C_SUFFIX__ = @compileError("unable to translate macro: undefined identifier `LL`");
// (no file):97:9
pub const __INTMAX_C = @import("std").zig.c_translation.Macros.LL_SUFFIX;
pub const __UINTMAX_TYPE__ = c_ulonglong;
pub const __UINTMAX_FMTo__ = "llo";
pub const __UINTMAX_FMTu__ = "llu";
pub const __UINTMAX_FMTx__ = "llx";
pub const __UINTMAX_FMTX__ = "llX";
pub const __UINTMAX_C_SUFFIX__ = @compileError("unable to translate macro: undefined identifier `ULL`");
// (no file):104:9
pub const __UINTMAX_C = @import("std").zig.c_translation.Macros.ULL_SUFFIX;
pub const __PTRDIFF_TYPE__ = c_long;
pub const __PTRDIFF_FMTd__ = "ld";
pub const __PTRDIFF_FMTi__ = "li";
pub const __INTPTR_TYPE__ = c_long;
pub const __INTPTR_FMTd__ = "ld";
pub const __INTPTR_FMTi__ = "li";
pub const __SIZE_TYPE__ = c_ulong;
pub const __SIZE_FMTo__ = "lo";
pub const __SIZE_FMTu__ = "lu";
pub const __SIZE_FMTx__ = "lx";
pub const __SIZE_FMTX__ = "lX";
pub const __WCHAR_TYPE__ = c_int;
pub const __WINT_TYPE__ = c_int;
pub const __SIG_ATOMIC_MAX__ = @as(c_long, 2147483647);
pub const __SIG_ATOMIC_WIDTH__ = @as(c_int, 32);
pub const __CHAR16_TYPE__ = c_ushort;
pub const __CHAR32_TYPE__ = c_uint;
pub const __UINTPTR_TYPE__ = c_ulong;
pub const __UINTPTR_FMTo__ = "lo";
pub const __UINTPTR_FMTu__ = "lu";
pub const __UINTPTR_FMTx__ = "lx";
pub const __UINTPTR_FMTX__ = "lX";
pub const __FLT_DENORM_MIN__ = @as(f32, 1.40129846e-45);
pub const __FLT_NORM_MAX__ = @as(f32, 3.40282347e+38);
pub const __FLT_HAS_DENORM__ = @as(c_int, 1);
pub const __FLT_DIG__ = @as(c_int, 6);
pub const __FLT_DECIMAL_DIG__ = @as(c_int, 9);
pub const __FLT_EPSILON__ = @as(f32, 1.19209290e-7);
pub const __FLT_HAS_INFINITY__ = @as(c_int, 1);
pub const __FLT_HAS_QUIET_NAN__ = @as(c_int, 1);
pub const __FLT_MANT_DIG__ = @as(c_int, 24);
pub const __FLT_MAX_10_EXP__ = @as(c_int, 38);
pub const __FLT_MAX_EXP__ = @as(c_int, 128);
pub const __FLT_MAX__ = @as(f32, 3.40282347e+38);
pub const __FLT_MIN_10_EXP__ = -@as(c_int, 37);
pub const __FLT_MIN_EXP__ = -@as(c_int, 125);
pub const __FLT_MIN__ = @as(f32, 1.17549435e-38);
pub const __DBL_DENORM_MIN__ = @as(f64, 4.9406564584124654e-324);
pub const __DBL_NORM_MAX__ = @as(f64, 1.7976931348623157e+308);
pub const __DBL_HAS_DENORM__ = @as(c_int, 1);
pub const __DBL_DIG__ = @as(c_int, 15);
pub const __DBL_DECIMAL_DIG__ = @as(c_int, 17);
pub const __DBL_EPSILON__ = @as(f64, 2.2204460492503131e-16);
pub const __DBL_HAS_INFINITY__ = @as(c_int, 1);
pub const __DBL_HAS_QUIET_NAN__ = @as(c_int, 1);
pub const __DBL_MANT_DIG__ = @as(c_int, 53);
pub const __DBL_MAX_10_EXP__ = @as(c_int, 308);
pub const __DBL_MAX_EXP__ = @as(c_int, 1024);
pub const __DBL_MAX__ = @as(f64, 1.7976931348623157e+308);
pub const __DBL_MIN_10_EXP__ = -@as(c_int, 307);
pub const __DBL_MIN_EXP__ = -@as(c_int, 1021);
pub const __DBL_MIN__ = @as(f64, 2.2250738585072014e-308);
pub const __LDBL_DENORM_MIN__ = @as(c_longdouble, 6.47517511943802511092443895822764655e-4966);
pub const __LDBL_NORM_MAX__ = @as(c_longdouble, 1.18973149535723176508575932662800702e+4932);
pub const __LDBL_HAS_DENORM__ = @as(c_int, 1);
pub const __LDBL_DIG__ = @as(c_int, 33);
pub const __LDBL_DECIMAL_DIG__ = @as(c_int, 36);
pub const __LDBL_EPSILON__ = @as(c_longdouble, 1.92592994438723585305597794258492732e-34);
pub const __LDBL_HAS_INFINITY__ = @as(c_int, 1);
pub const __LDBL_HAS_QUIET_NAN__ = @as(c_int, 1);
pub const __LDBL_MANT_DIG__ = @as(c_int, 113);
pub const __LDBL_MAX_10_EXP__ = @as(c_int, 4932);
pub const __LDBL_MAX_EXP__ = @as(c_int, 16384);
pub const __LDBL_MAX__ = @as(c_longdouble, 1.18973149535723176508575932662800702e+4932);
pub const __LDBL_MIN_10_EXP__ = -@as(c_int, 4931);
pub const __LDBL_MIN_EXP__ = -@as(c_int, 16381);
pub const __LDBL_MIN__ = @as(c_longdouble, 3.36210314311209350626267781732175260e-4932);
pub const __POINTER_WIDTH__ = @as(c_int, 32);
pub const __BIGGEST_ALIGNMENT__ = @as(c_int, 16);
pub const __INT8_TYPE__ = i8;
pub const __INT8_FMTd__ = "hhd";
pub const __INT8_FMTi__ = "hhi";
pub const __INT8_C_SUFFIX__ = "";
pub inline fn __INT8_C(c: anytype) @TypeOf(c) {
    _ = &c;
    return c;
}
pub const __INT16_TYPE__ = c_short;
pub const __INT16_FMTd__ = "hd";
pub const __INT16_FMTi__ = "hi";
pub const __INT16_C_SUFFIX__ = "";
pub inline fn __INT16_C(c: anytype) @TypeOf(c) {
    _ = &c;
    return c;
}
pub const __INT32_TYPE__ = c_int;
pub const __INT32_FMTd__ = "d";
pub const __INT32_FMTi__ = "i";
pub const __INT32_C_SUFFIX__ = "";
pub inline fn __INT32_C(c: anytype) @TypeOf(c) {
    _ = &c;
    return c;
}
pub const __INT64_TYPE__ = c_longlong;
pub const __INT64_FMTd__ = "lld";
pub const __INT64_FMTi__ = "lli";
pub const __INT64_C_SUFFIX__ = @compileError("unable to translate macro: undefined identifier `LL`");
// (no file):193:9
pub const __INT64_C = @import("std").zig.c_translation.Macros.LL_SUFFIX;
pub const __UINT8_TYPE__ = u8;
pub const __UINT8_FMTo__ = "hho";
pub const __UINT8_FMTu__ = "hhu";
pub const __UINT8_FMTx__ = "hhx";
pub const __UINT8_FMTX__ = "hhX";
pub const __UINT8_C_SUFFIX__ = "";
pub inline fn __UINT8_C(c: anytype) @TypeOf(c) {
    _ = &c;
    return c;
}
pub const __UINT8_MAX__ = @as(c_int, 255);
pub const __INT8_MAX__ = @as(c_int, 127);
pub const __UINT16_TYPE__ = c_ushort;
pub const __UINT16_FMTo__ = "ho";
pub const __UINT16_FMTu__ = "hu";
pub const __UINT16_FMTx__ = "hx";
pub const __UINT16_FMTX__ = "hX";
pub const __UINT16_C_SUFFIX__ = "";
pub inline fn __UINT16_C(c: anytype) @TypeOf(c) {
    _ = &c;
    return c;
}
pub const __UINT16_MAX__ = @import("std").zig.c_translation.promoteIntLiteral(c_int, 65535, .decimal);
pub const __INT16_MAX__ = @as(c_int, 32767);
pub const __UINT32_TYPE__ = c_uint;
pub const __UINT32_FMTo__ = "o";
pub const __UINT32_FMTu__ = "u";
pub const __UINT32_FMTx__ = "x";
pub const __UINT32_FMTX__ = "X";
pub const __UINT32_C_SUFFIX__ = @compileError("unable to translate macro: undefined identifier `U`");
// (no file):218:9
pub const __UINT32_C = @import("std").zig.c_translation.Macros.U_SUFFIX;
pub const __UINT32_MAX__ = @import("std").zig.c_translation.promoteIntLiteral(c_uint, 4294967295, .decimal);
pub const __INT32_MAX__ = @import("std").zig.c_translation.promoteIntLiteral(c_int, 2147483647, .decimal);
pub const __UINT64_TYPE__ = c_ulonglong;
pub const __UINT64_FMTo__ = "llo";
pub const __UINT64_FMTu__ = "llu";
pub const __UINT64_FMTx__ = "llx";
pub const __UINT64_FMTX__ = "llX";
pub const __UINT64_C_SUFFIX__ = @compileError("unable to translate macro: undefined identifier `ULL`");
// (no file):227:9
pub const __UINT64_C = @import("std").zig.c_translation.Macros.ULL_SUFFIX;
pub const __UINT64_MAX__ = @as(c_ulonglong, 18446744073709551615);
pub const __INT64_MAX__ = @as(c_longlong, 9223372036854775807);
pub const __INT_LEAST8_TYPE__ = i8;
pub const __INT_LEAST8_MAX__ = @as(c_int, 127);
pub const __INT_LEAST8_WIDTH__ = @as(c_int, 8);
pub const __INT_LEAST8_FMTd__ = "hhd";
pub const __INT_LEAST8_FMTi__ = "hhi";
pub const __UINT_LEAST8_TYPE__ = u8;
pub const __UINT_LEAST8_MAX__ = @as(c_int, 255);
pub const __UINT_LEAST8_FMTo__ = "hho";
pub const __UINT_LEAST8_FMTu__ = "hhu";
pub const __UINT_LEAST8_FMTx__ = "hhx";
pub const __UINT_LEAST8_FMTX__ = "hhX";
pub const __INT_LEAST16_TYPE__ = c_short;
pub const __INT_LEAST16_MAX__ = @as(c_int, 32767);
pub const __INT_LEAST16_WIDTH__ = @as(c_int, 16);
pub const __INT_LEAST16_FMTd__ = "hd";
pub const __INT_LEAST16_FMTi__ = "hi";
pub const __UINT_LEAST16_TYPE__ = c_ushort;
pub const __UINT_LEAST16_MAX__ = @import("std").zig.c_translation.promoteIntLiteral(c_int, 65535, .decimal);
pub const __UINT_LEAST16_FMTo__ = "ho";
pub const __UINT_LEAST16_FMTu__ = "hu";
pub const __UINT_LEAST16_FMTx__ = "hx";
pub const __UINT_LEAST16_FMTX__ = "hX";
pub const __INT_LEAST32_TYPE__ = c_int;
pub const __INT_LEAST32_MAX__ = @import("std").zig.c_translation.promoteIntLiteral(c_int, 2147483647, .decimal);
pub const __INT_LEAST32_WIDTH__ = @as(c_int, 32);
pub const __INT_LEAST32_FMTd__ = "d";
pub const __INT_LEAST32_FMTi__ = "i";
pub const __UINT_LEAST32_TYPE__ = c_uint;
pub const __UINT_LEAST32_MAX__ = @import("std").zig.c_translation.promoteIntLiteral(c_uint, 4294967295, .decimal);
pub const __UINT_LEAST32_FMTo__ = "o";
pub const __UINT_LEAST32_FMTu__ = "u";
pub const __UINT_LEAST32_FMTx__ = "x";
pub const __UINT_LEAST32_FMTX__ = "X";
pub const __INT_LEAST64_TYPE__ = c_longlong;
pub const __INT_LEAST64_MAX__ = @as(c_longlong, 9223372036854775807);
pub const __INT_LEAST64_WIDTH__ = @as(c_int, 64);
pub const __INT_LEAST64_FMTd__ = "lld";
pub const __INT_LEAST64_FMTi__ = "lli";
pub const __UINT_LEAST64_TYPE__ = c_ulonglong;
pub const __UINT_LEAST64_MAX__ = @as(c_ulonglong, 18446744073709551615);
pub const __UINT_LEAST64_FMTo__ = "llo";
pub const __UINT_LEAST64_FMTu__ = "llu";
pub const __UINT_LEAST64_FMTx__ = "llx";
pub const __UINT_LEAST64_FMTX__ = "llX";
pub const __INT_FAST8_TYPE__ = i8;
pub const __INT_FAST8_MAX__ = @as(c_int, 127);
pub const __INT_FAST8_WIDTH__ = @as(c_int, 8);
pub const __INT_FAST8_FMTd__ = "hhd";
pub const __INT_FAST8_FMTi__ = "hhi";
pub const __UINT_FAST8_TYPE__ = u8;
pub const __UINT_FAST8_MAX__ = @as(c_int, 255);
pub const __UINT_FAST8_FMTo__ = "hho";
pub const __UINT_FAST8_FMTu__ = "hhu";
pub const __UINT_FAST8_FMTx__ = "hhx";
pub const __UINT_FAST8_FMTX__ = "hhX";
pub const __INT_FAST16_TYPE__ = c_short;
pub const __INT_FAST16_MAX__ = @as(c_int, 32767);
pub const __INT_FAST16_WIDTH__ = @as(c_int, 16);
pub const __INT_FAST16_FMTd__ = "hd";
pub const __INT_FAST16_FMTi__ = "hi";
pub const __UINT_FAST16_TYPE__ = c_ushort;
pub const __UINT_FAST16_MAX__ = @import("std").zig.c_translation.promoteIntLiteral(c_int, 65535, .decimal);
pub const __UINT_FAST16_FMTo__ = "ho";
pub const __UINT_FAST16_FMTu__ = "hu";
pub const __UINT_FAST16_FMTx__ = "hx";
pub const __UINT_FAST16_FMTX__ = "hX";
pub const __INT_FAST32_TYPE__ = c_int;
pub const __INT_FAST32_MAX__ = @import("std").zig.c_translation.promoteIntLiteral(c_int, 2147483647, .decimal);
pub const __INT_FAST32_WIDTH__ = @as(c_int, 32);
pub const __INT_FAST32_FMTd__ = "d";
pub const __INT_FAST32_FMTi__ = "i";
pub const __UINT_FAST32_TYPE__ = c_uint;
pub const __UINT_FAST32_MAX__ = @import("std").zig.c_translation.promoteIntLiteral(c_uint, 4294967295, .decimal);
pub const __UINT_FAST32_FMTo__ = "o";
pub const __UINT_FAST32_FMTu__ = "u";
pub const __UINT_FAST32_FMTx__ = "x";
pub const __UINT_FAST32_FMTX__ = "X";
pub const __INT_FAST64_TYPE__ = c_longlong;
pub const __INT_FAST64_MAX__ = @as(c_longlong, 9223372036854775807);
pub const __INT_FAST64_WIDTH__ = @as(c_int, 64);
pub const __INT_FAST64_FMTd__ = "lld";
pub const __INT_FAST64_FMTi__ = "lli";
pub const __UINT_FAST64_TYPE__ = c_ulonglong;
pub const __UINT_FAST64_MAX__ = @as(c_ulonglong, 18446744073709551615);
pub const __UINT_FAST64_FMTo__ = "llo";
pub const __UINT_FAST64_FMTu__ = "llu";
pub const __UINT_FAST64_FMTx__ = "llx";
pub const __UINT_FAST64_FMTX__ = "llX";
pub const __USER_LABEL_PREFIX__ = "";
pub const __NO_MATH_ERRNO__ = @as(c_int, 1);
pub const __FINITE_MATH_ONLY__ = @as(c_int, 0);
pub const __GNUC_STDC_INLINE__ = @as(c_int, 1);
pub const __GCC_ATOMIC_TEST_AND_SET_TRUEVAL = @as(c_int, 1);
pub const __GCC_DESTRUCTIVE_SIZE = @as(c_int, 64);
pub const __GCC_CONSTRUCTIVE_SIZE = @as(c_int, 64);
pub const __CLANG_ATOMIC_BOOL_LOCK_FREE = @as(c_int, 2);
pub const __CLANG_ATOMIC_CHAR_LOCK_FREE = @as(c_int, 2);
pub const __CLANG_ATOMIC_CHAR16_T_LOCK_FREE = @as(c_int, 2);
pub const __CLANG_ATOMIC_CHAR32_T_LOCK_FREE = @as(c_int, 2);
pub const __CLANG_ATOMIC_WCHAR_T_LOCK_FREE = @as(c_int, 2);
pub const __CLANG_ATOMIC_SHORT_LOCK_FREE = @as(c_int, 2);
pub const __CLANG_ATOMIC_INT_LOCK_FREE = @as(c_int, 2);
pub const __CLANG_ATOMIC_LONG_LOCK_FREE = @as(c_int, 2);
pub const __CLANG_ATOMIC_LLONG_LOCK_FREE = @as(c_int, 2);
pub const __CLANG_ATOMIC_POINTER_LOCK_FREE = @as(c_int, 2);
pub const __GCC_ATOMIC_BOOL_LOCK_FREE = @as(c_int, 2);
pub const __GCC_ATOMIC_CHAR_LOCK_FREE = @as(c_int, 2);
pub const __GCC_ATOMIC_CHAR16_T_LOCK_FREE = @as(c_int, 2);
pub const __GCC_ATOMIC_CHAR32_T_LOCK_FREE = @as(c_int, 2);
pub const __GCC_ATOMIC_WCHAR_T_LOCK_FREE = @as(c_int, 2);
pub const __GCC_ATOMIC_SHORT_LOCK_FREE = @as(c_int, 2);
pub const __GCC_ATOMIC_INT_LOCK_FREE = @as(c_int, 2);
pub const __GCC_ATOMIC_LONG_LOCK_FREE = @as(c_int, 2);
pub const __GCC_ATOMIC_LLONG_LOCK_FREE = @as(c_int, 2);
pub const __GCC_ATOMIC_POINTER_LOCK_FREE = @as(c_int, 2);
pub const __FLT_RADIX__ = @as(c_int, 2);
pub const __DECIMAL_DIG__ = __LDBL_DECIMAL_DIG__;
pub const __wasm = @as(c_int, 1);
pub const __wasm__ = @as(c_int, 1);
pub const __wasm_bulk_memory_opt__ = @as(c_int, 1);
pub const __wasm_extended_const__ = @as(c_int, 1);
pub const __wasm_multivalue__ = @as(c_int, 1);
pub const __wasm_mutable_globals__ = @as(c_int, 1);
pub const __wasm_nontrapping_fptoint__ = @as(c_int, 1);
pub const __wasm_sign_ext__ = @as(c_int, 1);
pub const __GCC_HAVE_SYNC_COMPARE_AND_SWAP_1 = @as(c_int, 1);
pub const __GCC_HAVE_SYNC_COMPARE_AND_SWAP_2 = @as(c_int, 1);
pub const __GCC_HAVE_SYNC_COMPARE_AND_SWAP_4 = @as(c_int, 1);
pub const __GCC_HAVE_SYNC_COMPARE_AND_SWAP_8 = @as(c_int, 1);
pub const __wasm32 = @as(c_int, 1);
pub const __wasm32__ = @as(c_int, 1);
pub const __FLOAT128__ = @as(c_int, 1);
pub const __wasi__ = @as(c_int, 1);
pub const __STDC__ = @as(c_int, 1);
pub const __STDC_HOSTED__ = @as(c_int, 1);
pub const __STDC_VERSION__ = @as(c_long, 201710);
pub const __STDC_UTF_16__ = @as(c_int, 1);
pub const __STDC_UTF_32__ = @as(c_int, 1);
pub const __STDC_EMBED_NOT_FOUND__ = @as(c_int, 0);
pub const __STDC_EMBED_FOUND__ = @as(c_int, 1);
pub const __STDC_EMBED_EMPTY__ = @as(c_int, 2);
pub const NDEBUG = @as(c_int, 1);
pub const __BINDINGS_HTTP_TRIGGER_H = "";
pub const __CLANG_STDINT_H = "";
pub const _STDINT_H = "";
pub const __NEED_int8_t = "";
pub const __NEED_int16_t = "";
pub const __NEED_int32_t = "";
pub const __NEED_int64_t = "";
pub const __NEED_uint8_t = "";
pub const __NEED_uint16_t = "";
pub const __NEED_uint32_t = "";
pub const __NEED_uint64_t = "";
pub const __NEED_intptr_t = "";
pub const __NEED_uintptr_t = "";
pub const __NEED_intmax_t = "";
pub const __NEED_uintmax_t = "";
pub const _Addr = c_long;
pub const _Int64 = c_longlong;
pub const _Reg = c_longlong;
pub const __BYTE_ORDER = __BYTE_ORDER__;
pub const __LONG_MAX = __LONG_MAX__;
pub const __LITTLE_ENDIAN = @as(c_int, 1234);
pub const __BIG_ENDIAN = @as(c_int, 4321);
pub const __USE_TIME_BITS64 = @as(c_int, 1);
pub const __DEFINED_uintptr_t = "";
pub const __DEFINED_intptr_t = "";
pub const __DEFINED_int8_t = "";
pub const __DEFINED_int16_t = "";
pub const __DEFINED_int32_t = "";
pub const __DEFINED_int64_t = "";
pub const __DEFINED_intmax_t = "";
pub const __DEFINED_uint8_t = "";
pub const __DEFINED_uint16_t = "";
pub const __DEFINED_uint32_t = "";
pub const __DEFINED_uint64_t = "";
pub const __DEFINED_uintmax_t = "";
pub const __wasilibc___struct_timeval_h = "";
pub const __wasilibc___typedef_time_t_h = "";
pub const __wasilibc___typedef_suseconds_t_h = "";
pub const __wasilibc___struct_timespec_h = "";
pub const __wasilibc___struct_iovec_h = "";
pub const __need_size_t = "";
pub const _SIZE_T = "";
pub const INT8_MIN = -@as(c_int, 1) - @as(c_int, 0x7f);
pub const INT16_MIN = -@as(c_int, 1) - @as(c_int, 0x7fff);
pub const INT32_MIN = -@as(c_int, 1) - @import("std").zig.c_translation.promoteIntLiteral(c_int, 0x7fffffff, .hex);
pub const INT64_MIN = -@as(c_int, 1) - @import("std").zig.c_translation.promoteIntLiteral(c_int, 0x7fffffffffffffff, .hex);
pub const INT8_MAX = @as(c_int, 0x7f);
pub const INT16_MAX = @as(c_int, 0x7fff);
pub const INT32_MAX = @import("std").zig.c_translation.promoteIntLiteral(c_int, 0x7fffffff, .hex);
pub const INT64_MAX = @import("std").zig.c_translation.promoteIntLiteral(c_int, 0x7fffffffffffffff, .hex);
pub const UINT8_MAX = @as(c_int, 0xff);
pub const UINT16_MAX = @import("std").zig.c_translation.promoteIntLiteral(c_int, 0xffff, .hex);
pub const UINT32_MAX = @import("std").zig.c_translation.promoteIntLiteral(c_uint, 0xffffffff, .hex);
pub const UINT64_MAX = @import("std").zig.c_translation.promoteIntLiteral(c_uint, 0xffffffffffffffff, .hex);
pub const INT_FAST8_MIN = INT8_MIN;
pub const INT_FAST64_MIN = INT64_MIN;
pub const INT_LEAST8_MIN = INT8_MIN;
pub const INT_LEAST16_MIN = INT16_MIN;
pub const INT_LEAST32_MIN = INT32_MIN;
pub const INT_LEAST64_MIN = INT64_MIN;
pub const INT_FAST8_MAX = INT8_MAX;
pub const INT_FAST64_MAX = INT64_MAX;
pub const INT_LEAST8_MAX = INT8_MAX;
pub const INT_LEAST16_MAX = INT16_MAX;
pub const INT_LEAST32_MAX = INT32_MAX;
pub const INT_LEAST64_MAX = INT64_MAX;
pub const UINT_FAST8_MAX = UINT8_MAX;
pub const UINT_FAST64_MAX = UINT64_MAX;
pub const UINT_LEAST8_MAX = UINT8_MAX;
pub const UINT_LEAST16_MAX = UINT16_MAX;
pub const UINT_LEAST32_MAX = UINT32_MAX;
pub const UINT_LEAST64_MAX = UINT64_MAX;
pub const INTMAX_MIN = INT64_MIN;
pub const INTMAX_MAX = INT64_MAX;
pub const UINTMAX_MAX = UINT64_MAX;
pub const WINT_MIN = @as(c_uint, 0);
pub const WINT_MAX = UINT32_MAX;
pub const WCHAR_MAX = @import("std").zig.c_translation.promoteIntLiteral(c_int, 0x7fffffff, .hex) + '\x00';
pub const WCHAR_MIN = (-@as(c_int, 1) - @import("std").zig.c_translation.promoteIntLiteral(c_int, 0x7fffffff, .hex)) + '\x00';
pub const SIG_ATOMIC_MIN = INT32_MIN;
pub const SIG_ATOMIC_MAX = INT32_MAX;
pub const INT_FAST16_MIN = INT16_MIN;
pub const INT_FAST32_MIN = INT32_MIN;
pub const INT_FAST16_MAX = INT16_MAX;
pub const INT_FAST32_MAX = INT32_MAX;
pub const UINT_FAST16_MAX = UINT16_MAX;
pub const UINT_FAST32_MAX = UINT32_MAX;
pub const INTPTR_MIN = INT32_MIN;
pub const INTPTR_MAX = INT32_MAX;
pub const UINTPTR_MAX = UINT32_MAX;
pub const PTRDIFF_MIN = INT32_MIN;
pub const PTRDIFF_MAX = INT32_MAX;
pub const SIZE_MAX = UINT32_MAX;
pub inline fn INT8_C(c: anytype) @TypeOf(c) {
    _ = &c;
    return c;
}
pub inline fn INT16_C(c: anytype) @TypeOf(c) {
    _ = &c;
    return c;
}
pub inline fn INT32_C(c: anytype) @TypeOf(c) {
    _ = &c;
    return c;
}
pub inline fn UINT8_C(c: anytype) @TypeOf(c) {
    _ = &c;
    return c;
}
pub inline fn UINT16_C(c: anytype) @TypeOf(c) {
    _ = &c;
    return c;
}
pub const UINT32_C = @import("std").zig.c_translation.Macros.U_SUFFIX;
pub const INT64_C = @import("std").zig.c_translation.Macros.LL_SUFFIX;
pub const UINT64_C = @import("std").zig.c_translation.Macros.ULL_SUFFIX;
pub const INTMAX_C = @import("std").zig.c_translation.Macros.LL_SUFFIX;
pub const UINTMAX_C = @import("std").zig.c_translation.Macros.ULL_SUFFIX;
pub const __STDBOOL_H = "";
pub const __bool_true_false_are_defined = @as(c_int, 1);
pub const @"bool" = bool;
pub const @"true" = @as(c_int, 1);
pub const @"false" = @as(c_int, 0);
pub const __need_ptrdiff_t = "";
pub const __need_wchar_t = "";
pub const __need_NULL = "";
pub const __need_max_align_t = "";
pub const __need_offsetof = "";
pub const __STDDEF_H = "";
pub const _PTRDIFF_T = "";
pub const _WCHAR_T = "";
pub const NULL = @import("std").zig.c_translation.cast(?*anyopaque, @as(c_int, 0));
pub const __CLANG_MAX_ALIGN_T_DEFINED = "";
pub const offsetof = @compileError("unable to translate C expr: unexpected token 'an identifier'");
// /opt/homebrew/Cellar/zig/0.15.2/lib/zig/include/__stddef_offsetof.h:16:9
pub const WASI_IO_0_2_0_STREAMS_STREAM_ERROR_LAST_OPERATION_FAILED = @as(c_int, 0);
pub const WASI_IO_0_2_0_STREAMS_STREAM_ERROR_CLOSED = @as(c_int, 1);
pub const WASI_HTTP_0_2_0_TYPES_METHOD_GET = @as(c_int, 0);
pub const WASI_HTTP_0_2_0_TYPES_METHOD_HEAD = @as(c_int, 1);
pub const WASI_HTTP_0_2_0_TYPES_METHOD_POST = @as(c_int, 2);
pub const WASI_HTTP_0_2_0_TYPES_METHOD_PUT = @as(c_int, 3);
pub const WASI_HTTP_0_2_0_TYPES_METHOD_DELETE = @as(c_int, 4);
pub const WASI_HTTP_0_2_0_TYPES_METHOD_CONNECT = @as(c_int, 5);
pub const WASI_HTTP_0_2_0_TYPES_METHOD_OPTIONS = @as(c_int, 6);
pub const WASI_HTTP_0_2_0_TYPES_METHOD_TRACE = @as(c_int, 7);
pub const WASI_HTTP_0_2_0_TYPES_METHOD_PATCH = @as(c_int, 8);
pub const WASI_HTTP_0_2_0_TYPES_METHOD_OTHER = @as(c_int, 9);
pub const WASI_HTTP_0_2_0_TYPES_SCHEME_HTTP = @as(c_int, 0);
pub const WASI_HTTP_0_2_0_TYPES_SCHEME_HTTPS = @as(c_int, 1);
pub const WASI_HTTP_0_2_0_TYPES_SCHEME_OTHER = @as(c_int, 2);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_DNS_TIMEOUT = @as(c_int, 0);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_DNS_ERROR = @as(c_int, 1);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_DESTINATION_NOT_FOUND = @as(c_int, 2);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_DESTINATION_UNAVAILABLE = @as(c_int, 3);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_DESTINATION_IP_PROHIBITED = @as(c_int, 4);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_DESTINATION_IP_UNROUTABLE = @as(c_int, 5);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_CONNECTION_REFUSED = @as(c_int, 6);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_CONNECTION_TERMINATED = @as(c_int, 7);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_CONNECTION_TIMEOUT = @as(c_int, 8);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_CONNECTION_READ_TIMEOUT = @as(c_int, 9);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_CONNECTION_WRITE_TIMEOUT = @as(c_int, 10);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_CONNECTION_LIMIT_REACHED = @as(c_int, 11);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_TLS_PROTOCOL_ERROR = @as(c_int, 12);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_TLS_CERTIFICATE_ERROR = @as(c_int, 13);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_TLS_ALERT_RECEIVED = @as(c_int, 14);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_REQUEST_DENIED = @as(c_int, 15);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_REQUEST_LENGTH_REQUIRED = @as(c_int, 16);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_REQUEST_BODY_SIZE = @as(c_int, 17);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_REQUEST_METHOD_INVALID = @as(c_int, 18);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_REQUEST_URI_INVALID = @as(c_int, 19);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_REQUEST_URI_TOO_LONG = @as(c_int, 20);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_REQUEST_HEADER_SECTION_SIZE = @as(c_int, 21);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_REQUEST_HEADER_SIZE = @as(c_int, 22);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_REQUEST_TRAILER_SECTION_SIZE = @as(c_int, 23);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_REQUEST_TRAILER_SIZE = @as(c_int, 24);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_RESPONSE_INCOMPLETE = @as(c_int, 25);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_RESPONSE_HEADER_SECTION_SIZE = @as(c_int, 26);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_RESPONSE_HEADER_SIZE = @as(c_int, 27);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_RESPONSE_BODY_SIZE = @as(c_int, 28);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_RESPONSE_TRAILER_SECTION_SIZE = @as(c_int, 29);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_RESPONSE_TRAILER_SIZE = @as(c_int, 30);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_RESPONSE_TRANSFER_CODING = @as(c_int, 31);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_RESPONSE_CONTENT_CODING = @as(c_int, 32);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_RESPONSE_TIMEOUT = @as(c_int, 33);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_UPGRADE_FAILED = @as(c_int, 34);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_HTTP_PROTOCOL_ERROR = @as(c_int, 35);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_LOOP_DETECTED = @as(c_int, 36);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_CONFIGURATION_ERROR = @as(c_int, 37);
pub const WASI_HTTP_0_2_0_TYPES_ERROR_CODE_INTERNAL_ERROR = @as(c_int, 38);
pub const WASI_HTTP_0_2_0_TYPES_HEADER_ERROR_INVALID_SYNTAX = @as(c_int, 0);
pub const WASI_HTTP_0_2_0_TYPES_HEADER_ERROR_FORBIDDEN = @as(c_int, 1);
pub const WASI_HTTP_0_2_0_TYPES_HEADER_ERROR_IMMUTABLE = @as(c_int, 2);
pub const FERMYON_SPIN_2_0_0_LLM_ERROR_MODEL_NOT_SUPPORTED = @as(c_int, 0);
pub const FERMYON_SPIN_2_0_0_LLM_ERROR_RUNTIME_ERROR = @as(c_int, 1);
pub const FERMYON_SPIN_2_0_0_LLM_ERROR_INVALID_INPUT = @as(c_int, 2);
pub const FERMYON_SPIN_2_0_0_REDIS_ERROR_INVALID_ADDRESS = @as(c_int, 0);
pub const FERMYON_SPIN_2_0_0_REDIS_ERROR_TOO_MANY_CONNECTIONS = @as(c_int, 1);
pub const FERMYON_SPIN_2_0_0_REDIS_ERROR_TYPE_ERROR = @as(c_int, 2);
pub const FERMYON_SPIN_2_0_0_REDIS_ERROR_OTHER = @as(c_int, 3);
pub const FERMYON_SPIN_2_0_0_REDIS_REDIS_PARAMETER_INT64 = @as(c_int, 0);
pub const FERMYON_SPIN_2_0_0_REDIS_REDIS_PARAMETER_BINARY = @as(c_int, 1);
pub const FERMYON_SPIN_2_0_0_REDIS_REDIS_RESULT_NIL = @as(c_int, 0);
pub const FERMYON_SPIN_2_0_0_REDIS_REDIS_RESULT_STATUS = @as(c_int, 1);
pub const FERMYON_SPIN_2_0_0_REDIS_REDIS_RESULT_INT64 = @as(c_int, 2);
pub const FERMYON_SPIN_2_0_0_REDIS_REDIS_RESULT_BINARY = @as(c_int, 3);
pub const FERMYON_SPIN_2_0_0_MQTT_ERROR_INVALID_ADDRESS = @as(c_int, 0);
pub const FERMYON_SPIN_2_0_0_MQTT_ERROR_TOO_MANY_CONNECTIONS = @as(c_int, 1);
pub const FERMYON_SPIN_2_0_0_MQTT_ERROR_CONNECTION_FAILED = @as(c_int, 2);
pub const FERMYON_SPIN_2_0_0_MQTT_ERROR_OTHER = @as(c_int, 3);
pub const FERMYON_SPIN_2_0_0_MQTT_QOS_AT_MOST_ONCE = @as(c_int, 0);
pub const FERMYON_SPIN_2_0_0_MQTT_QOS_AT_LEAST_ONCE = @as(c_int, 1);
pub const FERMYON_SPIN_2_0_0_MQTT_QOS_EXACTLY_ONCE = @as(c_int, 2);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_ERROR_CONNECTION_FAILED = @as(c_int, 0);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_ERROR_BAD_PARAMETER = @as(c_int, 1);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_ERROR_QUERY_FAILED = @as(c_int, 2);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_ERROR_VALUE_CONVERSION_FAILED = @as(c_int, 3);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_ERROR_OTHER = @as(c_int, 4);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_DATA_TYPE_BOOLEAN = @as(c_int, 0);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_DATA_TYPE_INT8 = @as(c_int, 1);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_DATA_TYPE_INT16 = @as(c_int, 2);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_DATA_TYPE_INT32 = @as(c_int, 3);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_DATA_TYPE_INT64 = @as(c_int, 4);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_DATA_TYPE_UINT8 = @as(c_int, 5);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_DATA_TYPE_UINT16 = @as(c_int, 6);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_DATA_TYPE_UINT32 = @as(c_int, 7);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_DATA_TYPE_UINT64 = @as(c_int, 8);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_DATA_TYPE_FLOATING32 = @as(c_int, 9);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_DATA_TYPE_FLOATING64 = @as(c_int, 10);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_DATA_TYPE_STR = @as(c_int, 11);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_DATA_TYPE_BINARY = @as(c_int, 12);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_DATA_TYPE_OTHER = @as(c_int, 13);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_VALUE_BOOLEAN = @as(c_int, 0);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_VALUE_INT8 = @as(c_int, 1);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_VALUE_INT16 = @as(c_int, 2);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_VALUE_INT32 = @as(c_int, 3);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_VALUE_INT64 = @as(c_int, 4);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_VALUE_UINT8 = @as(c_int, 5);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_VALUE_UINT16 = @as(c_int, 6);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_VALUE_UINT32 = @as(c_int, 7);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_VALUE_UINT64 = @as(c_int, 8);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_VALUE_FLOATING32 = @as(c_int, 9);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_VALUE_FLOATING64 = @as(c_int, 10);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_VALUE_STR = @as(c_int, 11);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_VALUE_BINARY = @as(c_int, 12);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_VALUE_DB_NULL = @as(c_int, 13);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_DB_VALUE_UNSUPPORTED = @as(c_int, 14);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_PARAMETER_VALUE_BOOLEAN = @as(c_int, 0);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_PARAMETER_VALUE_INT8 = @as(c_int, 1);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_PARAMETER_VALUE_INT16 = @as(c_int, 2);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_PARAMETER_VALUE_INT32 = @as(c_int, 3);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_PARAMETER_VALUE_INT64 = @as(c_int, 4);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_PARAMETER_VALUE_UINT8 = @as(c_int, 5);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_PARAMETER_VALUE_UINT16 = @as(c_int, 6);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_PARAMETER_VALUE_UINT32 = @as(c_int, 7);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_PARAMETER_VALUE_UINT64 = @as(c_int, 8);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_PARAMETER_VALUE_FLOATING32 = @as(c_int, 9);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_PARAMETER_VALUE_FLOATING64 = @as(c_int, 10);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_PARAMETER_VALUE_STR = @as(c_int, 11);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_PARAMETER_VALUE_BINARY = @as(c_int, 12);
pub const FERMYON_SPIN_2_0_0_RDBMS_TYPES_PARAMETER_VALUE_DB_NULL = @as(c_int, 13);
pub const FERMYON_SPIN_2_0_0_SQLITE_ERROR_NO_SUCH_DATABASE = @as(c_int, 0);
pub const FERMYON_SPIN_2_0_0_SQLITE_ERROR_ACCESS_DENIED = @as(c_int, 1);
pub const FERMYON_SPIN_2_0_0_SQLITE_ERROR_INVALID_CONNECTION = @as(c_int, 2);
pub const FERMYON_SPIN_2_0_0_SQLITE_ERROR_DATABASE_FULL = @as(c_int, 3);
pub const FERMYON_SPIN_2_0_0_SQLITE_ERROR_IO = @as(c_int, 4);
pub const FERMYON_SPIN_2_0_0_SQLITE_VALUE_INTEGER = @as(c_int, 0);
pub const FERMYON_SPIN_2_0_0_SQLITE_VALUE_REAL = @as(c_int, 1);
pub const FERMYON_SPIN_2_0_0_SQLITE_VALUE_TEXT = @as(c_int, 2);
pub const FERMYON_SPIN_2_0_0_SQLITE_VALUE_BLOB = @as(c_int, 3);
pub const FERMYON_SPIN_2_0_0_SQLITE_VALUE_NULL = @as(c_int, 4);
pub const FERMYON_SPIN_2_0_0_KEY_VALUE_ERROR_STORE_TABLE_FULL = @as(c_int, 0);
pub const FERMYON_SPIN_2_0_0_KEY_VALUE_ERROR_NO_SUCH_STORE = @as(c_int, 1);
pub const FERMYON_SPIN_2_0_0_KEY_VALUE_ERROR_ACCESS_DENIED = @as(c_int, 2);
pub const FERMYON_SPIN_2_0_0_KEY_VALUE_ERROR_OTHER = @as(c_int, 3);
pub const FERMYON_SPIN_2_0_0_VARIABLES_ERROR_INVALID_NAME = @as(c_int, 0);
pub const FERMYON_SPIN_2_0_0_VARIABLES_ERROR_UNDEFINED = @as(c_int, 1);
pub const FERMYON_SPIN_2_0_0_VARIABLES_ERROR_PROVIDER = @as(c_int, 2);
pub const FERMYON_SPIN_2_0_0_VARIABLES_ERROR_OTHER = @as(c_int, 3);
pub const WASI_FILESYSTEM_0_2_0_TYPES_DESCRIPTOR_TYPE_UNKNOWN = @as(c_int, 0);
pub const WASI_FILESYSTEM_0_2_0_TYPES_DESCRIPTOR_TYPE_BLOCK_DEVICE = @as(c_int, 1);
pub const WASI_FILESYSTEM_0_2_0_TYPES_DESCRIPTOR_TYPE_CHARACTER_DEVICE = @as(c_int, 2);
pub const WASI_FILESYSTEM_0_2_0_TYPES_DESCRIPTOR_TYPE_DIRECTORY = @as(c_int, 3);
pub const WASI_FILESYSTEM_0_2_0_TYPES_DESCRIPTOR_TYPE_FIFO = @as(c_int, 4);
pub const WASI_FILESYSTEM_0_2_0_TYPES_DESCRIPTOR_TYPE_SYMBOLIC_LINK = @as(c_int, 5);
pub const WASI_FILESYSTEM_0_2_0_TYPES_DESCRIPTOR_TYPE_REGULAR_FILE = @as(c_int, 6);
pub const WASI_FILESYSTEM_0_2_0_TYPES_DESCRIPTOR_TYPE_SOCKET = @as(c_int, 7);
pub const WASI_FILESYSTEM_0_2_0_TYPES_DESCRIPTOR_FLAGS_READ = @as(c_int, 1) << @as(c_int, 0);
pub const WASI_FILESYSTEM_0_2_0_TYPES_DESCRIPTOR_FLAGS_WRITE = @as(c_int, 1) << @as(c_int, 1);
pub const WASI_FILESYSTEM_0_2_0_TYPES_DESCRIPTOR_FLAGS_FILE_INTEGRITY_SYNC = @as(c_int, 1) << @as(c_int, 2);
pub const WASI_FILESYSTEM_0_2_0_TYPES_DESCRIPTOR_FLAGS_DATA_INTEGRITY_SYNC = @as(c_int, 1) << @as(c_int, 3);
pub const WASI_FILESYSTEM_0_2_0_TYPES_DESCRIPTOR_FLAGS_REQUESTED_WRITE_SYNC = @as(c_int, 1) << @as(c_int, 4);
pub const WASI_FILESYSTEM_0_2_0_TYPES_DESCRIPTOR_FLAGS_MUTATE_DIRECTORY = @as(c_int, 1) << @as(c_int, 5);
pub const WASI_FILESYSTEM_0_2_0_TYPES_PATH_FLAGS_SYMLINK_FOLLOW = @as(c_int, 1) << @as(c_int, 0);
pub const WASI_FILESYSTEM_0_2_0_TYPES_OPEN_FLAGS_CREATE = @as(c_int, 1) << @as(c_int, 0);
pub const WASI_FILESYSTEM_0_2_0_TYPES_OPEN_FLAGS_DIRECTORY = @as(c_int, 1) << @as(c_int, 1);
pub const WASI_FILESYSTEM_0_2_0_TYPES_OPEN_FLAGS_EXCLUSIVE = @as(c_int, 1) << @as(c_int, 2);
pub const WASI_FILESYSTEM_0_2_0_TYPES_OPEN_FLAGS_TRUNCATE = @as(c_int, 1) << @as(c_int, 3);
pub const WASI_FILESYSTEM_0_2_0_TYPES_NEW_TIMESTAMP_NO_CHANGE = @as(c_int, 0);
pub const WASI_FILESYSTEM_0_2_0_TYPES_NEW_TIMESTAMP_NOW = @as(c_int, 1);
pub const WASI_FILESYSTEM_0_2_0_TYPES_NEW_TIMESTAMP_TIMESTAMP = @as(c_int, 2);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_ACCESS = @as(c_int, 0);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_WOULD_BLOCK = @as(c_int, 1);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_ALREADY = @as(c_int, 2);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_BAD_DESCRIPTOR = @as(c_int, 3);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_BUSY = @as(c_int, 4);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_DEADLOCK = @as(c_int, 5);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_QUOTA = @as(c_int, 6);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_EXIST = @as(c_int, 7);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_FILE_TOO_LARGE = @as(c_int, 8);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_ILLEGAL_BYTE_SEQUENCE = @as(c_int, 9);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_IN_PROGRESS = @as(c_int, 10);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_INTERRUPTED = @as(c_int, 11);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_INVALID = @as(c_int, 12);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_IO = @as(c_int, 13);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_IS_DIRECTORY = @as(c_int, 14);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_LOOP = @as(c_int, 15);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_TOO_MANY_LINKS = @as(c_int, 16);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_MESSAGE_SIZE = @as(c_int, 17);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_NAME_TOO_LONG = @as(c_int, 18);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_NO_DEVICE = @as(c_int, 19);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_NO_ENTRY = @as(c_int, 20);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_NO_LOCK = @as(c_int, 21);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_INSUFFICIENT_MEMORY = @as(c_int, 22);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_INSUFFICIENT_SPACE = @as(c_int, 23);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_NOT_DIRECTORY = @as(c_int, 24);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_NOT_EMPTY = @as(c_int, 25);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_NOT_RECOVERABLE = @as(c_int, 26);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_UNSUPPORTED = @as(c_int, 27);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_NO_TTY = @as(c_int, 28);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_NO_SUCH_DEVICE = @as(c_int, 29);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_OVERFLOW = @as(c_int, 30);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_NOT_PERMITTED = @as(c_int, 31);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_PIPE = @as(c_int, 32);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_READ_ONLY = @as(c_int, 33);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_INVALID_SEEK = @as(c_int, 34);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_TEXT_FILE_BUSY = @as(c_int, 35);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ERROR_CODE_CROSS_DEVICE = @as(c_int, 36);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ADVICE_NORMAL = @as(c_int, 0);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ADVICE_SEQUENTIAL = @as(c_int, 1);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ADVICE_RANDOM = @as(c_int, 2);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ADVICE_WILL_NEED = @as(c_int, 3);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ADVICE_DONT_NEED = @as(c_int, 4);
pub const WASI_FILESYSTEM_0_2_0_TYPES_ADVICE_NO_REUSE = @as(c_int, 5);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_UNKNOWN = @as(c_int, 0);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_ACCESS_DENIED = @as(c_int, 1);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_NOT_SUPPORTED = @as(c_int, 2);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_INVALID_ARGUMENT = @as(c_int, 3);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_OUT_OF_MEMORY = @as(c_int, 4);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_TIMEOUT = @as(c_int, 5);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_CONCURRENCY_CONFLICT = @as(c_int, 6);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_NOT_IN_PROGRESS = @as(c_int, 7);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_WOULD_BLOCK = @as(c_int, 8);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_INVALID_STATE = @as(c_int, 9);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_NEW_SOCKET_LIMIT = @as(c_int, 10);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_ADDRESS_NOT_BINDABLE = @as(c_int, 11);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_ADDRESS_IN_USE = @as(c_int, 12);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_REMOTE_UNREACHABLE = @as(c_int, 13);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_CONNECTION_REFUSED = @as(c_int, 14);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_CONNECTION_RESET = @as(c_int, 15);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_CONNECTION_ABORTED = @as(c_int, 16);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_DATAGRAM_TOO_LARGE = @as(c_int, 17);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_NAME_UNRESOLVABLE = @as(c_int, 18);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_TEMPORARY_RESOLVER_FAILURE = @as(c_int, 19);
pub const WASI_SOCKETS_0_2_0_NETWORK_ERROR_CODE_PERMANENT_RESOLVER_FAILURE = @as(c_int, 20);
pub const WASI_SOCKETS_0_2_0_NETWORK_IP_ADDRESS_FAMILY_IPV4 = @as(c_int, 0);
pub const WASI_SOCKETS_0_2_0_NETWORK_IP_ADDRESS_FAMILY_IPV6 = @as(c_int, 1);
pub const WASI_SOCKETS_0_2_0_NETWORK_IP_ADDRESS_IPV4 = @as(c_int, 0);
pub const WASI_SOCKETS_0_2_0_NETWORK_IP_ADDRESS_IPV6 = @as(c_int, 1);
pub const WASI_SOCKETS_0_2_0_NETWORK_IP_SOCKET_ADDRESS_IPV4 = @as(c_int, 0);
pub const WASI_SOCKETS_0_2_0_NETWORK_IP_SOCKET_ADDRESS_IPV6 = @as(c_int, 1);
pub const WASI_SOCKETS_0_2_0_TCP_SHUTDOWN_TYPE_RECEIVE = @as(c_int, 0);
pub const WASI_SOCKETS_0_2_0_TCP_SHUTDOWN_TYPE_SEND = @as(c_int, 1);
pub const WASI_SOCKETS_0_2_0_TCP_SHUTDOWN_TYPE_BOTH = @as(c_int, 2);
pub const timeval = struct_timeval;
pub const timespec = struct_timespec;
pub const iovec = struct_iovec;
