#!/usr/bin/env bash
# SOLUNA secrets / admin / 412 smoke test.
# Usage:
#   ./scripts/smoke-secrets.sh                  # interactive (asks for OTP)
#   ./scripts/smoke-secrets.sh CODE             # CODE = 6-digit OTP from email
#   GMAIL=yuki@hamada.tokyo ./scripts/smoke-secrets.sh    # auto-fetch via gog
#
# Exits non-zero on first failed check so CI can gate on this script.

set -euo pipefail

HOST="${SOLUNA_HOST:-https://solun.art}"
EMAIL="${ADMIN_EMAIL:-mail@yukihamada.jp}"
SLUG="${SLUG:-atami}"
PASS=0
FAIL=0

green() { printf "\033[32m%s\033[0m\n" "$*"; }
red()   { printf "\033[31m%s\033[0m\n" "$*"; }
gray()  { printf "\033[90m%s\033[0m\n" "$*"; }
hdr()   { printf "\n\033[1m%s\033[0m\n" "── $* ──"; }

ok()   { PASS=$((PASS+1)); green "  ✓ $*"; }
ng()   { FAIL=$((FAIL+1)); red   "  ✗ $*"; }

req() {
  # req METHOD URL [body] — uses curl with the standard auth + CSRF headers.
  local m="$1" u="$2" b="${3:-}"
  if [ -n "$b" ]; then
    curl -sS -X "$m" "$HOST$u" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Origin: $HOST" \
      -H "X-Requested-With: XMLHttpRequest" \
      -H "Content-Type: application/json" \
      -d "$b"
  else
    curl -sS -X "$m" "$HOST$u" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Origin: $HOST" \
      -H "X-Requested-With: XMLHttpRequest"
  fi
}

reqcode() {
  # reqcode METHOD URL [body] — returns just the HTTP code.
  local m="$1" u="$2" b="${3:-}"
  if [ -n "$b" ]; then
    curl -sS -o /dev/null -w "%{http_code}" -X "$m" "$HOST$u" \
      -H "Authorization: Bearer $TOKEN" -H "Origin: $HOST" \
      -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -d "$b"
  else
    curl -sS -o /dev/null -w "%{http_code}" -X "$m" "$HOST$u" \
      -H "Authorization: Bearer $TOKEN" -H "Origin: $HOST" -H "X-Requested-With: XMLHttpRequest"
  fi
}

# ── 1. OTP login ─────────────────────────────────────────────────────────────
hdr "Login (OTP)"
curl -sS -X POST "$HOST/api/soluna/otp" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\"}" >/dev/null
gray "  OTP sent to $EMAIL"
CODE="${1:-}"
if [ -z "$CODE" ] && [ -n "${GMAIL:-}" ] && command -v gog >/dev/null 2>&1; then
  sleep 10
  CODE=$(gog gmail search "subject:ログインコード newer_than:1m" --account "$GMAIL" --plain 2>/dev/null \
    | head -3 | tail -1 | grep -oE '\b[0-9]{6}\b' | head -1 || true)
  [ -n "$CODE" ] && gray "  auto-fetched code from $GMAIL"
fi
if [ -z "$CODE" ]; then
  read -r -p "  Enter the 6-digit OTP code: " CODE
fi
TOKEN=$(curl -sS -X POST "$HOST/api/soluna/verify" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"code\":\"$CODE\"}" \
  | python3 -c "import json,sys;print(json.load(sys.stdin).get('token',''))")
[ -n "$TOKEN" ] && ok "verify → token $(echo "$TOKEN" | cut -c1-16)…" \
                || { ng "verify failed (wrong code?)"; exit 1; }

# ── 2. Profile ───────────────────────────────────────────────────────────────
hdr "Profile"
PROF=$(req GET /api/soluna/me/profile)
echo "$PROF" | python3 -c "
import json,sys
d=json.load(sys.stdin)
ok=d.get('profile_complete') and d.get('is_admin')
print(('  ✓' if ok else '  ✗')+' name='+d.get('name','-')+' is_owner='+str(d.get('is_owner'))+' is_admin='+str(d.get('is_admin')))
sys.exit(0 if ok else 1)
" || { ng "profile incomplete or not admin"; exit 1; }
ok "profile complete + admin"

# ── 3. Team ──────────────────────────────────────────────────────────────────
hdr "Team list"
TEAM=$(req GET /api/soluna/admin/team)
N=$(echo "$TEAM" | python3 -c "import json,sys;print(len(json.load(sys.stdin)['admins']))")
[ "$N" -ge 1 ] && ok "$N admin(s) listed" || ng "admin list empty"

# ── 4. Health ────────────────────────────────────────────────────────────────
hdr "Health snapshot"
H=$(req GET /api/soluna/admin/health)
echo "$H" | python3 -c "
import json,sys
d=json.load(sys.stdin)
c=d['counts']
print(f'  audit_24h={c[\"audit_events_last_24h\"]} pending_sync={c[\"properties_pending_sync\"]} errors={c[\"properties_with_sync_error\"]} invites={c[\"pending_admin_invites\"]} in_flight={c[\"total_in_flight_guests\"]}')"
ok "health snapshot OK"

# ── 5. Audit cross-property ──────────────────────────────────────────────────
hdr "Cross-property audit"
A=$(req GET "/api/soluna/admin/audit?limit=5&since_hours=168")
COUNT=$(echo "$A" | python3 -c "import json,sys;print(json.load(sys.stdin)['count'])")
ok "audit returned $COUNT rows in last 7d"

# ── 6. CSRF (no X-Requested-With) ────────────────────────────────────────────
hdr "CSRF defense"
C=$(curl -sS -o /dev/null -w "%{http_code}" -X PUT "$HOST/api/soluna/admin/property-secrets/$SLUG" \
     -H "Authorization: Bearer $TOKEN" -H "Origin: $HOST" -H "Content-Type: application/json" -d '{}')
[ "$C" = "403" ] && ok "PUT without X-Requested-With → 403" || ng "expected 403 got $C"
C=$(curl -sS -o /dev/null -w "%{http_code}" -X PUT "$HOST/api/soluna/admin/property-secrets/$SLUG" \
     -H "Authorization: Bearer $TOKEN" -H "Origin: https://evil.example" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -d '{}')
[ "$C" = "403" ] && ok "PUT from evil.example → 403" || ng "expected 403 got $C"

# ── 7. 412 in-flight rotate ──────────────────────────────────────────────────
hdr "412 in-flight rotate flow"
TODAY=$(date +%Y-%m-%d)
TWO_DAYS=$(date -v+2d +%Y-%m-%d 2>/dev/null || date -d "+2 days" +%Y-%m-%d)
INJ=$(req POST /api/soluna/admin/test/booking "{\"slug\":\"$SLUG\",\"check_in\":\"$TODAY\",\"check_out\":\"$TWO_DAYS\"}")
echo "$INJ" | grep -q '"ok":true' && ok "test booking injected" || ng "inject failed: $INJ"
C=$(reqcode POST "/api/soluna/admin/property-secrets/$SLUG/rotate-door" '{}')
[ "$C" = "412" ] && ok "rotate without confirm → 412" || ng "expected 412 got $C"
C=$(reqcode POST "/api/soluna/admin/property-secrets/$SLUG/rotate-door?confirm=1" '{"confirm":true}')
[ "$C" = "200" ] && ok "rotate with confirm=1 → 200" || ng "expected 200 got $C"
DEL=$(req DELETE /api/soluna/admin/test/booking)
echo "$DEL" | grep -q '"ok":true' && ok "cleanup test bookings" || ng "cleanup failed: $DEL"

# ── 8. Security headers ──────────────────────────────────────────────────────
hdr "Security headers (admin + manual)"
CSP_ADMIN=$(curl -sS -I -b "sln_tok=$TOKEN" "$HOST/admin/secrets" | grep -ci 'content-security-policy')
CSP_MANU=$(curl -sS -I -b "sln_tok=$TOKEN" "$HOST/$SLUG/manual" | grep -ci 'content-security-policy')
[ "$CSP_ADMIN" = "1" ] && ok "CSP on /admin/secrets" || ng "CSP missing on /admin/secrets"
[ "$CSP_MANU"  = "1" ] && ok "CSP on /$SLUG/manual"   || ng "CSP missing on /$SLUG/manual"

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
if [ "$FAIL" -eq 0 ]; then
  green "════════════════════════════════════"
  green "  ALL PASS — $PASS checks ✓"
  green "════════════════════════════════════"
  exit 0
else
  red   "════════════════════════════════════"
  red   "  $FAIL FAILED / $PASS passed"
  red   "════════════════════════════════════"
  exit 1
fi
