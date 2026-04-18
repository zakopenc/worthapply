# Security Documentation

## Row Level Security (RLS) Policies

This document describes the Supabase Row Level Security policies implemented for worthapply.com.

### Overview

All tables have RLS enabled to ensure users can only access their own data. Policies enforce:
- **Authentication:** All operations require a valid authenticated user
- **Authorization:** Users can only operate on rows they own (via `user_id` column)
- **Data isolation:** Complete separation between user accounts

---

## Tables & Policies

### `profiles`
Stores user profile information.

**Policies:**
- **SELECT:** Users can read their own profile  
  ```sql
  CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);
  ```

- **INSERT:** Users can create their own profile  
  ```sql
  CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
  ```

- **UPDATE:** Users can update their own profile  
  ```sql
  CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  ```

### `resumes`
Stores user-uploaded resumes.

**Policies:**
- **SELECT:** Users can read their own resumes  
  ```sql
  CREATE POLICY "Users can view own resumes"
    ON resumes FOR SELECT
    USING (auth.uid() = user_id);
  ```

- **INSERT:** Users can upload resumes  
  ```sql
  CREATE POLICY "Users can insert own resumes"
    ON resumes FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  ```

- **UPDATE:** Users can update their own resumes  
  ```sql
  CREATE POLICY "Users can update own resumes"
    ON resumes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  ```

- **DELETE:** Users can delete their own resumes  
  ```sql
  CREATE POLICY "Users can delete own resumes"
    ON resumes FOR DELETE
    USING (auth.uid() = user_id);
  ```

### `applications`
Stores job applications tracked by users.

**Policies:**
- **SELECT:** Users can view their own applications  
- **INSERT:** Users can create new applications  
- **UPDATE:** Users can update their own applications  
- **DELETE:** Users can delete their own applications  

All policies use `auth.uid() = user_id` pattern.

### `analyses`
Stores job fit analysis results.

**Policies:**
- **SELECT:** Users can view their own analyses  
- **INSERT:** Users can create new analyses  
- **UPDATE:** Users can update their own analyses  

All policies use `auth.uid() = user_id` pattern.

### `cover_letters`
Stores generated cover letters.

**Policies:**
- **SELECT:** Users can view their own cover letters  
- **INSERT:** Users can generate new cover letters  
- **UPDATE:** Users can edit their cover letters  
- **DELETE:** Users can delete cover letters  

All policies use `auth.uid() = user_id` pattern.

---

## Testing RLS Policies

### Manual Testing Checklist

For each table, verify:

1. **Authenticated user can access their own data**  
   ```sql
   -- Should return rows
   SELECT * FROM applications WHERE user_id = auth.uid();
   ```

2. **Authenticated user CANNOT access other users' data**  
   ```sql
   -- Should return empty
   SELECT * FROM applications WHERE user_id != auth.uid();
   ```

3. **Unauthenticated requests are blocked**  
   ```sql
   -- Should fail
   SELECT * FROM applications;
   ```

4. **User cannot insert data for another user**  
   ```sql
   -- Should fail
   INSERT INTO applications (user_id, ...) VALUES ('other-user-id', ...);
   ```

### Automated Testing

Use Supabase's `supabase test db` command to run RLS policy tests:

```bash
supabase test db
```

---

## Auth Boundary Checks

All API routes and server actions must verify authentication before accessing data:

```typescript
import { createClient } from '@/lib/supabase/server'

export async function protectedAction() {
  const supabase = createClient()
  
  // ✅ ALWAYS verify the user
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return { error: 'Unauthorized' }
  }
  
  // ❌ DON'T just check session existence
  // const { data: { session } } = await supabase.auth.getSession()
  // if (!session) return { error: 'Unauthorized' }
  
  // Now safe to query with RLS
  const { data } = await supabase
    .from('applications')
    .select('*')
  
  return { data }
}
```

---

## Security Best Practices

### Input Validation
- Use Zod schemas for all form inputs
- Validate on both client and server
- Sanitize user-generated content before storage

### Error Handling
- Never expose database errors to clients
- Log errors internally, return safe messages
- Example:
  ```typescript
  catch (error) {
    console.error('DB error:', error)  // Internal log
    return { error: 'Failed to process request' }  // Safe client message
  }
  ```

### API Keys & Secrets
- Never hardcode API keys in source code
- Use environment variables (`process.env.*)
- Store secrets in Vercel environment variables
- Rotate keys regularly

### File Uploads
- Validate file types and sizes
- Use Supabase Storage RLS policies
- Scan uploaded files for malware
- Limit upload frequency (rate limiting)

### Rate Limiting
- Implement rate limiting on auth endpoints
- Use Vercel Edge Config or Upstash Redis
- Protect against brute force attacks

---

## Incident Response

If a security issue is discovered:

1. **Assess severity**  
   - P0 (Critical): Data breach, auth bypass, SQL injection
   - P1 (High): Permission escalation, sensitive data exposure
   - P2 (Medium): XSS, CSRF, weak validation
   - P3 (Low): Information disclosure, rate limiting gaps

2. **Immediate actions for P0/P1:**  
   - Deploy fix immediately
   - Rotate affected credentials
   - Notify affected users if data breach
   - Review logs for exploitation attempts

3. **Post-incident:**  
   - Document the issue and fix
   - Add regression tests
   - Review related code for similar issues
   - Update security documentation

---

## Audit Log

| Date | Change | Author |
|------|--------|--------|
| 2026-04-03 | Initial RLS documentation created | Dev Team |

---

## Contact

For security concerns or to report vulnerabilities:
- Email: security@worthapply.com
- Use responsible disclosure (24-hour response time)
