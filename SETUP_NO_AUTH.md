# Setup Instructions for No-Auth Mode

Since you don't have access to modify the Supabase database directly, follow these steps to get the app working:

## ✅ Step 1: Get Service Role Key

You need the **Service Role Key** to bypass Row Level Security (RLS):

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `xwrrforhndpinxatxqda`
3. Navigate to: **Settings** → **API**
4. Find the **`service_role`** key (it's labeled "secret" - NOT the `anon` key)
5. Copy the entire key (it starts with `eyJ...`)

## ✅ Step 2: Add Key to Environment

Create a file named `.env.local` in your project root (same folder as `package.json`).

**IMPORTANT:**
- File name must be **`.env.local`** (starts with a dot!)
- Must be in the root folder, NOT inside `src/`
- No quotes around the value
- No spaces around the `=` sign

```env
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```

**Important:** Replace the value with your actual service role key!

## ✅ Step 3: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## ✅ Step 4: Verify

When you open the app, check the browser console. You should see:

```
🔑 Using Supabase Service Role Key (RLS bypassed)
✅ Mock auth session created for admin user
```

## 🎉 Done!

The app will now work without authentication and bypass all RLS policies.

---

## ⚠️ Alternative: If You Can't Get Service Role Key

If you absolutely cannot get the service role key, someone with database access needs to run this SQL:

```sql
-- Disable RLS on all tables
ALTER TABLE public.patient_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_vitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregivers DISABLE ROW LEVEL SECURITY;

-- Make storage bucket public (optional, for file uploads)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'prescriptions';
```

You can run this in: **Supabase Dashboard** → **SQL Editor**

---

## 🔐 Security Note

**Service Role Key = Full Admin Access**

- Never commit `.env.local` to git (it's already in `.gitignore`)
- Don't share this key publicly
- It bypasses all security policies
- Only use for development/single-user apps

