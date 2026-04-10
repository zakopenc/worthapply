#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkRLSPolicies() {
  console.log('\n🔍 Checking RLS Policies for profiles table...\n');

  try {
    // Query pg_policies to check what policies exist
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          policyname,
          cmd,
          roles::text[]
        FROM pg_policies 
        WHERE tablename = 'profiles'
        ORDER BY policyname;
      `
    });

    if (error) {
      // RPC might not exist, try direct query
      console.log('⚠️  Cannot query policies via RPC');
      console.log('ℹ️  Manual check required in Supabase SQL Editor\n');
      console.log('Run this query in Supabase Dashboard:');
      console.log('----------------------------------');
      console.log('SELECT policyname, cmd FROM pg_policies WHERE tablename = \'profiles\';');
      console.log('----------------------------------\n');
      return;
    }

    if (!data || data.length === 0) {
      console.log('❌ NO RLS POLICIES FOUND!');
      console.log('\n🔴 CRITICAL: Users cannot use product features!');
      console.log('\n✅ Fix: Run fix_rls_policies.sql in Supabase SQL Editor');
      console.log('   URL: https://supabase.com/dashboard/project/hfeitnerllyoszkcqlof/editor/sql\n');
    } else {
      console.log('✅ Found', data.length, 'RLS policies:\n');
      data.forEach(policy => {
        console.log(`  • ${policy.policyname} (${policy.cmd})`);
      });

      // Check if we have all 4 required policies
      const requiredPolicies = ['INSERT', 'SELECT', 'UPDATE', 'DELETE'];
      const existingPolicies = data.map(p => p.cmd);
      const missing = requiredPolicies.filter(p => !existingPolicies.includes(p));

      if (missing.length > 0) {
        console.log('\n⚠️  Missing policies:', missing.join(', '));
        console.log('✅ Fix: Run fix_rls_policies.sql in Supabase SQL Editor\n');
      } else {
        console.log('\n✅ All required policies exist!');
        console.log('✅ Product should be working correctly\n');
      }
    }
  } catch (err) {
    console.log('❌ Error checking policies:', err.message);
    console.log('\n📋 Manual verification needed:');
    console.log('1. Go to: https://supabase.com/dashboard/project/hfeitnerllyoszkcqlof/editor/sql');
    console.log('2. Run: SELECT policyname, cmd FROM pg_policies WHERE tablename = \'profiles\';');
    console.log('3. Verify 4 policies exist (INSERT, SELECT, UPDATE, DELETE)\n');
  }
}

checkRLSPolicies();
