/**
 * Fix Supabase RLS Policies
 * 
 * This script fixes the Row Level Security policies on the profiles table
 * to allow authenticated users to insert, select, and update their own profiles.
 * 
 * Usage: node fix-rls-policies.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSql(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    throw error;
  }
  return data;
}

async function fixRlsPolicies() {
  console.log('🔧 Fixing Supabase RLS Policies for profiles table\n');
  
  try {
    // Read the SQL script
    const sqlScript = fs.readFileSync('./fix_rls_policies.sql', 'utf8');
    
    // Split into individual statements (simple split by semicolon)
    const statements = sqlScript
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
    
    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty lines
      if (statement.startsWith('--') || statement.length < 10) {
        continue;
      }
      
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // Use the SQL editor API endpoint directly
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ query: statement + ';' })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log(`   ⚠️  Warning: ${errorText}`);
        } else {
          console.log(`   ✅ Success`);
        }
      } catch (err) {
        console.log(`   ⚠️  Warning: ${err.message}`);
      }
    }
    
    console.log('\n✅ RLS policy fix attempted!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Paste the contents of fix_rls_policies.sql');
    console.log('3. Click "Run" to execute the script');
    console.log('\nOR use the Supabase CLI:');
    console.log('   supabase db push --db-url <your-db-url> < fix_rls_policies.sql');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nThe automated fix failed. Please:');
    console.error('1. Go to Supabase Dashboard → SQL Editor');
    console.error('2. Paste the contents of fix_rls_policies.sql');
    console.error('3. Click "Run" to execute manually');
    process.exit(1);
  }
}

// Run the fix
fixRlsPolicies();
