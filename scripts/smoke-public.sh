#!/usr/bin/env bash
# Public-side smoke test for SOLUNA — no credentials required, safe for CI.
# Verifies that the auth gate, CSRF defense, security headers, and gating
# logic all reject anonymous mutations correctly.
#
# Usage:
#   ./scripts/smoke-public.sh                       # against https://solun.art
#   SOLUNA_HOST=https://soluna-web.fly.dev ./scripts/smoke-public.sh
#
# Exits non-zero on first failed check.

set -euo pipefail

HOST="${SOLUNA_HOST:-https://solun.art}"
PASS=0; FAIL=0
g() { printf "\033[32m%s\033[0m\n" "$*"; }
r() { printf "\033[31m%s\033[0m\n" "$*"; }
gray(){ printf "\033[90m%s\033[0m\n" "$*"; }
hdr(){ printf "\n\033[1m── %s ──\033[0m\n" "$*"; }
ok(){ PASS=$((PASS+1)); g "  ✓ $*"; }
ng(){ FAIL=$((FAIL+1)); r "  ✗ $*"; }

# expect_code  EXPECTED  METHOD  URL  [body]  [extra-header]
expect_code(){
  local exp="$1" m="$2" u="$3" b="${4:-}" extra="${5:-}"
  local args=(-sS -o /dev/null -w "%{http_code}" -X "$m" "$HOST$u")
  if [ -n "$b" ]; then args+=("-H" "Content-Type: application/json" "--data" "$b"); fi
  if [ -n "$extra" ]; then args+=($extra); fi
  local got
  got=$(curl "${args[@]}")
  if [ "$got" = "$exp" ]; then ok "$m $u → $got"
  else                          ng "$m $u → $got (expected $exp)"
  fi
}

expect_header(){
  local hdr="$1" u="$2" needle="${3:-}"
  # Use raw curl + grep with || true so a missing header is not a pipefail.
  local val
  val=$(curl -sS -I "$HOST$u" 2>/dev/null | (grep -i "^$hdr:" || true) | head -1 | tr -d '\r')
  if [ -z "$val" ]; then ng "$u missing $hdr"; return; fi
  if [ -n "$needle" ] && ! echo "$val" | grep -q "$needle"; then
    ng "$u $hdr does not contain '$needle' (got: $val)"
    return
  fi
  ok "$u $hdr ✓"
}

hdr "Auth gates (anonymous)"
expect_code 401 GET  /api/soluna/me/profile
expect_code 401 GET  /api/soluna/admin/team
expect_code 401 GET  /api/soluna/admin/audit
expect_code 401 GET  /api/soluna/admin/health
expect_code 401 GET  /api/soluna/admin/property-secrets/atami
expect_code 401 GET  /api/soluna/owner/property-secrets/atami

hdr "CSRF / origin defense"
expect_code 403 PUT  /api/soluna/admin/property-secrets/atami '{}'
expect_code 403 POST /api/soluna/admin/team/invite '{}'
expect_code 403 POST /api/soluna/admin/property-secrets/atami/rotate-door '{}'

hdr "Slug validation"
expect_code 404 GET  /wakayama/manual
expect_code 404 GET  /tapkop/manual
expect_code 404 GET  /honolulu/manual
expect_code 404 GET  /notexist/manual

hdr "Canonical URL redirects"
expect_code 301 GET  /atami-manual
expect_code 301 GET  /atami-manual.html

hdr "Manual + admin pages exist (gated)"
expect_code 401 GET  /atami/manual
expect_code 401 GET  /lodge/manual
expect_code 401 GET  /nesting/manual
expect_code 401 GET  /instant/manual
expect_code 401 GET  /admin/secrets
# Admin team / audit redirect to /login when no session cookie
expect_code 302 GET  /admin/team
expect_code 302 GET  /admin/audit

hdr "LINE Login availability (public)"
expect_code 200 GET  /api/soluna/auth/line/available

hdr "PDF runbook accessible"
expect_code 200 GET  /docs/runbook.pdf
expect_header "content-type"   /docs/runbook.pdf "application/pdf"

hdr "Security headers on manual + auth gate page"
expect_header "content-security-policy" /atami/manual "frame-ancestors 'none'"
expect_header "x-frame-options"         /atami/manual "DENY"
expect_header "referrer-policy"         /atami/manual

# auth gate page (401) — make sure CSP also lives there
val=$(curl -sS -I "$HOST/admin/secrets" 2>/dev/null | (grep -i "^content-security-policy:" || true) | head -1)
if [ -n "$val" ]; then ok "/admin/secrets gate has CSP"; else ng "/admin/secrets gate missing CSP"; fi

hdr "OTP send accepts shape"
expect_code 200 POST /api/soluna/otp '{"email":"test+'$(date +%s)'@example.invalid"}'
# Invalid OTP body
expect_code 400 POST /api/soluna/otp '{}'
expect_code 401 POST /api/soluna/verify '{"email":"x@y.z","code":"000000"}'

echo ""
if [ "$FAIL" -eq 0 ]; then
  g "════════════════════════════════════"
  g "  PUBLIC SMOKE PASS — $PASS / $PASS"
  g "════════════════════════════════════"
  exit 0
else
  r "════════════════════════════════════"
  r "  $FAIL FAILED / $((PASS+FAIL))"
  r "════════════════════════════════════"
  exit 1
fi
