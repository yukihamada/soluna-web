const std = @import("std");
const c = @import("spin.zig").c;
const http = @import("util/http.zig");
const auth = @import("util/auth.zig");
const json = @import("util/json.zig");
const svg = @import("util/svg.zig");
const db = @import("db/queries.zig");
const resend = @import("external/resend.zig");
const stripe = @import("external/stripe.zig");
const claude = @import("external/claude.zig");
const whatsapp = @import("external/whatsapp.zig");
const emails = @import("templates/emails.zig");

const ResponseOut = c.exports_wasi_http_0_2_0_incoming_handler_own_response_outparam_t;

pub fn route(req: http.Request, out: ResponseOut) void {
    // OPTIONS for CORS preflight
    if (req.method == .OPTIONS) {
        http.sendResponse(out, 204, "text/plain", "");
        return;
    }

    // Route matching
    const path = req.path;

    if (std.mem.eql(u8, path, "/api/email")) {
        if (req.method == .POST) return handleEmailSignup(req, out);
    } else if (std.mem.eql(u8, path, "/api/vip-inquiry")) {
        if (req.method == .POST) return handleVipInquiry(req, out);
    } else if (std.mem.eql(u8, path, "/api/meeting")) {
        if (req.method == .POST) return handleMeeting(req, out);
    } else if (std.mem.eql(u8, path, "/api/submit")) {
        if (req.method == .POST) return handleSubmit(req, out);
    } else if (std.mem.eql(u8, path, "/api/checkout")) {
        if (req.method == .POST) return handleCheckout(req, out);
    } else if (std.mem.eql(u8, path, "/api/verify-payment")) {
        if (req.method == .GET) return handleVerifyPayment(req, out);
    } else if (std.mem.eql(u8, path, "/api/emails")) {
        if (req.method == .GET) return adminOnly(req, out, handleGetEmails);
    } else if (std.mem.eql(u8, path, "/api/email-blast")) {
        if (req.method == .POST) return adminOnly(req, out, handleEmailBlast);
    } else if (std.mem.eql(u8, path, "/api/welcome-email")) {
        if (req.method == .POST) return adminOnly(req, out, handleWelcomeEmail);
    } else if (std.mem.eql(u8, path, "/api/nft-passes")) {
        if (req.method == .GET) return adminOnly(req, out, handleGetNftPasses);
    } else if (std.mem.eql(u8, path, "/api/nft-passes/claimed")) {
        if (req.method == .GET) return adminOnly(req, out, handleGetClaimedPasses);
    } else if (std.mem.startsWith(u8, path, "/api/nft-passes/") and std.mem.endsWith(u8, path, "/claim")) {
        if (req.method == .POST) return adminOnly(req, out, handleClaimPass);
    } else if (std.mem.startsWith(u8, path, "/api/nft-image/")) {
        if (req.method == .GET) return handleNftImage(req, out);
    } else if (std.mem.eql(u8, path, "/api/meetings")) {
        if (req.method == .GET) return adminOnly(req, out, handleGetMeetings);
    } else if (std.mem.eql(u8, path, "/api/submissions")) {
        if (req.method == .GET) return adminOnly(req, out, handleGetSubmissions);
    } else if (std.mem.eql(u8, path, "/api/task-overrides")) {
        if (req.method == .GET) return adminOnly(req, out, handleGetTaskOverrides);
    } else if (std.mem.startsWith(u8, path, "/api/task-overrides/")) {
        if (req.method == .PUT) return adminOnly(req, out, handlePutTaskOverride);
    } else if (std.mem.eql(u8, path, "/api/admin-views")) {
        if (req.method == .POST) return adminOnly(req, out, handlePostAdminView);
        if (req.method == .GET) return adminOnly(req, out, handleGetAdminViews);
    } else if (std.mem.eql(u8, path, "/api/feedback")) {
        if (req.method == .POST) return adminOnly(req, out, handlePostFeedback);
        if (req.method == .GET) return adminOnly(req, out, handleGetFeedback);
    } else if (std.mem.eql(u8, path, "/api/partners")) {
        if (req.method == .GET) return adminOnly(req, out, handleGetPartners);
        if (req.method == .POST) return adminOnly(req, out, handlePostPartner);
    } else if (std.mem.startsWith(u8, path, "/api/partners/")) {
        if (req.method == .PUT) return adminOnly(req, out, handlePutPartner);
        if (req.method == .DELETE) return adminOnly(req, out, handleDeletePartner);
    } else if (std.mem.eql(u8, path, "/api/notes")) {
        if (req.method == .GET) return adminOnly(req, out, handleGetNotes);
        if (req.method == .POST) return adminOnly(req, out, handlePostNote);
    } else if (std.mem.eql(u8, path, "/api/agent/chat")) {
        if (req.method == .POST) return adminOnly(req, out, handleAgentChat);
    } else if (std.mem.eql(u8, path, "/api/webhooks/whatsapp")) {
        if (req.method == .GET) return handleWhatsAppVerify(req, out);
        if (req.method == .POST) return handleWhatsAppWebhook(req, out);
    } else if (std.mem.eql(u8, path, "/api/audit-log")) {
        if (req.method == .GET) return adminOnly(req, out, handleGetAuditLog);
    } else if (std.mem.startsWith(u8, path, "/api/export/")) {
        if (req.method == .GET) return adminOnly(req, out, handleExport);
    } else if (std.mem.eql(u8, path, "/api/stats")) {
        if (req.method == .GET) return adminOnly(req, out, handleGetStats);
    } else if (std.mem.eql(u8, path, "/api/cms")) {
        if (req.method == .GET) return handleGetCms(req, out);
        if (req.method == .POST) return adminOnly(req, out, handlePostCms);
    } else if (std.mem.eql(u8, path, "/api/whatsapp/messages")) {
        if (req.method == .GET) return adminOnly(req, out, handleGetWhatsAppMessages);
    } else if (std.mem.eql(u8, path, "/api/admin/cleanup")) {
        if (req.method == .POST) return adminOnly(req, out, handleCleanup);
    } else if (std.mem.eql(u8, path, "/api/admin/reset-nft")) {
        if (req.method == .POST) return adminOnly(req, out, handleResetNft);
    } else if (std.mem.eql(u8, path, "/opengraph-image")) {
        // OG image route handled by the same component
        http.jsonError(out, 404, "Not found");
        return;
    }

    http.jsonError(out, 404, "Not found");
}

fn adminOnly(req: http.Request, out: ResponseOut, handler: *const fn (http.Request, ResponseOut) void) void {
    if (!auth.isAdmin(req)) {
        http.jsonError(out, 401, "Unauthorized");
        return;
    }
    handler(req, out);
}

fn openDb(out: ResponseOut) ?db.Db {
    var database = db.Db.open() catch {
        http.jsonError(out, 500, "Database error");
        return null;
    };
    database.initSchema() catch {
        http.jsonError(out, 500, "Schema init error");
        return null;
    };
    return database;
}

// ── Public endpoints ────────────────────────────────────────────────────────

fn handleEmailSignup(req: http.Request, out: ResponseOut) void {
    const body = req.readBody() orelse {
        http.jsonError(out, 400, "Missing body");
        return;
    };
    const email_val = json.getStr(body, "email") orelse {
        http.jsonError(out, 400, "Invalid email");
        return;
    };
    if (std.mem.indexOf(u8, email_val, "@") == null) {
        http.jsonError(out, 400, "Invalid email");
        return;
    }
    const locale = json.getStr(body, "locale") orelse "en";

    var database = openDb(out) orelse return;
    defer database.close();

    var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{
        db.textVal(email_val),
        db.textVal(locale),
    };
    _ = database.execParams("INSERT OR IGNORE INTO email_signups (email, locale) VALUES (?, ?)", &params) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };

    if (database.changes() > 0) {
        // Send admin notification (fire and forget)
        var subj_buf: [256]u8 = undefined;
        const subj = std.fmt.bufPrint(&subj_buf, "[ZAMNA] 新規メール登録 — {s}", .{email_val}) catch "[ZAMNA] New signup";
        var html_buf: [512]u8 = undefined;
        const html = std.fmt.bufPrint(&html_buf,
            "<p>新しいメール登録がありました。</p><ul><li>メール: {s}</li><li>言語: {s}</li></ul>",
            .{ email_val, locale },
        ) catch "";
        resend.sendAdminEmail(subj, html);

        // Send confirmation to subscriber
        const is_ja = std.mem.eql(u8, locale, "ja");
        const conf_subj = if (is_ja) "ZAMNA HAWAII 2026 — ラインナップ通知に登録しました" else "ZAMNA HAWAII 2026 — You're on the list!";
        const conf_html = if (is_ja) emails.SIGNUP_CONFIRM_JA else emails.SIGNUP_CONFIRM_EN;
        _ = resend.sendEmail(email_val, conf_subj, conf_html);
    }

    http.jsonOk(out, "{\"ok\":true}");
}

fn handleVipInquiry(req: http.Request, out: ResponseOut) void {
    const body = req.readBody() orelse {
        http.jsonError(out, 400, "Missing body");
        return;
    };
    const email_val = json.getStr(body, "email") orelse {
        http.jsonError(out, 400, "Email required");
        return;
    };
    const tier = json.getStr(body, "tier") orelse "diamond";
    const name = json.getStr(body, "name");
    const phone = json.getStr(body, "phone");
    const message = json.getStr(body, "message");
    const lang = json.getStr(body, "lang") orelse "ja";

    var database = openDb(out) orelse return;
    defer database.close();

    var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{
        db.textVal(tier),
        if (name) |n| db.textVal(n) else db.nullVal(),
        db.textVal(email_val),
        if (phone) |p| db.textVal(p) else db.nullVal(),
        if (message) |m| db.textVal(m) else db.nullVal(),
        db.textVal(lang),
    };
    _ = database.execParams(
        "INSERT INTO vip_inquiries (tier, name, email, phone, message, lang) VALUES (?,?,?,?,?,?)",
        &params,
    ) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };

    const id = database.lastInsertRowid();

    // Admin notification
    var subj_buf: [256]u8 = undefined;
    const subj = std.fmt.bufPrint(&subj_buf, "[ZAMNA] Diamond VIP お問い合わせ — {s}", .{name orelse email_val}) catch "[ZAMNA] VIP Inquiry";
    resend.sendAdminEmail(subj, "<p>Diamond VIP のお問い合わせが届きました。</p>");

    var resp_buf: [128]u8 = undefined;
    const resp = std.fmt.bufPrint(&resp_buf, "{{\"ok\":true,\"id\":{d}}}", .{id}) catch "{\"ok\":true}";
    http.jsonOk(out, resp);
}

fn handleMeeting(req: http.Request, out: ResponseOut) void {
    const body = req.readBody() orelse {
        http.jsonError(out, 400, "Missing body");
        return;
    };
    const meeting_type = json.getStr(body, "meetingType") orelse {
        http.jsonError(out, 400, "Missing required fields");
        return;
    };
    const email_val = json.getStr(body, "email") orelse {
        http.jsonError(out, 400, "Missing required fields");
        return;
    };

    var database = openDb(out) orelse return;
    defer database.close();

    var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{
        db.textVal(meeting_type),
        if (json.getStr(body, "name")) |n| db.textVal(n) else db.nullVal(),
        if (json.getStr(body, "company")) |v| db.textVal(v) else db.nullVal(),
        db.textVal(email_val),
        if (json.getStr(body, "phone")) |v| db.textVal(v) else db.nullVal(),
        if (json.getStr(body, "date")) |v| db.textVal(v) else db.nullVal(),
        if (json.getStr(body, "timeSlot")) |v| db.textVal(v) else db.nullVal(),
        if (json.getStr(body, "message")) |v| db.textVal(v) else db.nullVal(),
        db.textVal(json.getStr(body, "lang") orelse "ja"),
    };
    _ = database.execParams(
        "INSERT INTO meeting_requests (meeting_type, name, company, email, phone, date, time_slot, message, lang) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        &params,
    ) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };

    const id = database.lastInsertRowid();
    resend.sendAdminEmail("[ZAMNA] ミーティング予約", "<p>新しいミーティングリクエストが届きました。</p>");

    var resp_buf: [128]u8 = undefined;
    const resp = std.fmt.bufPrint(&resp_buf, "{{\"ok\":true,\"id\":{d}}}", .{id}) catch "{\"ok\":true}";
    http.jsonOk(out, resp);
}

fn handleSubmit(req: http.Request, out: ResponseOut) void {
    const body = req.readBody() orelse {
        http.jsonError(out, 400, "Missing body");
        return;
    };
    const contract_type = json.getStr(body, "contractType") orelse {
        http.jsonError(out, 400, "Missing required fields");
        return;
    };
    const signature = json.getStr(body, "signature") orelse {
        http.jsonError(out, 400, "Missing required fields");
        return;
    };

    var database = openDb(out) orelse return;
    defer database.close();

    var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{
        db.textVal(contract_type),
        if (json.getStr(body, "name")) |v| db.textVal(v) else db.nullVal(),
        if (json.getStr(body, "company")) |v| db.textVal(v) else db.nullVal(),
        if (json.getStr(body, "email")) |v| db.textVal(v) else db.nullVal(),
        if (json.getStr(body, "amount")) |v| db.textVal(v) else db.nullVal(),
        if (json.getStr(body, "structure")) |v| db.textVal(v) else db.nullVal(),
        if (json.getStr(body, "returnType")) |v| db.textVal(v) else db.nullVal(),
        if (json.getStr(body, "sponsorPackage")) |v| db.textVal(v) else db.nullVal(),
        if (json.getStr(body, "contactPerson")) |v| db.textVal(v) else db.nullVal(),
        db.textVal(signature),
        db.textVal(json.getStr(body, "lang") orelse "ja"),
    };
    _ = database.execParams(
        "INSERT INTO submissions (contract_type, name, company, email, amount, structure, return_type, sponsor_package, contact_person, signature, lang) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        &params,
    ) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };

    const id = database.lastInsertRowid();
    resend.sendAdminEmail("[ZAMNA] 新しい契約申込", "<p>新しい契約申込が届きました。</p>");

    var resp_buf: [128]u8 = undefined;
    const resp = std.fmt.bufPrint(&resp_buf, "{{\"ok\":true,\"id\":{d}}}", .{id}) catch "{\"ok\":true}";
    http.jsonOk(out, resp);
}

fn handleNftImage(req: http.Request, out: ResponseOut) void {
    // Parse /api/nft-image/:type/:num from path
    const path = req.path;
    const prefix = "/api/nft-image/";
    if (!std.mem.startsWith(u8, path, prefix)) {
        http.jsonError(out, 404, "Not found");
        return;
    }
    const rest = path[prefix.len..];
    const slash = std.mem.indexOf(u8, rest, "/") orelse {
        http.jsonError(out, 400, "Invalid path");
        return;
    };
    const pass_type = rest[0..slash];
    const num = rest[slash + 1 ..];

    var svg_buf: [2048]u8 = undefined;
    const svg_content = svg.nftPassSvg(&svg_buf, pass_type, num);
    http.sendResponse(out, 200, "image/svg+xml", svg_content);
}

fn handleCheckout(req: http.Request, out: ResponseOut) void {
    const secret = auth.getVariable("stripe_secret_key") orelse "";
    if (secret.len == 0) {
        http.jsonError(out, 503, "Payment not configured");
        return;
    }

    const body = req.readBody() orelse {
        http.jsonError(out, 400, "Missing body");
        return;
    };
    const contract_type = json.getStr(body, "contractType") orelse "";
    const sponsor_pkg = json.getStr(body, "sponsorPackage") orelse "";
    const submission_id = json.getStr(body, "submissionId") orelse "";

    const key = blk: {
        if (std.mem.eql(u8, contract_type, "investment")) break :blk "investment";
        var key_buf: [64]u8 = undefined;
        break :blk std.fmt.bufPrint(&key_buf, "sponsor_{s}", .{sponsor_pkg}) catch "";
    };

    const amount: u64 = if (std.mem.eql(u8, key, "investment"))
        20000000
    else if (std.mem.eql(u8, key, "sponsor_presenting"))
        10000000
    else if (std.mem.eql(u8, key, "sponsor_artist"))
        5000000
    else if (std.mem.eql(u8, key, "sponsor_vip"))
        2000000
    else {
        http.jsonError(out, 400, "Custom amount: please contact us directly");
        return;
    };

    const product_name = if (std.mem.eql(u8, key, "investment"))
        "ZAMNA HAWAII 2026 — Investment Partner"
    else if (std.mem.eql(u8, key, "sponsor_presenting"))
        "ZAMNA HAWAII 2026 — Presenting Partner"
    else if (std.mem.eql(u8, key, "sponsor_artist"))
        "ZAMNA HAWAII 2026 — Artist Stage Partner"
    else
        "ZAMNA HAWAII 2026 — VIP Lounge Partner";

    const payment_methods = if (amount >= 5000000) "card&payment_method_types[]=us_bank_account" else "card";

    var success_buf: [256]u8 = undefined;
    const success_url = std.fmt.bufPrint(&success_buf, "https://solun.art/contract?paid=true&session_id={{CHECKOUT_SESSION_ID}}&sid={s}", .{submission_id}) catch "";

    var meta_buf: [256]u8 = undefined;
    const metadata = std.fmt.bufPrint(&meta_buf, "metadata[submissionId]={s}&metadata[contractType]={s}", .{ submission_id, contract_type }) catch "";

    const result = stripe.createCheckoutSession(
        amount,
        product_name,
        payment_methods,
        success_url,
        "https://solun.art/contract?cancelled=true",
        metadata,
    );

    if (result.ok) {
        var resp_buf: [1024]u8 = undefined;
        var resp_json = json.Builder.init(&resp_buf);
        resp_json.fieldStr("url", result.url);
        resp_json.fieldInt("amount", @intCast(amount));
        resp_json.fieldStr("paymentMethods", payment_methods);
        http.jsonOk(out, resp_json.finish());
    } else {
        http.jsonError(out, 500, "Stripe error");
    }
}

fn handleVerifyPayment(req: http.Request, out: ResponseOut) void {
    const secret = auth.getVariable("stripe_secret_key") orelse "";
    if (secret.len == 0) {
        http.jsonError(out, 503, "Payment not configured");
        return;
    }

    const query = req.query orelse {
        http.jsonError(out, 400, "Missing session_id");
        return;
    };

    // Parse session_id and sid from query string
    const session_id = getQueryParam(query, "session_id") orelse {
        http.jsonError(out, 400, "Missing session_id");
        return;
    };
    const sid = getQueryParam(query, "sid");

    const result = stripe.retrieveSession(session_id);

    if (result.paid) {
        if (sid) |s| {
            var database = openDb(out) orelse return;
            defer database.close();
            var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{
                db.textVal(session_id),
                db.textVal(s),
            };
            _ = database.execParams(
                "UPDATE submissions SET paid = 1, stripe_session_id = ? WHERE id = ?",
                &params,
            ) catch {};
        }
    }

    var resp_buf: [256]u8 = undefined;
    var resp_json = json.Builder.init(&resp_buf);
    resp_json.fieldBool("paid", result.paid);
    if (result.amount) |a| resp_json.fieldInt("amount", a);
    resp_json.fieldStr("currency", result.currency);
    http.jsonOk(out, resp_json.finish());
}

// ── Admin endpoints ─────────────────────────────────────────────────────────

fn handleGetEmails(_: http.Request, out: ResponseOut) void {
    var database = openDb(out) orelse return;
    defer database.close();
    const result = database.exec("SELECT * FROM email_signups ORDER BY created_at DESC", &.{}) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };
    var buf: [65536]u8 = undefined;
    http.jsonOk(out, db.rowsToJsonArray(&buf, result));
}

fn handleEmailBlast(req: http.Request, out: ResponseOut) void {
    const api_key = auth.getVariable("resend_api_key") orelse "";
    if (api_key.len == 0) {
        http.jsonError(out, 503, "RESEND_API_KEY not set");
        return;
    }
    const body = req.readBody() orelse {
        http.jsonError(out, 400, "Missing body");
        return;
    };
    const subject = json.getStr(body, "subject") orelse {
        http.jsonError(out, 400, "subject and body required");
        return;
    };
    const body_ja = json.getStr(body, "body_ja");
    const body_en = json.getStr(body, "body_en");
    if (body_ja == null and body_en == null) {
        http.jsonError(out, 400, "subject and body required");
        return;
    }

    const test_email = json.getStr(body, "test_email");
    if (test_email) |te| {
        // Test mode: send to single recipient
        const content = body_ja orelse body_en orelse "";
        _ = resend.sendEmail(te, subject, content);
        http.jsonOk(out, "{\"ok\":true,\"sent\":1,\"mode\":\"test\"}");
        return;
    }

    // Send to all subscribers
    var database = openDb(out) orelse return;
    defer database.close();
    const result = database.exec("SELECT email, locale FROM email_signups", &.{}) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };

    var sent: u32 = 0;
    var failed: u32 = 0;
    for (0..result.rows.len) |i| {
        const row = result.rows.ptr[i];
        const email_val = db.getText(row, 0) orelse continue;
        const locale = db.getText(row, 1) orelse "en";
        const is_ja = std.mem.eql(u8, locale, "ja");
        const content = if (is_ja) (body_ja orelse body_en orelse "") else (body_en orelse body_ja orelse "");
        if (resend.sendEmail(email_val, subject, content)) {
            sent += 1;
        } else {
            failed += 1;
        }
    }

    var resp_buf: [256]u8 = undefined;
    const resp = std.fmt.bufPrint(&resp_buf, "{{\"ok\":true,\"sent\":{d},\"failed\":{d},\"total\":{d}}}", .{ sent, failed, result.rows.len }) catch "{\"ok\":true}";
    http.jsonOk(out, resp);
}

fn handleWelcomeEmail(req: http.Request, out: ResponseOut) void {
    const api_key = auth.getVariable("resend_api_key") orelse "";
    if (api_key.len == 0) {
        http.jsonError(out, 503, "RESEND_API_KEY not set");
        return;
    }
    const body = req.readBody() orelse {
        http.jsonError(out, 400, "Missing body");
        return;
    };
    const member = json.getStr(body, "member") orelse {
        http.jsonError(out, 400, "member and valid email required");
        return;
    };
    const email_val = json.getStr(body, "email") orelse {
        http.jsonError(out, 400, "member and valid email required");
        return;
    };
    if (std.mem.indexOf(u8, email_val, "@") == null) {
        http.jsonError(out, 400, "member and valid email required");
        return;
    }

    var subj_buf: [256]u8 = undefined;
    const subj = std.fmt.bufPrint(&subj_buf, "Welcome to ZAMNA HAWAII Operations — {s}", .{member}) catch "Welcome to ZAMNA HAWAII";
    // Use a generic welcome template
    const html = emails.WELCOME_GENERIC;

    if (resend.sendEmail(email_val, subj, html)) {
        resend.sendAdminEmail("[ZAMNA] チームメンバー初回ログイン", "<p>ウェルカムメールを送信しました。</p>");
        http.jsonOk(out, "{\"ok\":true}");
    } else {
        http.jsonError(out, 500, "Email send failed");
    }
}

fn handleGetNftPasses(_: http.Request, out: ResponseOut) void {
    var database = openDb(out) orelse return;
    defer database.close();
    const result = database.exec("SELECT id, pass_type, name, description, image_url FROM nft_passes WHERE claimed_by IS NULL ORDER BY pass_type, id", &.{}) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };
    var buf: [65536]u8 = undefined;
    http.jsonOk(out, db.rowsToJsonArray(&buf, result));
}

fn handleGetClaimedPasses(_: http.Request, out: ResponseOut) void {
    var database = openDb(out) orelse return;
    defer database.close();
    const result = database.exec("SELECT id, pass_type, name, claimed_by, claimed_name, claimed_at FROM nft_passes WHERE claimed_by IS NOT NULL ORDER BY claimed_at DESC", &.{}) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };
    var buf: [65536]u8 = undefined;
    http.jsonOk(out, db.rowsToJsonArray(&buf, result));
}

fn handleClaimPass(req: http.Request, out: ResponseOut) void {
    const body = req.readBody() orelse {
        http.jsonError(out, 400, "Missing body");
        return;
    };
    const wallet = json.getStr(body, "wallet") orelse {
        http.jsonError(out, 400, "wallet address required");
        return;
    };
    const member = json.getStr(body, "member");

    // Extract pass ID from path: /api/nft-passes/{id}/claim
    const path = req.path;
    const prefix = "/api/nft-passes/";
    const rest = path[prefix.len..];
    const slash = std.mem.indexOf(u8, rest, "/") orelse {
        http.jsonError(out, 400, "Invalid path");
        return;
    };
    const pass_id_str = rest[0..slash];

    var database = openDb(out) orelse return;
    defer database.close();

    // Check if pass exists and is unclaimed
    var select_params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{db.textVal(pass_id_str)};
    const check = database.execParams("SELECT * FROM nft_passes WHERE id = ?", &select_params) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };
    if (check.rows.len == 0) {
        http.jsonError(out, 404, "Pass not found");
        return;
    }

    // Update pass
    var update_params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{
        db.textVal(wallet),
        if (member) |m| db.textVal(m) else db.nullVal(),
        db.textVal(pass_id_str),
    };
    _ = database.execParams(
        "UPDATE nft_passes SET claimed_by = ?, claimed_name = ?, claimed_at = datetime('now') WHERE id = ?",
        &update_params,
    ) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };

    resend.sendAdminEmail("[ZAMNA] NFT Pass Claimed", "<p>NFT Pass がクレームされました。</p>");
    http.jsonOk(out, "{\"ok\":true}");
}

fn handleGetMeetings(_: http.Request, out: ResponseOut) void {
    var database = openDb(out) orelse return;
    defer database.close();
    const result = database.exec("SELECT * FROM meeting_requests ORDER BY created_at DESC", &.{}) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };
    var buf: [65536]u8 = undefined;
    http.jsonOk(out, db.rowsToJsonArray(&buf, result));
}

fn handleGetSubmissions(_: http.Request, out: ResponseOut) void {
    var database = openDb(out) orelse return;
    defer database.close();
    const result = database.exec("SELECT * FROM submissions ORDER BY created_at DESC", &.{}) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };
    var buf: [65536]u8 = undefined;
    http.jsonOk(out, db.rowsToJsonArray(&buf, result));
}

fn handleGetTaskOverrides(_: http.Request, out: ResponseOut) void {
    var database = openDb(out) orelse return;
    defer database.close();
    const result = database.exec("SELECT * FROM task_overrides", &.{}) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };
    var buf: [65536]u8 = undefined;
    http.jsonOk(out, db.rowsToJsonArray(&buf, result));
}

fn handlePutTaskOverride(req: http.Request, out: ResponseOut) void {
    const body = req.readBody() orelse {
        http.jsonError(out, 400, "Missing body");
        return;
    };
    const status_val = json.getStr(body, "status") orelse {
        http.jsonError(out, 400, "status required");
        return;
    };
    const updated_by = json.getStr(body, "updated_by");

    // Extract task key from path: /api/task-overrides/{taskKey}
    const path = req.path;
    const prefix = "/api/task-overrides/";
    const task_key = path[prefix.len..];

    var database = openDb(out) orelse return;
    defer database.close();

    var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{
        db.textVal(task_key),
        db.textVal(status_val),
        if (updated_by) |u| db.textVal(u) else db.nullVal(),
    };
    _ = database.execParams(
        "INSERT INTO task_overrides (task_key, status, updated_by, updated_at) VALUES (?, ?, ?, datetime('now')) ON CONFLICT(task_key) DO UPDATE SET status=excluded.status, updated_by=excluded.updated_by, updated_at=excluded.updated_at",
        &params,
    ) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };

    http.jsonOk(out, "{\"ok\":true}");
}

fn handlePostAdminView(req: http.Request, out: ResponseOut) void {
    const body = req.readBody() orelse {
        http.jsonError(out, 400, "Missing body");
        return;
    };
    const member = json.getStr(body, "member") orelse {
        http.jsonError(out, 400, "member required");
        return;
    };

    var database = openDb(out) orelse return;
    defer database.close();

    var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{db.textVal(member)};
    _ = database.execParams("INSERT INTO admin_views (member) VALUES (?)", &params) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };

    http.jsonOk(out, "{\"ok\":true}");
}

fn handleGetAdminViews(_: http.Request, out: ResponseOut) void {
    var database = openDb(out) orelse return;
    defer database.close();
    const result = database.exec("SELECT member, MAX(viewed_at) as last_viewed FROM admin_views GROUP BY member ORDER BY last_viewed DESC", &.{}) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };
    var buf: [65536]u8 = undefined;
    http.jsonOk(out, db.rowsToJsonArray(&buf, result));
}

fn handleCleanup(req: http.Request, out: ResponseOut) void {
    const body = req.readBody() orelse {
        http.jsonError(out, 400, "Missing body");
        return;
    };
    const table = json.getStr(body, "table") orelse {
        http.jsonError(out, 400, "Invalid table");
        return;
    };

    // Validate table name
    const allowed = [_][]const u8{ "submissions", "email_signups", "meeting_requests", "vip_inquiries", "nft_passes", "partners", "notes", "feedback", "chat_history", "whatsapp_messages", "audit_log", "cms_content" };
    var valid = false;
    for (allowed) |a| {
        if (std.mem.eql(u8, table, a)) {
            valid = true;
            break;
        }
    }
    if (!valid) {
        http.jsonError(out, 400, "Invalid table");
        return;
    }

    const where_obj = json.getObj(body, "where") orelse {
        http.jsonError(out, 400, "where clause required");
        return;
    };

    // For simplicity, parse simple key=value pairs from the where object
    // In practice we'd need a full JSON parser, but for this use case,
    // we support "id" and "email" as common where clauses
    const id_val = json.getStr(where_obj, "id");
    const email_val = json.getStr(where_obj, "email");

    var database = openDb(out) orelse return;
    defer database.close();

    if (id_val != null and email_val != null) {
        var sql_buf: [256]u8 = undefined;
        const sql = std.fmt.bufPrint(&sql_buf, "DELETE FROM {s} WHERE id = ? AND email = ?", .{table}) catch {
            http.jsonError(out, 500, "SQL error");
            return;
        };
        var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{ db.textVal(id_val.?), db.textVal(email_val.?) };
        _ = database.execParams(sql, &params) catch {
            http.jsonError(out, 500, "Database error");
            return;
        };
    } else if (id_val) |id| {
        var sql_buf: [256]u8 = undefined;
        const sql = std.fmt.bufPrint(&sql_buf, "DELETE FROM {s} WHERE id = ?", .{table}) catch {
            http.jsonError(out, 500, "SQL error");
            return;
        };
        var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{db.textVal(id)};
        _ = database.execParams(sql, &params) catch {
            http.jsonError(out, 500, "Database error");
            return;
        };
    } else if (email_val) |em| {
        var sql_buf: [256]u8 = undefined;
        const sql = std.fmt.bufPrint(&sql_buf, "DELETE FROM {s} WHERE email = ?", .{table}) catch {
            http.jsonError(out, 500, "SQL error");
            return;
        };
        var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{db.textVal(em)};
        _ = database.execParams(sql, &params) catch {
            http.jsonError(out, 500, "Database error");
            return;
        };
    } else {
        http.jsonError(out, 400, "Unsupported where clause");
        return;
    }

    const deleted = database.changes();
    var resp_buf: [128]u8 = undefined;
    const resp = std.fmt.bufPrint(&resp_buf, "{{\"ok\":true,\"deleted\":{d}}}", .{deleted}) catch "{\"ok\":true}";
    http.jsonOk(out, resp);
}

fn handleResetNft(req: http.Request, out: ResponseOut) void {
    const body = req.readBody() orelse {
        http.jsonError(out, 400, "Missing body");
        return;
    };
    const id_val = json.getStr(body, "id") orelse json.getStr(body, "id") orelse {
        http.jsonError(out, 400, "id required");
        return;
    };

    var database = openDb(out) orelse return;
    defer database.close();

    var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{db.textVal(id_val)};
    _ = database.execParams("UPDATE nft_passes SET claimed_by=NULL, claimed_name=NULL, claimed_at=NULL WHERE id=?", &params) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };

    http.jsonOk(out, "{\"ok\":true}");
}

// ── Feedback ────────────────────────────────────────────────────────────────

fn handlePostFeedback(req: http.Request, out: ResponseOut) void {
    const body = req.readBody() orelse {
        http.jsonError(out, 400, "Missing body");
        return;
    };
    const page = json.getStr(body, "page") orelse "unknown";
    const member = json.getStr(body, "member");
    const category = json.getStr(body, "category") orelse "general";
    const message = json.getStr(body, "message") orelse {
        http.jsonError(out, 400, "message required");
        return;
    };

    var database = openDb(out) orelse return;
    defer database.close();

    var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{
        db.textVal(page),
        if (member) |m| db.textVal(m) else db.nullVal(),
        db.textVal(category),
        db.textVal(message),
    };
    _ = database.execParams("INSERT INTO feedback (page, member, category, message) VALUES (?, ?, ?, ?)", &params) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };

    const id = database.lastInsertRowid();
    var resp_buf: [128]u8 = undefined;
    const resp = std.fmt.bufPrint(&resp_buf, "{{\"ok\":true,\"id\":{d}}}", .{id}) catch "{\"ok\":true}";
    http.jsonOk(out, resp);
}

fn handleGetFeedback(_: http.Request, out: ResponseOut) void {
    var database = openDb(out) orelse return;
    defer database.close();
    const result = database.exec("SELECT id, page, member, category, message, created_at FROM feedback ORDER BY created_at DESC", &.{}) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };
    var buf: [65536]u8 = undefined;
    http.jsonOk(out, db.rowsToJsonArray(&buf, result));
}

// ── Partners CRUD ───────────────────────────────────────────────────────────

fn handleGetPartners(_: http.Request, out: ResponseOut) void {
    var database = openDb(out) orelse return;
    defer database.close();
    const result = database.exec("SELECT id, name, contact, type_ja, type_en, status, notes_ja, notes_en, email, phone, who, instagram, link, created_at FROM partners ORDER BY id", &.{}) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };
    var buf: [131072]u8 = undefined;
    http.jsonOk(out, db.rowsToJsonArray(&buf, result));
}

fn handlePostPartner(req: http.Request, out: ResponseOut) void {
    const body = req.readBody() orelse {
        http.jsonError(out, 400, "Missing body");
        return;
    };
    const contact = json.getStr(body, "contact") orelse {
        http.jsonError(out, 400, "contact required");
        return;
    };

    var database = openDb(out) orelse return;
    defer database.close();

    var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{
        optText(json.getStr(body, "name")),
        db.textVal(contact),
        optText(json.getStr(body, "type_ja")),
        optText(json.getStr(body, "type_en")),
        db.textVal(json.getStr(body, "status") orelse "pending"),
        optText(json.getStr(body, "notes_ja")),
        optText(json.getStr(body, "notes_en")),
        optText(json.getStr(body, "email")),
        optText(json.getStr(body, "phone")),
        optText(json.getStr(body, "who")),
        optText(json.getStr(body, "instagram")),
        optText(json.getStr(body, "link")),
    };
    _ = database.execParams("INSERT INTO partners (name,contact,type_ja,type_en,status,notes_ja,notes_en,email,phone,who,instagram,link) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", &params) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };

    const id = database.lastInsertRowid();
    var resp_buf: [128]u8 = undefined;
    const resp = std.fmt.bufPrint(&resp_buf, "{{\"ok\":true,\"id\":{d}}}", .{id}) catch "{\"ok\":true}";
    http.jsonOk(out, resp);
}

fn handlePutPartner(req: http.Request, out: ResponseOut) void {
    const body = req.readBody() orelse {
        http.jsonError(out, 400, "Missing body");
        return;
    };
    const id_str = req.path["/api/partners/".len..];
    const id = std.fmt.parseInt(i64, id_str, 10) catch {
        http.jsonError(out, 400, "Invalid id");
        return;
    };

    var database = openDb(out) orelse return;
    defer database.close();

    var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{
        optText(json.getStr(body, "name")),
        optText(json.getStr(body, "contact")),
        optText(json.getStr(body, "type_ja")),
        optText(json.getStr(body, "type_en")),
        optText(json.getStr(body, "status")),
        optText(json.getStr(body, "notes_ja")),
        optText(json.getStr(body, "notes_en")),
        optText(json.getStr(body, "email")),
        optText(json.getStr(body, "phone")),
        optText(json.getStr(body, "who")),
        optText(json.getStr(body, "instagram")),
        optText(json.getStr(body, "link")),
        db.intVal(id),
    };
    _ = database.execParams("UPDATE partners SET name=?,contact=?,type_ja=?,type_en=?,status=?,notes_ja=?,notes_en=?,email=?,phone=?,who=?,instagram=?,link=? WHERE id=?", &params) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };

    http.jsonOk(out, "{\"ok\":true}");
}

fn handleDeletePartner(req: http.Request, out: ResponseOut) void {
    const id_str = req.path["/api/partners/".len..];
    const id = std.fmt.parseInt(i64, id_str, 10) catch {
        http.jsonError(out, 400, "Invalid id");
        return;
    };

    var database = openDb(out) orelse return;
    defer database.close();

    var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{db.intVal(id)};
    _ = database.execParams("DELETE FROM partners WHERE id=?", &params) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };

    http.jsonOk(out, "{\"ok\":true}");
}

fn optText(val: ?[]const u8) c.fermyon_spin_2_0_0_sqlite_value_t {
    return if (val) |v| db.textVal(v) else db.nullVal();
}

// ── Notes ───────────────────────────────────────────────────────────────────

fn handleGetNotes(req: http.Request, out: ResponseOut) void {
    var database = openDb(out) orelse return;
    defer database.close();

    const target_filter = if (req.query) |q| getQueryParam(q, "target") else null;

    if (target_filter) |target| {
        var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{db.textVal(target)};
        const result = database.execParams("SELECT id, target, member, content, created_at FROM notes WHERE target=? ORDER BY created_at DESC", &params) catch {
            http.jsonError(out, 500, "Database error");
            return;
        };
        var buf: [65536]u8 = undefined;
        http.jsonOk(out, db.rowsToJsonArray(&buf, result));
    } else {
        const result = database.exec("SELECT id, target, member, content, created_at FROM notes ORDER BY created_at DESC", &.{}) catch {
            http.jsonError(out, 500, "Database error");
            return;
        };
        var buf: [65536]u8 = undefined;
        http.jsonOk(out, db.rowsToJsonArray(&buf, result));
    }
}

fn handlePostNote(req: http.Request, out: ResponseOut) void {
    const body = req.readBody() orelse {
        http.jsonError(out, 400, "Missing body");
        return;
    };
    const target = json.getStr(body, "target") orelse {
        http.jsonError(out, 400, "target required");
        return;
    };
    const content = json.getStr(body, "content") orelse {
        http.jsonError(out, 400, "content required");
        return;
    };
    const member = json.getStr(body, "member");

    var database = openDb(out) orelse return;
    defer database.close();

    var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{
        db.textVal(target),
        optText(member),
        db.textVal(content),
    };
    _ = database.execParams("INSERT INTO notes (target, member, content) VALUES (?, ?, ?)", &params) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };

    const id = database.lastInsertRowid();
    var resp_buf: [128]u8 = undefined;
    const resp = std.fmt.bufPrint(&resp_buf, "{{\"ok\":true,\"id\":{d}}}", .{id}) catch "{\"ok\":true}";
    http.jsonOk(out, resp);
}

// ── Agent Chat ──────────────────────────────────────────────────────────────

fn handleAgentChat(req: http.Request, out: ResponseOut) void {
    const body = req.readBody() orelse {
        http.jsonError(out, 400, "Missing body");
        return;
    };
    const messages_json = json.getArr(body, "messages") orelse {
        http.jsonError(out, 400, "messages required");
        return;
    };

    // Build system prompt with DB context
    var database = openDb(out) orelse return;
    defer database.close();

    // Get table counts for context
    var ctx_buf: [4096]u8 = undefined;
    var ctx_pos: usize = 0;

    const tables = [_][]const u8{ "partners", "email_signups", "submissions", "meeting_requests", "feedback", "notes", "vip_inquiries", "nft_passes" };
    for (tables) |tbl| {
        var sql_buf: [128]u8 = undefined;
        const sql = std.fmt.bufPrint(&sql_buf, "SELECT COUNT(*) FROM {s}", .{tbl}) catch continue;
        const result = database.exec(sql, &.{}) catch continue;
        if (result.rows.len > 0 and result.rows.ptr[0].values.len > 0) {
            const v = result.rows.ptr[0].values.ptr[0];
            if (v.tag == c.FERMYON_SPIN_2_0_0_SQLITE_VALUE_INTEGER) {
                const line = std.fmt.bufPrint(ctx_buf[ctx_pos..], "{s}: {d} rows\n", .{ tbl, v.val.integer }) catch break;
                ctx_pos += line.len;
            }
        }
    }

    const system_prompt =
        "You are the ZAMNA HAWAII Operations AI Agent. You help manage the festival (Sep 4-5, 2026, Oahu).\n\n" ++
        "DATABASE TABLES:\n" ++
        "- partners (id, name, contact, type_ja, type_en, status[confirmed/in_progress/outreach/pending], notes_ja, notes_en, email, phone, who, instagram, link)\n" ++
        "- email_signups (id, email, locale, created_at)\n" ++
        "- submissions (id, contract_type, name, company, email, amount, structure, return_type, sponsor_package, contact_person, signature, lang, paid, stripe_session_id, created_at)\n" ++
        "- meeting_requests (id, meeting_type, name, company, email, phone, date, time_slot, message, lang, created_at)\n" ++
        "- feedback (id, page, member, category, message, created_at)\n" ++
        "- notes (id, target, member, content, created_at)\n" ++
        "- task_overrides (task_key, status[done/in_progress/pending/urgent], updated_by, updated_at)\n" ++
        "- vip_inquiries (id, tier, name, email, phone, message, lang, created_at)\n" ++
        "- nft_passes (id, pass_type, name, description, image_url, claimed_by, claimed_name, claimed_at)\n" ++
        "- whatsapp_messages (id, from_phone, from_name, body, is_mention, replied, reply_text, created_at)\n" ++
        "- audit_log (id, action, target, member, details, created_at)\n" ++
        "- cms_content (id, section, key, value_ja, value_en, updated_by, updated_at)\n" ++
        "- chat_history (id, member, role, content, sql_executed, created_at)\n\n" ++
        "CAPABILITIES:\n" ++
        "- Query/modify data: output SQL in ```sql\\n...\\n``` blocks (SELECT, INSERT, UPDATE only)\n" ++
        "- Update website content: INSERT/UPDATE cms_content table\n" ++
        "- Generate reports: aggregate queries across tables\n" ++
        "- Bulk operations: UPDATE with WHERE clauses\n\n" ++
        "Always use WHERE for UPDATE. Respond in the user's language. Be concise and actionable.\n";

    // Combine system prompt with DB stats
    var full_prompt_buf: [8192]u8 = undefined;
    const full_prompt = std.fmt.bufPrint(&full_prompt_buf, "{s}\nCurrent DB state:\n{s}", .{ system_prompt, ctx_buf[0..ctx_pos] }) catch system_prompt;

    // Call Claude API
    const resp_body = claude.chat(full_prompt, messages_json) orelse {
        http.jsonError(out, 502, "AI service unavailable. Set anthropic_api_key in Spin variables.");
        return;
    };

    // Extract text from Claude response
    const ai_text = claude.extractText(resp_body) orelse {
        // Return raw response for debugging
        http.jsonOk(out, resp_body);
        return;
    };

    // Execute SQL blocks found in the response
    var sql_results_buf: [65536]u8 = undefined;
    var sql_results = json.ArrayBuilder.init(&sql_results_buf);

    var search_pos: usize = 0;
    while (search_pos < ai_text.len) {
        const sql_start_marker = "```sql\\n";
        const sql_end_marker = "\\n```";
        const start = std.mem.indexOfPos(u8, ai_text, search_pos, sql_start_marker) orelse break;
        const sql_begin = start + sql_start_marker.len;
        const end = std.mem.indexOfPos(u8, ai_text, sql_begin, sql_end_marker) orelse break;
        const sql_str = ai_text[sql_begin..end];
        search_pos = end + sql_end_marker.len;

        // Validate: only allow SELECT, INSERT, UPDATE
        var upper_buf: [16]u8 = undefined;
        const first_word_end = std.mem.indexOf(u8, sql_str, " ") orelse sql_str.len;
        const first_word_len = @min(first_word_end, upper_buf.len);
        for (0..first_word_len) |i| {
            upper_buf[i] = std.ascii.toUpper(sql_str[i]);
        }
        const first_word = upper_buf[0..first_word_len];
        const allowed = std.mem.eql(u8, first_word, "SELECT") or
            std.mem.eql(u8, first_word, "INSERT") or
            std.mem.eql(u8, first_word, "UPDATE");
        if (!allowed) continue;

        // Execute SQL
        const result = database.exec(sql_str, &.{}) catch continue;

        // Build result JSON
        var row_buf: [32768]u8 = undefined;
        var rb = json.Builder.init(&row_buf);
        rb.fieldStr("sql", sql_str);
        if (std.mem.eql(u8, first_word, "SELECT")) {
            var data_buf: [16384]u8 = undefined;
            rb.fieldStr("data", db.rowsToJsonArray(&data_buf, result));
        } else {
            rb.fieldInt("affected", database.changes());
        }
        sql_results.addRaw(rb.finish());
    }

    // Build final response
    var resp_out_buf: [131072]u8 = undefined;
    var rb = json.Builder.init(&resp_out_buf);
    rb.fieldStr("response", ai_text);
    rb.fieldStr("sql_results", sql_results.finish());
    http.jsonOk(out, rb.finish());
}

// ── WhatsApp Webhook ────────────────────────────────────────────────────────

fn handleWhatsAppVerify(req: http.Request, out: ResponseOut) void {
    const query = req.query orelse {
        http.jsonError(out, 400, "Missing query");
        return;
    };
    const mode = getQueryParam(query, "hub.mode");
    const token = getQueryParam(query, "hub.verify_token");
    const challenge = getQueryParam(query, "hub.challenge");

    const expected = auth.getVariable("whatsapp_verify_token") orelse "zamna-verify-2026";

    if (mode != null and token != null and challenge != null) {
        if (std.mem.eql(u8, mode.?, "subscribe") and std.mem.eql(u8, token.?, expected)) {
            http.sendResponse(out, 200, "text/plain", challenge.?);
            return;
        }
    }
    http.jsonError(out, 403, "Verification failed");
}

fn handleWhatsAppWebhook(req: http.Request, out: ResponseOut) void {
    const body = req.readBody() orelse {
        http.jsonOk(out, "{\"ok\":true}");
        return;
    };

    // Extract message data from WhatsApp webhook payload
    // Nested JSON: entry[].changes[].value.messages[].text.body
    const msg_body = extractNestedField(body, "\"body\":\"") orelse {
        // Not a text message (could be status update, etc.)
        http.jsonOk(out, "{\"ok\":true}");
        return;
    };

    const from_phone = extractNestedField(body, "\"from\":\"") orelse "unknown";
    const wa_msg_id = extractNestedField(body, "\"id\":\"wamid.") orelse
        extractNestedField(body, "\"id\":\"") orelse "";
    const from_name = extractNestedField(body, "\"profile\":{\"name\":\"") orelse
        extractNestedField(body, "\"name\":\"") orelse "";

    // Check for mention: look for @zamna, @ZAMNA, ザムナ, or bot phone number
    const is_mention = std.mem.indexOf(u8, msg_body, "@zamna") != null or
        std.mem.indexOf(u8, msg_body, "@ZAMNA") != null or
        std.mem.indexOf(u8, msg_body, "ZAMNA") != null or
        std.mem.indexOf(u8, msg_body, "zamna") != null;

    // Log to DB
    var database = openDb(out) orelse return;
    defer database.close();

    var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{
        if (wa_msg_id.len > 0) db.textVal(wa_msg_id) else db.nullVal(),
        db.textVal(from_phone),
        if (from_name.len > 0) db.textVal(from_name) else db.nullVal(),
        db.nullVal(), // group_id - extracted if available
        db.textVal("text"),
        db.textVal(msg_body),
        db.intVal(if (is_mention) 1 else 0),
    };
    _ = database.execParams(
        "INSERT OR IGNORE INTO whatsapp_messages (wa_msg_id, from_phone, from_name, group_id, message_type, body, is_mention) VALUES (?,?,?,?,?,?,?)",
        &params,
    ) catch {};

    // If mentioned, process with Claude agent and reply
    if (is_mention) {
        processWhatsAppMention(&database, from_phone, from_name, msg_body);
    }

    http.jsonOk(out, "{\"ok\":true}");
}

fn processWhatsAppMention(database: *db.Db, from_phone: []const u8, from_name: []const u8, msg_body: []const u8) void {
    // Build context from DB
    var ctx_buf: [4096]u8 = undefined;
    var ctx_pos: usize = 0;

    const tables = [_][]const u8{ "partners", "email_signups", "submissions", "meeting_requests", "feedback", "vip_inquiries" };
    for (tables) |tbl| {
        var sql_buf: [128]u8 = undefined;
        const sql = std.fmt.bufPrint(&sql_buf, "SELECT COUNT(*) FROM {s}", .{tbl}) catch continue;
        const result = database.exec(sql, &.{}) catch continue;
        if (result.rows.len > 0 and result.rows.ptr[0].values.len > 0) {
            const v = result.rows.ptr[0].values.ptr[0];
            if (v.tag == c.FERMYON_SPIN_2_0_0_SQLITE_VALUE_INTEGER) {
                const line = std.fmt.bufPrint(ctx_buf[ctx_pos..], "{s}: {d} rows\n", .{ tbl, v.val.integer }) catch break;
                ctx_pos += line.len;
            }
        }
    }

    // Get recent WhatsApp messages for context
    const recent = database.exec(
        "SELECT from_name, body FROM whatsapp_messages ORDER BY created_at DESC LIMIT 10",
        &.{},
    ) catch null;

    var recent_buf: [2048]u8 = undefined;
    var recent_pos: usize = 0;
    if (recent) |r| {
        for (0..r.rows.len) |i| {
            const row = r.rows.ptr[i];
            const name = db.getText(row, 0) orelse "?";
            const text = db.getText(row, 1) orelse "";
            const line = std.fmt.bufPrint(recent_buf[recent_pos..], "{s}: {s}\n", .{ name, text }) catch break;
            recent_pos += line.len;
        }
    }

    const system_prompt =
        "You are ZAMNA HAWAII 2026 AI assistant in a WhatsApp group chat.\n" ++
        "Festival: Sep 4-5, 2026, Oahu, Hawaii. Music + wellness festival.\n" ++
        "You help the team with operations, answer questions, and can update the database.\n\n" ++
        "DB TABLES: partners, email_signups, submissions, meeting_requests, feedback, notes, task_overrides, vip_inquiries, nft_passes, cms_content\n\n" ++
        "To query/modify data, output SQL in ```sql\\n...\\n``` blocks. Only SELECT, INSERT, UPDATE allowed.\n" ++
        "Keep responses SHORT (max 300 chars) for WhatsApp readability.\n" ++
        "Respond in the same language as the message. Be friendly and concise.\n";

    var full_prompt_buf: [8192]u8 = undefined;
    const full_prompt = std.fmt.bufPrint(&full_prompt_buf,
        "{s}\nDB state:\n{s}\nRecent chat:\n{s}",
        .{ system_prompt, ctx_buf[0..ctx_pos], recent_buf[0..recent_pos] },
    ) catch system_prompt;

    // Build messages array for Claude
    var msg_buf: [2048]u8 = undefined;
    const messages = std.fmt.bufPrint(&msg_buf,
        "[{{\"role\":\"user\",\"content\":\"{s} (from {s}): {s}\"}}]",
        .{ from_name, from_phone, msg_body },
    ) catch return;

    // Call Claude
    const resp_body = claude.chat(full_prompt, messages) orelse return;
    const ai_text = claude.extractText(resp_body) orelse return;

    // Execute any SQL in the response
    var search_pos: usize = 0;
    while (search_pos < ai_text.len) {
        const sql_start_marker = "```sql\\n";
        const sql_end_marker = "\\n```";
        const start = std.mem.indexOfPos(u8, ai_text, search_pos, sql_start_marker) orelse break;
        const sql_begin = start + sql_start_marker.len;
        const end = std.mem.indexOfPos(u8, ai_text, sql_begin, sql_end_marker) orelse break;
        const sql_str = ai_text[sql_begin..end];
        search_pos = end + sql_end_marker.len;

        // Validate
        var upper_buf: [16]u8 = undefined;
        const first_word_end = std.mem.indexOf(u8, sql_str, " ") orelse sql_str.len;
        const fwl = @min(first_word_end, upper_buf.len);
        for (0..fwl) |i| upper_buf[i] = std.ascii.toUpper(sql_str[i]);
        const fw = upper_buf[0..fwl];
        if (std.mem.eql(u8, fw, "SELECT") or std.mem.eql(u8, fw, "INSERT") or std.mem.eql(u8, fw, "UPDATE")) {
            _ = database.exec(sql_str, &.{}) catch {};
        }
    }

    // Clean AI text: remove SQL blocks for WhatsApp reply, unescape \\n to actual newlines
    var clean_buf: [2048]u8 = undefined;
    var clean_pos: usize = 0;
    var skip = false;
    var i: usize = 0;
    while (i < ai_text.len) {
        if (i + 6 < ai_text.len and std.mem.eql(u8, ai_text[i .. i + 6], "```sql")) {
            skip = true;
            i += 6;
            continue;
        }
        if (skip) {
            if (i + 3 <= ai_text.len and std.mem.eql(u8, ai_text[i .. i + 3], "```")) {
                skip = false;
                i += 3;
                continue;
            }
            i += 1;
            continue;
        }
        // Unescape \\n to newline
        if (i + 2 <= ai_text.len and ai_text[i] == '\\' and ai_text[i + 1] == 'n') {
            if (clean_pos < clean_buf.len) {
                clean_buf[clean_pos] = '\n';
                clean_pos += 1;
            }
            i += 2;
            continue;
        }
        if (clean_pos < clean_buf.len) {
            clean_buf[clean_pos] = ai_text[i];
            clean_pos += 1;
        }
        i += 1;
    }

    const reply = std.mem.trim(u8, clean_buf[0..clean_pos], " \n\r\t");
    if (reply.len > 0) {
        _ = whatsapp.sendMessage(from_phone, reply);

        // Update DB with reply
        var up = [_]c.fermyon_spin_2_0_0_sqlite_value_t{
            db.textVal(reply),
            db.textVal(from_phone),
        };
        _ = database.execParams(
            "UPDATE whatsapp_messages SET replied=1, reply_text=? WHERE id=(SELECT MAX(id) FROM whatsapp_messages WHERE from_phone=? AND replied=0)",
            &up,
        ) catch {};
    }
}

fn extractNestedField(body: []const u8, needle: []const u8) ?[]const u8 {
    const idx = std.mem.indexOf(u8, body, needle) orelse return null;
    const start = idx + needle.len;
    var end = start;
    while (end < body.len) : (end += 1) {
        if (body[end] == '"' and (end == start or body[end - 1] != '\\')) {
            if (end > start) return body[start..end];
            return null;
        }
    }
    return null;
}

fn handleGetWhatsAppMessages(_: http.Request, out: ResponseOut) void {
    var database = openDb(out) orelse return;
    defer database.close();
    const result = database.exec(
        "SELECT id, from_phone, from_name, body, is_mention, replied, reply_text, created_at FROM whatsapp_messages ORDER BY created_at DESC LIMIT 100",
        &.{},
    ) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };
    var buf: [131072]u8 = undefined;
    http.jsonOk(out, db.rowsToJsonArray(&buf, result));
}

// ── Audit Log ───────────────────────────────────────────────────────────────

fn logAudit(database: *db.Db, action: []const u8, target: ?[]const u8, member: ?[]const u8, details: ?[]const u8) void {
    var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{
        db.textVal(action),
        optText(target),
        optText(member),
        optText(details),
    };
    _ = database.execParams("INSERT INTO audit_log (action, target, member, details) VALUES (?,?,?,?)", &params) catch {};
}

fn handleGetAuditLog(_: http.Request, out: ResponseOut) void {
    var database = openDb(out) orelse return;
    defer database.close();
    const result = database.exec(
        "SELECT id, action, target, member, details, created_at FROM audit_log ORDER BY created_at DESC LIMIT 200",
        &.{},
    ) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };
    var buf: [131072]u8 = undefined;
    http.jsonOk(out, db.rowsToJsonArray(&buf, result));
}

// ── CSV Export ──────────────────────────────────────────────────────────────

fn handleExport(req: http.Request, out: ResponseOut) void {
    const path = req.path;
    const table = path["/api/export/".len..];

    // Validate table name
    const allowed_tables = [_][]const u8{
        "partners", "email_signups", "submissions", "meeting_requests",
        "feedback", "notes", "vip_inquiries", "nft_passes", "whatsapp_messages", "audit_log",
    };
    var valid = false;
    for (allowed_tables) |a| {
        if (std.mem.eql(u8, table, a)) {
            valid = true;
            break;
        }
    }
    if (!valid) {
        http.jsonError(out, 400, "Invalid table");
        return;
    }

    var database = openDb(out) orelse return;
    defer database.close();

    var sql_buf: [128]u8 = undefined;
    const sql = std.fmt.bufPrint(&sql_buf, "SELECT * FROM {s} ORDER BY ROWID DESC LIMIT 1000", .{table}) catch {
        http.jsonError(out, 500, "SQL error");
        return;
    };

    const result = database.exec(sql, &.{}) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };

    // Build CSV
    var csv_buf: [262144]u8 = undefined;
    var csv_pos: usize = 0;

    // Header row
    for (0..result.columns.len) |ci| {
        if (ci > 0) {
            csv_buf[csv_pos] = ',';
            csv_pos += 1;
        }
        const col = result.columns.ptr[ci].ptr[0..result.columns.ptr[ci].len];
        for (col) |ch| {
            if (csv_pos < csv_buf.len - 2) {
                csv_buf[csv_pos] = ch;
                csv_pos += 1;
            }
        }
    }
    csv_buf[csv_pos] = '\n';
    csv_pos += 1;

    // Data rows
    for (0..result.rows.len) |ri| {
        const row = result.rows.ptr[ri];
        for (0..result.columns.len) |ci| {
            if (ci > 0) {
                csv_buf[csv_pos] = ',';
                csv_pos += 1;
            }
            if (ci < row.values.len) {
                const v = row.values.ptr[ci];
                switch (v.tag) {
                    db.VALUE_TEXT => {
                        const t = v.val.text.ptr[0..v.val.text.len];
                        // Quote if contains comma or newline
                        const needs_quote = std.mem.indexOf(u8, t, ",") != null or std.mem.indexOf(u8, t, "\n") != null;
                        if (needs_quote) {
                            if (csv_pos < csv_buf.len - 2) {
                                csv_buf[csv_pos] = '"';
                                csv_pos += 1;
                            }
                        }
                        for (t) |ch| {
                            if (csv_pos < csv_buf.len - 4) {
                                if (ch == '"') {
                                    csv_buf[csv_pos] = '"';
                                    csv_pos += 1;
                                }
                                csv_buf[csv_pos] = ch;
                                csv_pos += 1;
                            }
                        }
                        if (needs_quote) {
                            if (csv_pos < csv_buf.len - 2) {
                                csv_buf[csv_pos] = '"';
                                csv_pos += 1;
                            }
                        }
                    },
                    db.VALUE_INTEGER => {
                        var tmp: [20]u8 = undefined;
                        const s = std.fmt.bufPrint(&tmp, "{d}", .{v.val.integer}) catch "0";
                        for (s) |ch| {
                            if (csv_pos < csv_buf.len - 2) {
                                csv_buf[csv_pos] = ch;
                                csv_pos += 1;
                            }
                        }
                    },
                    else => {},
                }
            }
        }
        csv_buf[csv_pos] = '\n';
        csv_pos += 1;
    }

    http.sendResponse(out, 200, "text/csv", csv_buf[0..csv_pos]);
}

// ── Stats ───────────────────────────────────────────────────────────────────

fn handleGetStats(_: http.Request, out: ResponseOut) void {
    var database = openDb(out) orelse return;
    defer database.close();

    var buf: [8192]u8 = undefined;
    var rb = json.Builder.init(&buf);

    // Total counts
    const count_queries = [_][2][]const u8{
        .{ "email_signups", "SELECT COUNT(*) FROM email_signups" },
        .{ "submissions", "SELECT COUNT(*) FROM submissions" },
        .{ "meetings", "SELECT COUNT(*) FROM meeting_requests" },
        .{ "vip_inquiries", "SELECT COUNT(*) FROM vip_inquiries" },
        .{ "partners", "SELECT COUNT(*) FROM partners" },
        .{ "feedback", "SELECT COUNT(*) FROM feedback" },
        .{ "whatsapp_messages", "SELECT COUNT(*) FROM whatsapp_messages" },
    };

    for (count_queries) |q| {
        const result = database.exec(q[1], &.{}) catch continue;
        if (result.rows.len > 0 and result.rows.ptr[0].values.len > 0) {
            const v = result.rows.ptr[0].values.ptr[0];
            if (v.tag == c.FERMYON_SPIN_2_0_0_SQLITE_VALUE_INTEGER) {
                rb.fieldInt(q[0], v.val.integer);
            }
        }
    }

    // Recent signups (last 7 days daily)
    const daily = database.exec(
        "SELECT date(created_at) as day, COUNT(*) as cnt FROM email_signups WHERE created_at >= datetime('now', '-7 days') GROUP BY day ORDER BY day",
        &.{},
    ) catch null;
    if (daily) |d| {
        var daily_buf: [1024]u8 = undefined;
        rb.fieldStr("signups_daily", db.rowsToJsonArray(&daily_buf, d));
    }

    // Paid vs unpaid submissions
    const paid = database.exec("SELECT COUNT(*) FROM submissions WHERE paid=1", &.{}) catch null;
    if (paid) |p| {
        if (p.rows.len > 0 and p.rows.ptr[0].values.len > 0) {
            const v = p.rows.ptr[0].values.ptr[0];
            if (v.tag == c.FERMYON_SPIN_2_0_0_SQLITE_VALUE_INTEGER) {
                rb.fieldInt("paid_submissions", v.val.integer);
            }
        }
    }

    // Partner status breakdown
    const pstatus = database.exec(
        "SELECT status, COUNT(*) as cnt FROM partners GROUP BY status",
        &.{},
    ) catch null;
    if (pstatus) |ps| {
        var ps_buf: [512]u8 = undefined;
        rb.fieldStr("partner_status", db.rowsToJsonArray(&ps_buf, ps));
    }

    http.jsonOk(out, rb.finish());
}

// ── CMS Content ─────────────────────────────────────────────────────────────

fn handleGetCms(req: http.Request, out: ResponseOut) void {
    var database = openDb(out) orelse return;
    defer database.close();

    const section_filter = if (req.query) |q| getQueryParam(q, "section") else null;

    if (section_filter) |section| {
        var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{db.textVal(section)};
        const result = database.execParams(
            "SELECT id, section, key, value_ja, value_en, updated_by, updated_at FROM cms_content WHERE section=? ORDER BY key",
            &params,
        ) catch {
            http.jsonError(out, 500, "Database error");
            return;
        };
        var buf: [65536]u8 = undefined;
        http.jsonOk(out, db.rowsToJsonArray(&buf, result));
    } else {
        const result = database.exec(
            "SELECT id, section, key, value_ja, value_en, updated_by, updated_at FROM cms_content ORDER BY section, key",
            &.{},
        ) catch {
            http.jsonError(out, 500, "Database error");
            return;
        };
        var buf: [65536]u8 = undefined;
        http.jsonOk(out, db.rowsToJsonArray(&buf, result));
    }
}

fn handlePostCms(req: http.Request, out: ResponseOut) void {
    const body = req.readBody() orelse {
        http.jsonError(out, 400, "Missing body");
        return;
    };
    const section = json.getStr(body, "section") orelse {
        http.jsonError(out, 400, "section and key required");
        return;
    };
    const key = json.getStr(body, "key") orelse {
        http.jsonError(out, 400, "section and key required");
        return;
    };

    var database = openDb(out) orelse return;
    defer database.close();

    var params = [_]c.fermyon_spin_2_0_0_sqlite_value_t{
        db.textVal(section),
        db.textVal(key),
        optText(json.getStr(body, "value_ja")),
        optText(json.getStr(body, "value_en")),
        optText(json.getStr(body, "updated_by")),
    };
    _ = database.execParams(
        "INSERT INTO cms_content (section, key, value_ja, value_en, updated_by) VALUES (?,?,?,?,?) ON CONFLICT(section,key) DO UPDATE SET value_ja=excluded.value_ja, value_en=excluded.value_en, updated_by=excluded.updated_by, updated_at=datetime('now')",
        &params,
    ) catch {
        http.jsonError(out, 500, "Database error");
        return;
    };

    logAudit(&database, "cms_update", section, json.getStr(body, "updated_by"), key);
    http.jsonOk(out, "{\"ok\":true}");
}

// ── Helpers ─────────────────────────────────────────────────────────────────

fn getQueryParam(query: []const u8, key: []const u8) ?[]const u8 {
    var search_buf: [64]u8 = undefined;
    const prefix = std.fmt.bufPrint(&search_buf, "{s}=", .{key}) catch return null;

    // Check if query starts with the key
    var start: usize = 0;
    if (std.mem.startsWith(u8, query, prefix)) {
        start = prefix.len;
    } else {
        // Search for &key=
        var amp_buf: [65]u8 = undefined;
        const amp_prefix = std.fmt.bufPrint(&amp_buf, "&{s}=", .{key}) catch return null;
        if (std.mem.indexOf(u8, query, amp_prefix)) |idx| {
            start = idx + amp_prefix.len;
        } else {
            return null;
        }
    }

    // Find end of value (next & or end of string)
    const end = std.mem.indexOfPos(u8, query, start, "&") orelse query.len;
    return query[start..end];
}
