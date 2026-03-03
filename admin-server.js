/**
 * ZAMNA HAWAII — Admin-only server
 *
 * Usage:
 *   ADMIN_KEY=your_secret node admin-server.js
 *   Open: http://localhost:4000/admin?key=your_secret
 *
 * All admin routes require ?key= parameter or a valid session cookie.
 * Protected routes: /admin, /production, /safety, /staff, /budget,
 *                   /venue-agreement, /artist-contract, /press
 */

const http = require("http");
const { parse } = require("url");
const next = require("next");
const crypto = require("crypto");

const ADMIN_KEY = process.env.ADMIN_KEY || "LIFEISART";
const PORT = parseInt(process.env.ADMIN_PORT || "4000", 10);
const COOKIE_NAME = "zamna_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24h

// Routes that require admin auth
const PROTECTED_PATHS = [
  "/admin",
  "/production",
  "/safety",
  "/staff",
  "/budget",
  "/venue-agreement",
  "/artist-contract",
  "/press",
];

// Allowed public paths (assets, API, etc.)
const PUBLIC_PREFIXES = ["/_next", "/api", "/videos", "/audio", "/images", "/favicon", "/__nextjs"];

function isProtected(pathname) {
  const clean = pathname.replace(/\/$/, "") || "/";
  return PROTECTED_PATHS.some(p => clean === p || clean.startsWith(p + "/"));
}

function isPublic(pathname) {
  return PUBLIC_PREFIXES.some(p => pathname.startsWith(p));
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach(c => {
    const [key, ...rest] = c.trim().split("=");
    if (key) cookies[key] = rest.join("=");
  });
  return cookies;
}

// Valid session tokens (in-memory, resets on restart)
const validTokens = new Set();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname, query } = parsedUrl;

    // Public assets — always pass through
    if (isPublic(pathname)) {
      return handle(req, res, parsedUrl);
    }

    // Non-protected paths — block (admin server only serves admin pages)
    if (!isProtected(pathname) && pathname !== "/") {
      res.writeHead(302, { Location: `/admin${query.key ? `?key=${query.key}` : ""}` });
      return res.end();
    }

    // Root → redirect to admin
    if (pathname === "/") {
      res.writeHead(302, { Location: `/admin${query.key ? `?key=${query.key}` : ""}` });
      return res.end();
    }

    // Check auth: ?key= parameter or valid session cookie
    const cookies = parseCookies(req.headers.cookie);
    const hasValidCookie = cookies[COOKIE_NAME] && validTokens.has(cookies[COOKIE_NAME]);
    const hasValidKey = query.key === ADMIN_KEY;

    if (hasValidKey) {
      // Set session cookie and redirect without key in URL
      const token = generateToken();
      validTokens.add(token);
      // Clean up old tokens if too many (prevent memory leak)
      if (validTokens.size > 1000) {
        const arr = Array.from(validTokens);
        arr.slice(0, arr.length - 100).forEach(t => validTokens.delete(t));
      }
      res.writeHead(302, {
        "Set-Cookie": [
          `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`,
          `zamna_authed=1; Path=/; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`,
        ],
        Location: pathname,
      });
      return res.end();
    }

    if (hasValidCookie) {
      return handle(req, res, parsedUrl);
    }

    // Not authenticated — show 401
    res.writeHead(401, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ZAMNA HAWAII — Admin</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #080808; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .box { max-width: 360px; width: 100%; padding: 24px; text-align: center; }
    h1 { font-size: 18px; letter-spacing: 0.3em; margin-bottom: 8px; color: rgba(255,255,255,0.8); }
    p { color: rgba(255,255,255,0.3); font-size: 13px; margin-bottom: 24px; }
    form { display: flex; flex-direction: column; gap: 10px; }
    input { padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; outline: none; text-align: center; }
    input:focus { border-color: rgba(201,169,98,0.4); }
    button { padding: 12px; border-radius: 999px; background: rgba(201,169,98,0.15); border: 1px solid rgba(201,169,98,0.3); color: rgba(201,169,98,0.9); font-weight: 700; font-size: 13px; cursor: pointer; }
    button:hover { background: rgba(201,169,98,0.25); }
    .gold { color: rgba(201,169,98,0.5); font-size: 10px; letter-spacing: 0.25em; margin-bottom: 24px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>ZAMNA HAWAII</h1>
    <p class="gold">OPERATIONS · INTERNAL</p>
    <p>Access requires an admin key.</p>
    <form onsubmit="event.preventDefault(); const k = document.getElementById('k').value; if(k) window.location.href = window.location.pathname + '?key=' + encodeURIComponent(k);">
      <input id="k" type="password" placeholder="Admin Key" autofocus>
      <button type="submit">Enter</button>
    </form>
  </div>
</body>
</html>`);
  });

  server.listen(PORT, () => {
    console.log(`
┌─────────────────────────────────────────────┐
│  ZAMNA HAWAII — Admin Server                │
│                                             │
│  Local:  http://localhost:${PORT}/admin       │
│  Auth:   ?key=${ADMIN_KEY.slice(0, 4)}${"*".repeat(Math.max(0, ADMIN_KEY.length - 4))}                     │
│                                             │
│  Protected routes:                          │
│    /admin  /production  /safety  /staff     │
│    /budget  /venue-agreement                │
│    /artist-contract  /press                 │
└─────────────────────────────────────────────┘
`);
  });
});
