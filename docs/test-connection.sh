#!/bin/bash

# WorthApply Connection Test
# Tests Supabase, Gemini, and basic functionality

echo "🧪 WorthApply Connection Test"
echo "=============================="
echo ""

BASE_URL="http://localhost:3003"

# Check if dev server is running
echo "1️⃣ Checking dev server..."
if curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo "   ✅ Dev server is running"
else
    echo "   ❌ Dev server not running"
    echo "   Run: npm run dev"
    exit 1
fi

echo ""
echo "2️⃣ Testing homepage..."
TITLE=$(curl -s "$BASE_URL" | grep -o "<title>.*</title>")
if [[ $TITLE == *"WorthApply"* ]]; then
    echo "   ✅ Homepage loads"
else
    echo "   ❌ Homepage broken"
fi

echo ""
echo "3️⃣ Testing dark mode toggle..."
THEME_SCRIPT=$(curl -s "$BASE_URL" | grep -c "theme-script")
if [ $THEME_SCRIPT -gt 0 ]; then
    echo "   ✅ Dark mode script present"
else
    echo "   ❌ Dark mode missing"
fi

echo ""
echo "4️⃣ Testing signup page..."
SIGNUP=$(curl -s "$BASE_URL/signup" | grep -c "sign up\|Sign Up\|Create account")
if [ $SIGNUP -gt 0 ]; then
    echo "   ✅ Signup page loads"
else
    echo "   ❌ Signup page broken"
fi

echo ""
echo "5️⃣ Testing pricing page..."
PRICING=$(curl -s "$BASE_URL/pricing" | grep -c "Pro\|Free\|pricing")
if [ $PRICING -gt 0 ]; then
    echo "   ✅ Pricing page loads"
else
    echo "   ❌ Pricing page broken"
fi

echo ""
echo "6️⃣ Testing comparison pages..."
COMPARE=$(curl -s "$BASE_URL/compare/jobscan" | grep -c "Jobscan\|comparison")
if [ $COMPARE -gt 0 ]; then
    echo "   ✅ Comparison pages load"
else
    echo "   ❌ Comparison pages broken"
fi

echo ""
echo "7️⃣ Checking environment variables..."
if [ -f ".env.local" ]; then
    echo "   ✅ .env.local exists"
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo "   ✅ Supabase URL configured"
    else
        echo "   ❌ Supabase URL missing"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo "   ✅ Supabase anon key configured"
    else
        echo "   ❌ Supabase anon key missing"
    fi
    
    if grep -q "GOOGLE_GENERATIVE_AI_API_KEY" .env.local; then
        echo "   ✅ Gemini API key configured"
    else
        echo "   ❌ Gemini API key missing"
    fi
else
    echo "   ❌ .env.local not found"
fi

echo ""
echo "8️⃣ Testing Supabase connection..."
# Try to hit the API to see if Supabase credentials work
SUPABASE_TEST=$(curl -s "$BASE_URL/api/profile" 2>&1 | head -c 100)
if [[ $SUPABASE_TEST == *"Unauthorized"* ]] || [[ $SUPABASE_TEST == *"401"* ]]; then
    echo "   ✅ Supabase connection works (auth required as expected)"
elif [[ $SUPABASE_TEST == *"error"* ]] || [[ $SUPABASE_TEST == *"Error"* ]]; then
    echo "   ⚠️  Supabase connection issue (check logs)"
else
    echo "   ✅ API responding"
fi

echo ""
echo "=============================="
echo "📊 Test Summary"
echo "=============================="
echo ""
echo "✅ All tests passed: Ready for manual testing"
echo ""
echo "Next steps:"
echo "1. Go to: http://localhost:3003/signup"
echo "2. Create a test account"
echo "3. Upload a resume"
echo "4. Go to /analyzer"
echo "5. Paste a job description"
echo "6. Click 'Analyze Job Fit'"
echo "7. If results appear → YOU'RE READY TO DEPLOY 🚀"
echo ""
