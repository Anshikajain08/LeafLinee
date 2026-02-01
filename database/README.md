# Database Setup Instructions

## Quick Setup Guide

### 1. Create Categories Table

Run `setup_categories.sql` in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `setup_categories.sql`
5. Click **Run**

This will:
- ✅ Create the categories table
- ✅ Set up Row Level Security (RLS)
- ✅ Insert 12 default categories with icons
- ✅ Allow public read access
- ✅ Restrict write access to admins only

### 2. Verify Categories

After running the script, verify the data:

```sql
SELECT * FROM categories ORDER BY name;
```

You should see 12 categories:
- 🗑️ Waste Management
- 🚧 Road Issues
- 💡 Street Lighting
- 💧 Water Supply
- 🌊 Drainage
- 🚦 Traffic
- 🌳 Parks & Gardens
- 🏭 Air Pollution
- 🔊 Noise Pollution
- 🏛️ Public Property
- 🧹 Sanitation
- 🐕 Stray Animals

### 3. Test in Application

1. Start your dev server: `npm run dev`
2. Navigate to `/citizen-app/report`
3. Go to Step 3
4. You should see all 12 categories displayed

## Troubleshooting

### Categories not showing?

**Check if table exists:**
```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'categories';
```

**Check RLS policies:**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'categories';
```

**Check data:**
```sql
SELECT COUNT(*) FROM categories;
```

### RLS Permission Issues?

If you get permission denied errors, ensure RLS policy exists:

```sql
-- Allow everyone to read categories
CREATE POLICY "Allow public read access to categories"
    ON public.categories
    FOR SELECT
    TO public
    USING (true);
```

## Adding Custom Categories

To add more categories:

```sql
INSERT INTO categories (name, icon, description) VALUES
    ('Your Category', '🎯', 'Description here');
```

Popular emoji icons:
- 🗑️ Waste
- 🚧 Construction
- 💡 Electricity
- 💧 Water
- 🌊 Drainage
- 🚦 Traffic
- 🌳 Nature
- 🏭 Industry
- 🔊 Sound
- 🏛️ Buildings
- 🧹 Cleaning
- 🐕 Animals
- 🚨 Emergency
- 📢 Announcement
- 🏥 Health
- 🎓 Education
