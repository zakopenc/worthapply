#!/bin/bash

# WorthApply Credentials Setup Helper
# Run this script to interactively set up your .env.local file

echo "🔑 WorthApply Credentials Setup"
echo "================================"
echo ""

ENV_FILE=".env.local"

# Check if .env.local exists
if [ -f "$ENV_FILE" ]; then
    echo "⚠️  .env.local already exists. This will ADD to it (not overwrite)."
    echo ""
    read -p "Continue? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

echo ""
echo "📍 Your Supabase Project: hfeitnerllyoszkcqlof"
echo "   Dashboard: https://supabase.com/dashboard/project/hfeitnerllyoszkcqlof"
echo ""

# Supabase URL (we know this)
echo "# Supabase" >> "$ENV_FILE"
echo "NEXT_PUBLIC_SUPABASE_URL=https://hfeitnerllyoszkcqlof.supabase.co" >> "$ENV_FILE"

# Supabase Anon Key
echo "Go to: https://supabase.com/dashboard/project/hfeitnerllyoszkcqlof/settings/api"
echo ""
read -p "Paste your SUPABASE ANON KEY (starts with eyJ...): " SUPABASE_ANON
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON" >> "$ENV_FILE"

# Supabase Service Role Key
echo ""
read -p "Paste your SUPABASE SERVICE ROLE KEY (starts with eyJ...): " SUPABASE_SERVICE
echo "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE" >> "$ENV_FILE"

echo ""
echo "✅ Supabase credentials added!"
echo ""

# Stripe
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Stripe Dashboard: https://dashboard.stripe.com/test/apikeys"
echo ""
read -p "Do you have Stripe credentials? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "" >> "$ENV_FILE"
    echo "# Stripe" >> "$ENV_FILE"
    
    read -p "Paste your STRIPE SECRET KEY (sk_test_... or sk_live_...): " STRIPE_SECRET
    echo "STRIPE_SECRET_KEY=$STRIPE_SECRET" >> "$ENV_FILE"
    
    read -p "Paste your STRIPE PUBLISHABLE KEY (pk_test_... or pk_live_...): " STRIPE_PUB
    echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUB" >> "$ENV_FILE"
    
    echo ""
    echo "For webhook secret, run: stripe listen --forward-to localhost:3000/api/webhooks/stripe"
    read -p "Paste your STRIPE WEBHOOK SECRET (whsec_...) or press Enter to skip: " STRIPE_WEBHOOK
    
    if [ ! -z "$STRIPE_WEBHOOK" ]; then
        echo "STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK" >> "$ENV_FILE"
    fi
    
    echo "✅ Stripe credentials added!"
else
    echo "⏭️  Skipping Stripe for now"
fi

# Gemini (already set)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Gemini API key already configured"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Setup complete!"
echo ""
echo "Your credentials have been added to .env.local"
echo ""
echo "Next steps:"
echo "1. npm run dev"
echo "2. Go to http://localhost:3000/signup"
echo "3. Test signup → upload resume → analyze job"
echo ""
echo "If everything works → deploy to Vercel → launch ads 🚀"
echo ""
