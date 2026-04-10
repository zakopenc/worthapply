#!/bin/bash

# Fix Supabase RLS Policies
# This script applies the RLS policy fixes using the Supabase API

set -e

echo "🔧 Applying Supabase RLS Policy Fixes"
echo "======================================"
echo ""

# Load environment variables
source .env.local 2>/dev/null || {
    echo "❌ Error: .env.local not found"
    exit 1
}

# Check credentials
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Missing Supabase credentials in .env.local"
    exit 1
fi

echo "✅ Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

# Function to execute SQL
execute_sql() {
    local sql="$1"
    local description="$2"
    
    echo "⏳ $description..."
    
    # Try using pg_net extension or direct SQL execution
    # Note: This requires the SQL to be executed via Supabase dashboard
    # as there's no direct SQL execution API without custom RPC functions
    
    echo "   ⚠️  SQL execution via API requires manual step"
}

echo "📋 SQL Script Created: fix_rls_policies.sql"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  MANUAL STEP REQUIRED - Supabase Dashboard                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "The Supabase REST API doesn't support direct SQL execution."
echo "Please follow these steps:"
echo ""
echo "1. Open Supabase Dashboard:"
echo "   https://supabase.com/dashboard/project/hfeitnerllyoszkcqlof/editor/sql/new"
echo ""
echo "2. Copy the SQL from fix_rls_policies.sql:"
echo "   cat fix_rls_policies.sql | pbcopy  # macOS"
echo "   cat fix_rls_policies.sql | xclip   # Linux"
echo ""
echo "3. Paste into the SQL Editor"
echo ""
echo "4. Click 'Run' button"
echo ""
echo "5. Verify you see 4 policies listed at the end"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ALTERNATIVE: Use psql (if you have database password)    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "If you have the database password, you can run:"
echo ""
echo "  psql 'postgresql://postgres:[PASSWORD]@db.hfeitnerllyoszkcqlof.supabase.co:5432/postgres' < fix_rls_policies.sql"
echo ""
echo "Get the password from Supabase Dashboard → Settings → Database"
echo ""
