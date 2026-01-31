# Gatekeeper Setup Guide

## ✅ What's Already Done

- ✅ Database schema with `profiles` table and RLS policies
- ✅ Role-based authentication system implemented
- ✅ Login page with Google OAuth
- ✅ Admin dashboard (`/authority-dashboard`)
- ✅ Citizen app (`/citizen-app`)
- ✅ Auto-redirect based on user role

---

## 🚀 Next Steps

### 1. Configure Google OAuth in Supabase

Go to [Supabase Dashboard](https://app.supabase.com) → **Authentication** → **Providers** → **Google**

**Enable Google provider and add:**
- Client ID (from Google Cloud Console)
- Client Secret
- Authorized redirect URL: `http://localhost:3000` (for dev)

### 2. Update Environment Variables

Edit [.env](.env) with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Ensure Auto-Profile Creation

Check if you have a trigger to create profiles on signup. Run this SQL to create/update it:

```sql
-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'citizen')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Important:** If you already have users without profiles, run this to backfill:

```sql
-- Backfill profiles for existing users
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'citizen'
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id
);
```

### 4. Test the Flow

1. Go to [Supabase Dashboard](https://app.supabase.com) → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Add authorized redirect URLs:
   - `http://localhost:3000` (for development)
   - Your production URL

---

## 🔐 Environment Variables

Make sure your [.env](.env) file has:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🚀 How It Works

### Authentication Flow

1. **User visits** `/` → Gatekeeper checks auth status
2. **Not logged in** → Redirects to `/login`
3. **Logs in with Google** → Creates session + profile (role: 'citizen')
4. **Gatekeeper queries** `profiles` table for role
5. **Redirects based on role**:
   - `admin` → `/authority-dashboard`
   - `citizen` → `/citizen-app`

### Key Components

#### `useRole` Hook
- Fetches user session
- Queries `profiles` table for role
- Listens for auth state changes
- Returns: `{ role, loading, error, user }`

#### `Gatekeeper` Component
- Wraps protected routes
- Shows loading state while checking auth
- Redirects based on role
- Handles unauthenticated users

---

## 🧪 Testing

### Test Admin Access

```sql
-- Make a user admin
UPDATE profiles
SET role = 'admin'
WHERE id = 'user-uuid-here';
```

### Test Citizen Access

```sql
-- Make a user citizen
UPDATE profiles
SET role = 'citizen'
WHERE id = 'user-uuid-here';
```

---

## 🎨 Customization

### Add More Roles

1. Update [types/database.ts](types/database.ts):
```typescript
export type UserRole = 'admin' | 'citizen' | 'moderator'
```

2. Update database constraint:
```sql
ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('admin', 'citizen', 'moderator'));
```

3. Add route in [components/Gatekeeper.tsx](components/Gatekeeper.tsx):
```typescript
if (role === 'admin') {
  router.push('/authority-dashboard')
} else if (role === 'moderator') {
  router.push('/moderator-dashboard')
} else {
  router.push('/citizen-app')
}
```

---

## 📝 Usage Examples

### Protect a Route

```typescript
import { Gatekeeper } from '@/components/Gatekeeper'

export default function ProtectedPage() {
  return (
    <Gatekeeper>
      <YourContent />
    </Gatekeeper>
  )
}
```

### Check Role in Component

```typescript
import { useRole } from '@/hooks/useRole'

export default function MyComponent() {
  const { role, loading, user } = useRole()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please login</div>

  return (
    <div>
      {role === 'admin' && <AdminFeature />}
      {role === 'citizen' && <CitizenFeature />}
    </div>
  )
}
```

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check [.env](.env) file exists
- Verify variable names start with `NEXT_PUBLIC_`
- Restart dev server after adding variables

### Redirect loop
- Clear browser cookies
- Check database has profiles table
- Verify user has a role assigned

### Google OAuth not working
- Check redirect URL is configured in Supabase
- Verify Google OAuth credentials are correct
- Ensure Google OAuth is enabled in Supabase

---

## 🎯 Next Steps

1. ✅ Complete database setup (SQL above)
2. ✅ Configure Google OAuth in Supabase
3. ✅ Update .env with your credentials
4. 🚀 Run `npm run dev` and test the flow
5. 🎨 Customize dashboards with your features

---

## 📚 Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Hooks](https://react.dev/reference/react)

---

**Built with**: Next.js 16, React 19, Supabase, TypeScript, Tailwind CSS
