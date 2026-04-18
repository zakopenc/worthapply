#!/usr/bin/env node

/**
 * Setup WorthApply Database Schema
 * 
 * This script creates the required tables for the dashboard:
 * - profiles (user profile data)
 * - applications (job applications tracking)
 * - job_analyses (job fit analysis results)
 * 
 * Usage: node scripts/setup-database.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Read SQL file
const sqlFilePath = path.join(__dirname, '..', 'setup-database.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

console.log('🚀 Setting up WorthApply database schema...\n');

// Parse Supabase URL to get project ref
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
const apiUrl = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;

// Execute SQL via Supabase REST API
// Note: This uses a custom RPC function that may not exist
// Better approach: Use Supabase Management API or direct pg connection

console.log('⚠️  This script requires manual execution in Supabase SQL Editor\n');
console.log('📋 Copy the SQL from setup-database.sql and run it in:');
console.log(`   ${SUPABASE_URL.replace('hfeitnerllyoszkcqlof', 'app')}/project/${projectRef}/sql/new\n`);
console.log('Or use the Supabase CLI:');
console.log('   supabase db push --db-url "postgresql://..."');
console.log('\n✅ SQL file ready at: setup-database.sql');
console.log('\n📝 Manual steps:');
console.log('   1. Go to Supabase Dashboard > SQL Editor');
console.log('   2. Click "New Query"');
console.log('   3. Copy contents of setup-database.sql');
console.log('   4. Click "Run"');
console.log('   5. Verify tables created in Table Editor\n');

// Alternative: Direct execution using node-postgres if connection string is available
const connectionString = process.env.DATABASE_URL;

if (connectionString) {
  console.log('🔧 Attempting direct database connection...\n');
  
  // Dynamic import for pg
  import('pg').then(({ Client }) => {
    const client = new Client({ connectionString });
    
    client.connect()
      .then(() => {
        console.log('✅ Connected to database');
        return client.query(sql);
      })
      .then(() => {
        console.log('✅ Schema created successfully!');
        console.log('\n📊 Tables created:');
        console.log('   - profiles');
        console.log('   - applications');
        console.log('   - job_analyses');
        console.log('\n🔒 RLS policies enabled');
        console.log('📈 Indexes created for performance');
        console.log('⚡ Triggers set up for updated_at\n');
        return client.end();
      })
      .then(() => {
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Database error:', error.message);
        console.error('\n💡 Fallback: Use Supabase SQL Editor (see instructions above)');
        client.end();
        process.exit(1);
      });
  }).catch(() => {
    console.log('ℹ️  pg module not installed, use SQL Editor method above');
  });
} else {
  console.log('ℹ️  No DATABASE_URL found, use SQL Editor method above\n');
}
