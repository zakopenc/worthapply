# 🔧 Supabase RLS Policy Fix Guide

**Issue:** Users can sign up but cannot use any product features  
**Error:** `"new row violates row-level security policy for table 'profiles'"`  
**Impact:** 🔴 CRITICAL - Product completely blocked  
**Fix Time:** ⏱️ 2 minutes

---

## 🎯 Quick Fix (RECOMMENDED)

### Option 1: Supabase Dashboard SQL Editor (Easiest - No Password Required)

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/hfeitnerllyoszkcqlof/editor/sql
   - Click "New Query"

2. **Copy the SQL script:**
   ```bash
   cat fix_rls_policies.sql
   ```
   Or open `fix_rls_policies.sql` and copy all content

3. **Paste into SQL Editor**
   - Paste the entire SQL script
   - Click "Run" button (bottom right)

4. **Verify Success:**
   - You should see output showing 4 policies created:
     - ✅ Users can insert their own profile (INSERT)
     - ✅ Users can read their own profile (SELECT)
     - ✅ Users can update their own profile (UPDATE)
     - ✅ Users can delete their own profile (DELETE)

5. **Test the Fix:**
   - Go to https://worthapply.com/signup
   - Create a new test user
   - Try to analyze a job
   - Verify no "Failed to reserve usage" error

**Done!** ✅ Product should now work

---

## 🔐 Alternative Options

### Option 2: psql Command Line (if you have DB password)

1. **Get your database password:**
   - Supabase Dashboard → Settings → Database
   - Copy the "Database Password"

2. **Run the fix:**
   ```bash
   psql 'postgresql://postgres:[YOUR-PASSWORD]@db.hfeitnerllyoszkcqlof.supabase.co:5432/postgres' < fix_rls_policies.sql
   ```

3. **Verify output shows 4 policies created**

---

### Option 3: Supabase CLI (if installed)

```bash
# Install Supabase CLI (if needed)
npm install -g supabase

# Link to your project
supabase link --project-ref hfeitnerllyoszkcqlof

# Apply the migration
supabase db push < fix_rls_policies.sql
```

---

## 📋 What the Fix Does

The SQL script (`fix_rls_policies.sql`) performs these steps:

1. **Enables RLS** on the `profiles` table
2. **Drops any conflicting policies** (old/incorrect ones)
3. **Creates 4 new policies:**
   - INSERT: Users can create their own profile row
   - SELECT: Users can read their own profile
   - UPDATE: Users can update their own profile
   - DELETE: Users can delete their own profile

All policies check: `auth.uid() = id` to ensure users only access their own data.

---

## 🧪 Testing After Fix

### Test 1: Profile Creation

1. Create new user at worthapply.com/signup
2. Check Supabase Dashboard → Authentication → Users
3. Verify user exists
4. Check Table Editor → profiles table
5. **Verify profile row was created** ✅

### Test 2: Job Analysis

1. Log in as test user
2. Go to /analyzer
3. Paste a job description
4. Click "Analyze fit"
5. **Verify analysis works** (no "Failed to reserve usage" error) ✅

### Test 3: All Features

1. Upload resume ✅
2. Tailor resume ✅
3. Generate cover letter ✅
4. Save application ✅

---

## ❓ Troubleshooting

### Still getting "Failed to reserve usage"?

**Check 1: Policies exist**
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';
```

Should return 4 policies (INSERT, SELECT, UPDATE, DELETE)

**Check 2: RLS is enabled**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
```

Should return `rowsecurity = true`

**Check 3: Profile was created**
```sql
SELECT id, created_at, plan 
FROM profiles 
WHERE id = auth.uid();
```

Should return your profile row

---

### Other Issues?

**Error: "relation 'profiles' does not exist"**
- Run the database schema migration first
- Check `DATABASE_SCHEMA_COMPLETE.md` for schema setup

**Error: "permission denied for table profiles"**
- Verify you're using SERVICE_ROLE_KEY for admin operations
- Or using authenticated user token for user operations

**Error: "function auth.uid() does not exist"**
- Install the Supabase Auth extension:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  ```

---

## 🔍 Understanding RLS Policies

### What is RLS?

Row Level Security (RLS) = Postgres feature that restricts which rows users can see/modify.

### Why did it fail?

**Before fix:**
- RLS enabled but no INSERT policy existed
- Users could authenticate ✅
- But couldn't create profile row ❌

**After fix:**
- RLS enabled AND policies exist
- Users can authenticate ✅
- AND create their profile ✅

### Policy Syntax Explained

```sql
CREATE POLICY "Users can insert their own profile"
ON profiles                    -- Table name
FOR INSERT                     -- Operation (INSERT/SELECT/UPDATE/DELETE)
TO authenticated              -- Role (authenticated users only)
WITH CHECK (auth.uid() = id); -- Condition (user's ID must match row ID)
```

---

## 📊 Database Connection Info

**Host:** db.hfeitnerllyoszkcqlof.supabase.co  
**Port:** 5432  
**Database:** postgres  
**User:** postgres  
**Password:** [Get from Supabase Dashboard → Settings → Database]

**Full Connection String:**
```
postgresql://postgres:[PASSWORD]@db.hfeitnerllyoszkcqlof.supabase.co:5432/postgres
```

---

## 📁 Files Created

- `fix_rls_policies.sql` - SQL script with RLS policy fixes
- `fix-rls-policies.js` - Node.js helper (manual fallback)
- `apply-rls-fix.sh` - Bash helper with instructions
- `RLS_FIX_GUIDE.md` - This guide

---

## ⏭️ Next Steps After Fix

1. ✅ **Test E2E flow** - Signup → Analyze → Upload → Tailor
2. ✅ **Test payment** - Upgrade to Pro, verify subscription
3. ✅ **Set up monitoring** - Google Analytics, error tracking
4. ✅ **Launch ads** - Product is now functional!

---

## 🎓 Learning Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

---

## 🆘 Need Help?

If the fix doesn't work:

1. **Check Supabase logs:**
   - Dashboard → Logs → Postgres Logs
   - Look for RLS policy errors

2. **Enable verbose logging:**
   ```sql
   SET client_min_messages = DEBUG;
   ```

3. **Test manually:**
   ```sql
   -- As authenticated user
   INSERT INTO profiles (id, created_at, plan) 
   VALUES (auth.uid(), now(), 'free');
   ```

4. **Contact support:**
   - Supabase Discord: https://discord.supabase.com
   - Or email: support@supabase.io

---

**Status:** 📋 Ready to execute  
**Expected Duration:** 2 minutes  
**Risk Level:** 🟢 Low (read-only policies, safe to run)  

**Run the fix now using Option 1 above!** ✅
