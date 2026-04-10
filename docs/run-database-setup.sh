#!/bin/bash

echo "🚀 WorthApply Database Setup"
echo "=============================="
echo ""
echo "📋 This will set up the required database tables:"
echo "   - profiles (user data)"
echo "   - applications (job tracking)"
echo "   - job_analyses (fit analysis results)"
echo ""
echo "📝 SQL file location: setup-database.sql"
echo ""
echo "Choose setup method:"
echo ""
echo "1) Open Supabase SQL Editor in browser (RECOMMENDED)"
echo "2) Show SQL to copy manually"
echo "3) Cancel"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
  1)
    echo ""
    echo "✅ Opening Supabase SQL Editor..."
    echo ""
    echo "📋 Steps:"
    echo "   1. Browser will open to SQL Editor"
    echo "   2. Click 'New Query'"
    echo "   3. Copy contents of setup-database.sql (shown below)"
    echo "   4. Paste into SQL Editor"
    echo "   5. Click 'Run' button"
    echo ""
    echo "Press Enter to continue..."
    read
    
    # Open browser
    if command -v xdg-open > /dev/null; then
      xdg-open "https://supabase.com/dashboard/project/hfeitnerllyoszkcqlof/sql/new"
    elif command -v open > /dev/null; then
      open "https://supabase.com/dashboard/project/hfeitnerllyoszkcqlof/sql/new"
    else
      echo "🌐 Go to: https://supabase.com/dashboard/project/hfeitnerllyoszkcqlof/sql/new"
    fi
    
    echo ""
    echo "📄 SQL to copy (also in setup-database.sql):"
    echo "=================================================="
    cat setup-database.sql
    echo "=================================================="
    echo ""
    echo "✅ After running in Supabase, verify tables exist in Table Editor"
    ;;
    
  2)
    echo ""
    echo "📄 Copy this SQL and run in Supabase SQL Editor:"
    echo "=================================================="
    cat setup-database.sql
    echo "=================================================="
    echo ""
    echo "🌐 Supabase SQL Editor: https://supabase.com/dashboard/project/hfeitnerllyoszkcqlof/sql/new"
    ;;
    
  3)
    echo "❌ Cancelled"
    exit 0
    ;;
    
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "✅ Setup complete! Verify tables in Supabase dashboard."
