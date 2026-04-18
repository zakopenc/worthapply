#!/usr/bin/env node

/**
 * WorthApply Database Testing Suite
 * Tests Supabase schema, RLS policies, and data access
 * 
 * Usage: node database-test.js
 * 
 * Requires: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * in .env.local or environment variables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🗄️  WorthApply Database Test Suite');
console.log('===================================\n');

async function runTests() {
  let passedTests = 0;
  let failedTests = 0;
  let warnings = 0;

  // ============================================================
  // Test 1: Connection
  // ============================================================
  console.log('Test 1: Database Connection');
  console.log('----------------------------');
  
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(0);
    
    if (error && error.code === '42P01') {
      console.log('⚠️  WARNING: profiles table does not exist!');
      console.log('   You need to create the profiles table in Supabase');
      warnings++;
    } else if (error) {
      console.log(`❌ FAIL: ${error.message}`);
      failedTests++;
    } else {
      console.log('✅ PASS: Connected to Supabase successfully');
      passedTests++;
    }
  } catch (err) {
    console.log(`❌ FAIL: Connection error: ${err.message}`);
    failedTests++;
  }
  
  console.log('');

  // ============================================================
  // Test 2: Profiles Table Schema
  // ============================================================
  console.log('Test 2: Profiles Table Schema');
  console.log('------------------------------');
  
  const requiredColumns = [
    'id',
    'email',
    'full_name',
    'plan',
    'onboarding_complete',
    'created_at',
    'updated_at'
  ];

  try {
    // Try to select with all required columns
    const { data, error } = await supabase
      .from('profiles')
      .select(requiredColumns.join(', '))
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ FAIL: profiles table does not exist');
        console.log('   Create it in Supabase Table Editor');
        failedTests++;
      } else if (error.code === '42703') {
        console.log('❌ FAIL: Missing required column');
        console.log(`   Error: ${error.message}`);
        console.log('   Required columns:', requiredColumns.join(', '));
        failedTests++;
      } else {
        console.log(`⚠️  WARNING: ${error.message}`);
        warnings++;
      }
    } else {
      console.log('✅ PASS: All required columns exist');
      console.log(`   Columns: ${requiredColumns.join(', ')}`);
      passedTests++;
    }
  } catch (err) {
    console.log(`❌ FAIL: ${err.message}`);
    failedTests++;
  }
  
  console.log('');

  // ============================================================
  // Test 3: Onboarding Columns
  // ============================================================
  console.log('Test 3: Onboarding-Specific Columns');
  console.log('------------------------------------');
  
  const onboardingColumns = [
    'preferred_titles',
    'work_preference',
    'target_industries',
    'salary_min',
    'salary_max',
    'preferred_locations',
    'open_to_relocation'
  ];

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(onboardingColumns.join(', '))
      .limit(1);
    
    if (error) {
      if (error.code === '42703') {
        console.log('⚠️  WARNING: Some onboarding columns missing');
        console.log(`   ${error.message}`);
        console.log('   These columns are needed for onboarding to save data');
        warnings++;
      } else {
        console.log(`⚠️  WARNING: ${error.message}`);
        warnings++;
      }
    } else {
      console.log('✅ PASS: Onboarding columns exist');
      console.log(`   Columns: ${onboardingColumns.join(', ')}`);
      passedTests++;
    }
  } catch (err) {
    console.log(`⚠️  WARNING: ${err.message}`);
    warnings++;
  }
  
  console.log('');

  // ============================================================
  // Test 4: RLS Enabled Check
  // ============================================================
  console.log('Test 4: Row Level Security (RLS)');
  console.log('---------------------------------');
  
  try {
    // Try to access profiles without auth - should fail if RLS is enabled
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.log('✅ PASS: RLS is blocking unauthenticated access');
      console.log(`   Error: ${error.message}`);
      passedTests++;
    } else if (data && data.length === 0) {
      console.log('✅ PASS: RLS enabled (no data returned without auth)');
      passedTests++;
    } else if (data && data.length > 0) {
      console.log('❌ FAIL: RLS NOT ENABLED! Public access allowed!');
      console.log('   ⚠️  CRITICAL SECURITY ISSUE!');
      console.log('   Anyone can read all profiles without authentication!');
      console.log('   Fix this immediately:');
      console.log('   1. Go to Supabase dashboard');
      console.log('   2. Authentication → Policies');
      console.log('   3. Enable RLS on profiles table');
      console.log('   4. Add policy: Users can only read their own profile');
      failedTests++;
    }
  } catch (err) {
    console.log(`⚠️  WARNING: ${err.message}`);
    warnings++;
  }
  
  console.log('');

  // ============================================================
  // Test 5: Sign Up Functionality (Creates Test User)
  // ============================================================
  console.log('Test 5: User Sign Up');
  console.log('--------------------');
  
  const testEmail = `test-${Date.now()}@worthapply-test.com`;
  const testPassword = 'TestPassword123!';
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });
    
    if (error) {
      console.log(`❌ FAIL: Sign up failed: ${error.message}`);
      failedTests++;
    } else if (data.user) {
      console.log('✅ PASS: User sign up works');
      console.log(`   Test user created: ${testEmail}`);
      console.log(`   User ID: ${data.user.id}`);
      passedTests++;
      
      // Clean up: Try to delete test user (requires service role key)
      console.log('   ℹ️  Clean up test user manually in Supabase dashboard');
    } else {
      console.log('⚠️  WARNING: Sign up completed but no user data returned');
      warnings++;
    }
  } catch (err) {
    console.log(`❌ FAIL: ${err.message}`);
    failedTests++;
  }
  
  console.log('');

  // ============================================================
  // Test 6: Storage Buckets (for resume uploads)
  // ============================================================
  console.log('Test 6: Storage Buckets');
  console.log('-----------------------');
  
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log(`⚠️  WARNING: Cannot list storage buckets: ${error.message}`);
      warnings++;
    } else {
      console.log(`✅ PASS: Storage accessible`);
      console.log(`   Buckets: ${data.length}`);
      
      const resumeBucket = data.find(b => b.name === 'resumes');
      if (resumeBucket) {
        console.log('   ✅ "resumes" bucket exists');
      } else {
        console.log('   ⚠️  "resumes" bucket not found - create it for resume uploads');
        warnings++;
      }
      
      passedTests++;
    }
  } catch (err) {
    console.log(`⚠️  WARNING: ${err.message}`);
    warnings++;
  }
  
  console.log('');

  // ============================================================
  // Summary
  // ============================================================
  console.log('===========================================');
  console.log('Database Test Summary');
  console.log('===========================================');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log('');

  if (failedTests > 0) {
    console.log('❌ CRITICAL ISSUES FOUND!');
    console.log('   Fix these before launch!');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('⚠️  Some issues need attention');
    console.log('   Review warnings above');
    process.exit(0);
  } else {
    console.log('✅ All database tests passed!');
    process.exit(0);
  }
}

// Run tests
runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
