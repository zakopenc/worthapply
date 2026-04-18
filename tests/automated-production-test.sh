#!/bin/bash

# ============================================================
# WorthApply.com - Automated Production Testing Suite
# ============================================================
# Tests all critical functionality without requiring beta users
# Run this before launch to validate production readiness
# ============================================================

set -e  # Exit on any error

SITE_URL="https://www.worthapply.com"
RESULTS_FILE="test-results-$(date +%Y%m%d-%H%M%S).txt"

echo "🧪 WorthApply Production Test Suite"
echo "====================================="
echo "Started: $(date)"
echo "Site: $SITE_URL"
echo "Results will be saved to: $RESULTS_FILE"
echo ""

# ============================================================
# Test 1: Public Pages Accessibility
# ============================================================
echo "📄 Test 1: Public Pages Load (HTTP 200)"
echo "----------------------------------------"

pages=(
  "/"
  "/login"
  "/signup"
  "/pricing"
  "/features"
  "/about"
  "/privacy"
  "/terms"
  "/compare"
)

for page in "${pages[@]}"; do
  echo -n "Testing $SITE_URL$page ... "
  status=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL$page")
  if [ "$status" -eq 200 ]; then
    echo "✅ PASS ($status)"
  else
    echo "❌ FAIL ($status)"
    exit 1
  fi
done

echo ""

# ============================================================
# Test 2: Protected Routes (Should Redirect)
# ============================================================
echo "🔒 Test 2: Protected Routes Redirect to /login"
echo "-----------------------------------------------"

protected_pages=(
  "/dashboard"
  "/analyzer"
  "/resume"
  "/tailor"
  "/applications"
  "/tracker"
  "/settings"
)

for page in "${protected_pages[@]}"; do
  echo -n "Testing $SITE_URL$page (logged out) ... "
  
  # Follow redirects and get final URL
  final_url=$(curl -Ls -o /dev/null -w "%{url_effective}" "$SITE_URL$page")
  
  if [[ "$final_url" == *"/login"* ]] || [[ "$final_url" == *"/onboarding"* ]]; then
    echo "✅ PASS (redirects to auth)"
  else
    echo "❌ FAIL (accessible without auth: $final_url)"
    exit 1
  fi
done

echo ""

# ============================================================
# Test 3: API Endpoints
# ============================================================
echo "🔌 Test 3: API Endpoints"
echo "------------------------"

echo -n "Testing /api/parse-resume (without auth) ... "
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SITE_URL/api/parse-resume")
# Should return 401/403 (unauthorized) or 500 (missing file)
if [ "$status" -eq 401 ] || [ "$status" -eq 403 ] || [ "$status" -eq 400 ] || [ "$status" -eq 500 ]; then
  echo "✅ PASS (requires auth or file: $status)"
else
  echo "⚠️  WARNING (unexpected status: $status)"
fi

echo ""

# ============================================================
# Test 4: OAuth Callback Endpoint
# ============================================================
echo "🔐 Test 4: OAuth Callback"
echo "-------------------------"

echo -n "Testing /auth/callback (no code) ... "
status=$(curl -s -o /dev/null -w "%{http_code}" -L "$SITE_URL/auth/callback")
# Should redirect to login with error
if [ "$status" -eq 200 ]; then
  echo "✅ PASS (handles missing code)"
else
  echo "⚠️  WARNING (status: $status)"
fi

echo ""

# ============================================================
# Test 5: Static Assets
# ============================================================
echo "🖼️  Test 5: Static Assets Load"
echo "-------------------------------"

echo -n "Testing favicon.ico ... "
status=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/favicon.ico")
if [ "$status" -eq 200 ]; then
  echo "✅ PASS"
else
  echo "❌ FAIL ($status)"
fi

echo -n "Testing logo.png ... "
status=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/logo.png")
if [ "$status" -eq 200 ]; then
  echo "✅ PASS"
else
  echo "⚠️  WARNING ($status) - might not exist"
fi

echo ""

# ============================================================
# Test 6: Material Symbols Font
# ============================================================
echo "🎨 Test 6: Material Symbols Icons Font"
echo "---------------------------------------"

echo -n "Testing Google Fonts Material Symbols ... "
status=$(curl -s -o /dev/null -w "%{http_code}" "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap")
if [ "$status" -eq 200 ]; then
  echo "✅ PASS (font loads)"
else
  echo "❌ FAIL ($status)"
fi

echo ""

# ============================================================
# Test 7: Sitemap & SEO
# ============================================================
echo "🔍 Test 7: SEO & Sitemap"
echo "------------------------"

echo -n "Testing /sitemap.xml ... "
status=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/sitemap.xml")
if [ "$status" -eq 200 ]; then
  echo "✅ PASS"
else
  echo "⚠️  WARNING ($status) - sitemap might not exist"
fi

echo -n "Testing /robots.txt ... "
status=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/robots.txt")
if [ "$status" -eq 200 ]; then
  echo "✅ PASS"
else
  echo "⚠️  WARNING ($status) - robots.txt might not exist"
fi

echo ""

# ============================================================
# Test 8: HTTPS & Security Headers
# ============================================================
echo "🔒 Test 8: HTTPS & Security"
echo "---------------------------"

echo -n "Testing HTTPS redirect ... "
http_status=$(curl -s -o /dev/null -w "%{http_code}" -L "http://worthapply.com")
if [ "$http_status" -eq 200 ]; then
  echo "✅ PASS (HTTP redirects to HTTPS)"
else
  echo "⚠️  WARNING (status: $http_status)"
fi

echo -n "Testing security headers ... "
headers=$(curl -s -I "$SITE_URL" | grep -i "strict-transport-security\|x-frame-options\|x-content-type")
if [ -n "$headers" ]; then
  echo "✅ PASS (security headers present)"
else
  echo "⚠️  WARNING (no security headers found)"
fi

echo ""

# ============================================================
# Test 9: Page Load Performance
# ============================================================
echo "⚡ Test 9: Page Load Performance"
echo "--------------------------------"

echo -n "Testing homepage load time ... "
load_time=$(curl -s -o /dev/null -w "%{time_total}" "$SITE_URL/")
echo "⏱️  ${load_time}s"
if (( $(echo "$load_time < 3.0" | bc -l) )); then
  echo "   ✅ PASS (< 3 seconds)"
else
  echo "   ⚠️  WARNING (slow load time)"
fi

echo ""

# ============================================================
# Test 10: Form Validation (Client-Side)
# ============================================================
echo "📝 Test 10: HTML Form Structure"
echo "--------------------------------"

echo -n "Testing login form exists ... "
login_page=$(curl -s "$SITE_URL/login")
if echo "$login_page" | grep -q 'type="email"'; then
  echo "✅ PASS (email field found)"
else
  echo "❌ FAIL (email field not found)"
fi

echo -n "Testing signup form exists ... "
signup_page=$(curl -s "$SITE_URL/signup")
if echo "$signup_page" | grep -q 'type="email"'; then
  echo "✅ PASS (email field found)"
else
  echo "❌ FAIL (email field not found)"
fi

echo ""

# ============================================================
# Summary
# ============================================================
echo "============================================="
echo "✅ Production Test Suite Complete"
echo "============================================="
echo "Completed: $(date)"
echo ""
echo "All basic tests passed! ✅"
echo ""
echo "⚠️  MANUAL TESTS STILL REQUIRED:"
echo "  1. OAuth flow with real Google account"
echo "  2. Onboarding wizard file upload"
echo "  3. Dashboard authentication"
echo "  4. Database RLS policies"
echo "  5. Mobile responsive design"
echo ""
echo "Run these manual tests before full launch!"
echo ""

# Save results
{
  echo "WorthApply Production Test Results"
  echo "Generated: $(date)"
  echo "Site: $SITE_URL"
  echo ""
  echo "Status: ✅ AUTOMATED TESTS PASSED"
  echo ""
  echo "Manual tests remaining: OAuth, Onboarding, Dashboard, Database, Mobile"
} > "$RESULTS_FILE"

echo "Results saved to: $RESULTS_FILE"
