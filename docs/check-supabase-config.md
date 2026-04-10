# 🔍 Verify Supabase Configuration

## How to Check If Your Settings Were Saved

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/hfeitnerllyoszkcqlof/auth/url-configuration

### Step 2: Check Site URL Field
**What you should see:**
```
Site URL: https://worthapply.com
```

**NOT:**
```
Site URL: http://localhost:3000
```

### Step 3: Check Redirect URLs List
**Should contain (in the text area):**
```
https://worthapply.com
https://worthapply.com/auth/callback
https://worthapply.com/dashboard
https://*.vercel.app
https://*.vercel.app/auth/callback
http://localhost:3000
http://localhost:3000/auth/callback
```

### Step 4: Screenshot What You See
If it's still not working, take a screenshot of:
1. The Site URL field
2. The Redirect URLs field
3. Any error messages

---

## Alternative: Use Supabase CLI to Check

If you have Supabase CLI installed:

```bash
cd /home/zak/projects/worthapply
npx supabase projects list
npx supabase projects api-keys --project-ref hfeitnerllyoszkcqlof
```

---

## Common Issues

### Issue 1: Changes Didn't Save
**Symptoms:** Page refreshes but settings revert
**Fix:** 
- Click "Save" button at bottom
- Wait for success message
- Refresh page to confirm changes stuck

### Issue 2: Multiple Site URL Fields
**Symptoms:** Saved wrong field
**Fix:**
- Look for "Site URL" (singular) at the top
- NOT "Redirect URLs" (plural) in the list

### Issue 3: Browser Autocomplete
**Symptoms:** Browser auto-filled old localhost value
**Fix:**
- Clear the field completely first
- Paste: `https://worthapply.com`
- Make sure no trailing slash

---

## Quick Debug: Test Which URL Supabase Uses

1. Open browser DevTools (F12)
2. Go to Network tab
3. Visit: https://worthapply.com/login
4. Click: "Continue with Google"
5. Look for request to: `supabase.co/auth/v1/authorize`
6. Check the `redirect_to` parameter in the URL

**Should see:**
```
redirect_to=https%3A%2F%2Fworthapply.com%2Fauth%2Fcallback
```

**If you see:**
```
redirect_to=http%3A%2F%2Flocalhost%3A3000
```
Then Supabase config is still set to localhost.
