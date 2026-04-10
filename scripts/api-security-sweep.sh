#!/bin/bash
# Quick unauthenticated API sweep — endpoints should NOT return 200 without auth.
BASE="${1:-https://www.worthapply.com}"

ENDPOINTS=(
  "/api/analyze"
  "/api/tailor"
  "/api/applications"
  "/api/parse-resume"
  "/api/profile"
  "/api/preferences"
  "/api/cover-letter"
  "/api/scrape-jobs"
  "/api/chat"
  "/api/checkout"
  "/api/portal"
  "/api/create-checkout-session"
  "/api/create-portal-session"
)

echo "API Security Sweep against $BASE"
echo "Unauthenticated POST — should return 401/403/405 (or 400 for missing body)"
echo "---------------------------------------------------------------------------"

exit_code=0
for ep in "${ENDPOINTS[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" -d "{}" "$BASE$ep")
  case "$code" in
    401|403|405|400) echo "  PASS  $ep -> $code (blocked)" ;;
    404)              echo "  WARN  $ep -> 404 (route missing)" ;;
    *)                echo "  FAIL  $ep -> $code (possibly exposed)"; exit_code=1 ;;
  esac
done

exit $exit_code
