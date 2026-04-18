#!/usr/bin/env node

/**
 * Setup WorthApply Database Schema - Simple Version
 * Uses Supabase client to execute SQL statements
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  process.exit(1);
}

console.log('🚀 Setting up WorthApply database schema...\n');

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// SQL statements to execute (split into individual statements)
const statements = [
  // Profiles table
  `CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    subscription_tier TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY`,
  
  `DROP POLICY IF EXISTS "Users can view own profile" ON profiles`,
  `DROP POLICY IF EXISTS "Users can update own profile" ON profiles`,
  `DROP POLICY IF EXISTS "Users can insert own profile" ON profiles`,
  
  `CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id)`,
  `CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id)`,
  `CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id)`,
  
  // Applications table
  `CREATE TABLE IF NOT EXISTS applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    company_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    response_date TIMESTAMPTZ,
    interview_date TIMESTAMPTZ,
    notes TEXT,
    job_url TEXT,
    salary_range TEXT,
    location TEXT,
    job_description TEXT
  )`,
  
  `ALTER TABLE applications ENABLE ROW LEVEL SECURITY`,
  
  `DROP POLICY IF EXISTS "Users can view own applications" ON applications`,
  `DROP POLICY IF EXISTS "Users can insert own applications" ON applications`,
  `DROP POLICY IF EXISTS "Users can update own applications" ON applications`,
  `DROP POLICY IF EXISTS "Users can delete own applications" ON applications`,
  
  `CREATE POLICY "Users can view own applications" ON applications FOR SELECT USING (auth.uid() = user_id)`,
  `CREATE POLICY "Users can insert own applications" ON applications FOR INSERT WITH CHECK (auth.uid() = user_id)`,
  `CREATE POLICY "Users can update own applications" ON applications FOR UPDATE USING (auth.uid() = user_id)`,
  `CREATE POLICY "Users can delete own applications" ON applications FOR DELETE USING (auth.uid() = user_id)`,
  
  // Job analyses table
  `CREATE TABLE IF NOT EXISTS job_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    company_name TEXT,
    job_title TEXT,
    match_score INTEGER,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    job_description TEXT,
    job_url TEXT,
    analysis_results JSONB
  )`,
  
  `ALTER TABLE job_analyses ENABLE ROW LEVEL SECURITY`,
  
  `DROP POLICY IF EXISTS "Users can view own analyses" ON job_analyses`,
  `DROP POLICY IF EXISTS "Users can insert own analyses" ON job_analyses`,
  `DROP POLICY IF EXISTS "Users can update own analyses" ON job_analyses`,
  `DROP POLICY IF EXISTS "Users can delete own analyses" ON job_analyses`,
  
  `CREATE POLICY "Users can view own analyses" ON job_analyses FOR SELECT USING (auth.uid() = user_id)`,
  `CREATE POLICY "Users can insert own analyses" ON job_analyses FOR INSERT WITH CHECK (auth.uid() = user_id)`,
  `CREATE POLICY "Users can update own analyses" ON job_analyses FOR UPDATE USING (auth.uid() = user_id)`,
  `CREATE POLICY "Users can delete own analyses" ON job_analyses FOR DELETE USING (auth.uid() = user_id)`,
  
  // Indexes
  `CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)`,
  `CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_job_analyses_user_id ON job_analyses(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_job_analyses_created_at ON job_analyses(created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_job_analyses_match_score ON job_analyses(match_score DESC)`,
  
  // Trigger function
  `CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ language 'plpgsql'`,
   
   // Triggers
   `DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles`,
   `DROP TRIGGER IF EXISTS update_applications_updated_at ON applications`,
   `DROP TRIGGER IF EXISTS update_job_analyses_updated_at ON job_analyses`,
   
   `CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
   `CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
   `CREATE TRIGGER update_job_analyses_updated_at BEFORE UPDATE ON job_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`
];

console.log('📝 Executing SQL statements...\n');

// Execute each statement via RPC
async function setupDatabase() {
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 60).replace(/\s+/g, ' ');
    
    try {
      // Use supabase.rpc to execute raw SQL
      // Note: This requires a custom RPC function in Supabase
      const { data, error } = await supabase.rpc('exec_sql', { sql: stmt });
      
      if (error) throw error;
      
      console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
      successCount++;
    } catch (error) {
      console.error(`❌ [${i + 1}/${statements.length}] ${preview}...`);
      console.error(`   Error: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Results: ${successCount} succeeded, ${errorCount} failed\n`);
  
  if (errorCount > 0) {
    console.log('⚠️  Some statements failed. This is expected if using Supabase client.');
    console.log('💡 Use the SQL Editor method instead:\n');
    console.log('   1. Go to: https://supabase.com/dashboard/project/hfeitnerllyoszkcqlof/sql/new');
    console.log('   2. Copy contents of setup-database.sql');
    console.log('   3. Click "Run"');
    console.log('   4. Verify tables in Table Editor\n');
    process.exit(1);
  } else {
    console.log('✅ Database setup complete!');
    process.exit(0);
  }
}

setupDatabase();
