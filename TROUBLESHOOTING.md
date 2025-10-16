# Troubleshooting: Service Role Key Not Working

## ❌ You're seeing: "Invalid API key"

This means the service role key isn't being loaded. Follow these steps:

---

## ✅ Step 1: Check File Name

The file MUST be named **`.env.local`** (note the dot at the start!)

```
✅ CORRECT: .env.local
❌ WRONG: env.local
❌ WRONG: .env
```

---

## ✅ Step 2: Check File Location

The `.env.local` file must be in the **project root** (same folder as `package.json`):

```
vital-wise-agent/
  ├── .env.local          ← HERE!
  ├── package.json
  ├── src/
  └── ...
```

**NOT here:**
- ❌ `src/.env.local`
- ❌ `supabase/.env.local`

---

## ✅ Step 3: Check File Content

Your `.env.local` should look EXACTLY like this (one line, no quotes):

```env
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cnJmb3JobmRwaW54YXR4cWRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkyNDQyMCwiZXhwIjoyMDYzNTAwNDIwfQ.YOUR_SIGNATURE_HERE
```

**Common mistakes:**
- ❌ Using quotes: `VITE_SUPABASE_SERVICE_ROLE_KEY="eyJ..."`
- ❌ Extra spaces: `VITE_SUPABASE_SERVICE_ROLE_KEY = eyJ...`
- ❌ Line breaks in the key
- ❌ Wrong variable name (must start with `VITE_`)

---

## ✅ Step 4: Get the CORRECT Key

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select project: **xwrrforhndpinxatxqda**
3. Go to: **Settings** → **API**
4. Scroll to **Project API keys**
5. Find the **`service_role`** section (it's labeled "secret" with a 🔒 icon)
6. Copy the ENTIRE key (it's VERY long, around 200+ characters)

**Important:** 
- ❌ NOT the `anon` / `public` key
- ✅ The `service_role` / secret key

---

## ✅ Step 5: Restart Server

After creating/editing `.env.local`, you MUST restart:

```bash
# Press Ctrl+C to stop the server
# Then start again:
npm run dev
```

Vite only reads `.env` files on startup!

---

## ✅ Step 6: Verify in Browser Console

Open the app and check the browser console. You should see:

```
=== Environment Debug ===
VITE_SUPABASE_SERVICE_ROLE_KEY exists: true
Key length: 204
Key starts with: eyJhbGciOiJIUzI1NiI...
Key format looks valid: true
========================
🔑 Using Supabase Service Role Key (RLS bypassed)
```

If you see:
```
❌ Service role key NOT found in environment
```

Then the key isn't being loaded. Double-check steps 1-5.

---

## 🆘 Still Not Working?

### Option A: Hardcode the Key (Temporary Testing Only)

Edit `src/integrations/supabase/client.ts` and replace line 9:

```typescript
// TEMPORARY: Replace this line
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// With this (paste your actual key):
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_KEY_HERE";
```

⚠️ **IMPORTANT**: This is only for testing! Don't commit this file to git!

### Option B: Share Your .env.local File Content

Show me what's in your `.env.local` file (you can redact part of the key for privacy).

### Option C: Ask Database Admin to Disable RLS

If you can't get the service role key, someone with database access needs to run the SQL from `supabase/migrations/20251016000001_disable_rls_for_admin.sql`.

