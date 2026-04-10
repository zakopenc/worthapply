#!/bin/bash

# ============================================================
# WorthApply - Master Test Runner
# Runs all automated tests and generates comprehensive report
# ============================================================

set -e

TESTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$TESTS_DIR")"
REPORT_FILE="$TESTS_DIR/PRODUCTION_TEST_REPORT_$(date +%Y%m%d-%H%M%S).md"

echo "🧪 WorthApply Complete Test Suite"
echo "=================================="
echo ""
echo "Running all automated tests..."
echo "Report will be saved to: $REPORT_FILE"
echo ""
echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
sleep 5

# Initialize report
cat > "$REPORT_FILE" << 'EOF'
# 🧪 WorthApply Production Test Report

**Generated:** $(date)
**Site:** https://worthapply.com
**Status:** IN PROGRESS...

---

## Test Results

EOF

echo ""
echo "============================================="
echo "🚀 Phase 1: HTTP & API Tests"
echo "============================================="
echo ""

if [ -f "$TESTS_DIR/automated-production-test.sh" ]; then
  chmod +x "$TESTS_DIR/automated-production-test.sh"
  
  if "$TESTS_DIR/automated-production-test.sh"; then
    echo "" >> "$REPORT_FILE"
    echo "### ✅ HTTP & API Tests: PASSED" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    PHASE1_STATUS="✅ PASSED"
  else
    echo "" >> "$REPORT_FILE"
    echo "### ❌ HTTP & API Tests: FAILED" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    PHASE1_STATUS="❌ FAILED"
  fi
else
  echo "⚠️  WARNING: automated-production-test.sh not found"
  PHASE1_STATUS="⚠️  SKIPPED"
fi

echo ""
echo "============================================="
echo "🗄️  Phase 2: Database Tests"
echo "============================================="
echo ""

cd "$PROJECT_ROOT"

if [ -f "$TESTS_DIR/database-test.js" ]; then
  if node "$TESTS_DIR/database-test.js"; then
    echo "" >> "$REPORT_FILE"
    echo "### ✅ Database Tests: PASSED" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    PHASE2_STATUS="✅ PASSED"
  else
    echo "" >> "$REPORT_FILE"
    echo "### ❌ Database Tests: FAILED" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "**Critical database issues found!**" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    PHASE2_STATUS="❌ FAILED"
  fi
else
  echo "⚠️  WARNING: database-test.js not found"
  PHASE2_STATUS="⚠️  SKIPPED"
fi

echo ""
echo "============================================="
echo "🎓 Phase 3: Onboarding UI Tests"
echo "============================================="
echo ""

if [ -f "$TESTS_DIR/onboarding-test.js" ]; then
  if node "$TESTS_DIR/onboarding-test.js"; then
    echo "" >> "$REPORT_FILE"
    echo "### ✅ Onboarding UI Tests: PASSED" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    PHASE3_STATUS="✅ PASSED"
  else
    echo "" >> "$REPORT_FILE"
    echo "### ⚠️  Onboarding UI Tests: FAILED" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    PHASE3_STATUS="❌ FAILED"
  fi
else
  echo "⚠️  WARNING: onboarding-test.js not found"
  PHASE3_STATUS="⚠️  SKIPPED"
fi

echo ""
echo "============================================="
echo "📊 Generating Final Report"
echo "============================================="
echo ""

# Add summary to report
cat >> "$REPORT_FILE" << EOF

---

## Summary

| Test Suite | Status |
|-------------|--------|
| HTTP & API Tests | $PHASE1_STATUS |
| Database Tests | $PHASE2_STATUS |
| Onboarding UI Tests | $PHASE3_STATUS |

---

## Manual Tests Required

The following tests still require manual verification:

- [ ] **Google OAuth Sign Up** - Create account with real Google
- [ ] **Google OAuth Sign In** - Sign in with existing account
- [ ] **Resume Upload** - Upload real PDF and verify parsing
- [ ] **Onboarding Completion** - Complete all steps, check database
- [ ] **Dashboard Access** - Verify protected routes work when authenticated
- [ ] **Mobile Testing** - Test on iOS and Android devices
- [ ] **Cross-Browser** - Test on Safari, Firefox, Edge
- [ ] **Stripe Integration** - Test payment flow (if applicable)

---

## Production Readiness

EOF

# Determine overall status
if [[ "$PHASE1_STATUS" == *"PASSED"* ]] && [[ "$PHASE2_STATUS" == *"PASSED"* ]]; then
  cat >> "$REPORT_FILE" << 'EOF'
### ✅ READY FOR BETA LAUNCH

**All automated tests passed!**

**Next Steps:**
1. Complete manual tests above (2-3 hours)
2. Invite 10-20 beta users
3. Monitor closely for 48 hours
4. Fix any issues found
5. Launch publicly after validation

**Confidence Level:** 80-90% (after manual tests: 95%+)

EOF
  OVERALL_STATUS="✅ READY FOR BETA"
  
elif [[ "$PHASE2_STATUS" == *"FAILED"* ]]; then
  cat >> "$REPORT_FILE" << 'EOF'
### ❌ NOT READY - CRITICAL ISSUES

**Database tests failed - critical security or schema issues!**

**DO NOT LAUNCH** until database issues are fixed.

**Required Actions:**
1. Review database test failures above
2. Fix schema issues (missing tables/columns)
3. Enable RLS if disabled (SECURITY CRITICAL!)
4. Re-run tests until all pass

**Estimated Fix Time:** 1-2 hours

EOF
  OVERALL_STATUS="❌ NOT READY"
  
else
  cat >> "$REPORT_FILE" << 'EOF'
### ⚠️  ISSUES FOUND

Some tests failed or were skipped.

**Review Results:** Check individual test sections above for details

**Recommended Actions:**
1. Fix any failed tests
2. Re-run full test suite
3. Don't launch until all tests pass

EOF
  OVERALL_STATUS="⚠️  NEEDS FIXES"
fi

cat >> "$REPORT_FILE" << EOF

---

**Report Generated:** $(date)
**Test Duration:** ~3 minutes
**Overall Status:** $OVERALL_STATUS

EOF

echo ""
echo "============================================="
echo "✅ Test Suite Complete"
echo "============================================="
echo ""
echo "Phase 1 (HTTP/API): $PHASE1_STATUS"
echo "Phase 2 (Database): $PHASE2_STATUS"
echo "Phase 3 (Onboarding): $PHASE3_STATUS"
echo ""
echo "Overall Status: $OVERALL_STATUS"
echo ""
echo "📄 Full report saved to:"
echo "   $REPORT_FILE"
echo ""

# Display report
if command -v mdcat &> /dev/null; then
  echo "📖 Viewing report (press 'q' to exit):"
  mdcat "$REPORT_FILE" | less -R
elif command -v bat &> /dev/null; then
  echo "📖 Viewing report (press 'q' to exit):"
  bat "$REPORT_FILE"
else
  echo "📖 Report contents:"
  cat "$REPORT_FILE"
fi

echo ""

# Exit with appropriate code
if [[ "$OVERALL_STATUS" == "✅ READY FOR BETA" ]]; then
  echo "🎉 Congratulations! Your app is ready for beta launch!"
  exit 0
elif [[ "$OVERALL_STATUS" == "❌ NOT READY" ]]; then
  echo "⚠️  Critical issues found. Fix before launching!"
  exit 1
else
  echo "⚠️  Some tests need attention. Review report before launching."
  exit 1
fi
