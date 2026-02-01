# Citizen Portal Setup

## No API Keys Required!

This portal uses **OpenStreetMap** which is completely free and doesn't require any API keys or tokens. Just install the dependencies and you're ready to go!

## Database Requirements

### Quick Setup Script

Run this SQL script in your Supabase SQL Editor to create the categories table with default data:

```bash
# Execute the SQL file in Supabase Dashboard → SQL Editor
# Or use the file: database/setup_categories.sql
```

The script will:
- Create the `categories` table
- Set up RLS policies (public read, admin write)
- Insert 12 default categories (Waste, Roads, Lighting, Water, etc.)

### Required RPC Function

Create this function in your Supabase SQL editor:

```sql
CREATE OR REPLACE FUNCTION check_for_duplicate_report(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  report_title TEXT,
  category_id UUID
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.description,
    c.created_at
  FROM complaints c
  WHERE 
    c.category_id = check_for_duplicate_report.category_id
    AND c.status IN ('open', 'in_progress')
    AND (
      -- Within 100 meters radius
      (
        6371000 * acos(
          cos(radians(check_for_duplicate_report.lat)) *
          cos(radians(c.location_lat)) *
          cos(radians(c.location_long) - radians(check_for_duplicate_report.lng)) +
          sin(radians(check_for_duplicate_report.lat)) *
          sin(radians(c.location_lat))
        )
      ) < 100
      OR
      -- Similar title (50% match)
      similarity(c.title, check_for_duplicate_report.report_title) > 0.5
    )
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
```

### Required Extension

Enable the `pg_trgm` extension for text similarity:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### Storage Bucket

Create a storage bucket called `complaint-images`:

1. Go to Supabase Dashboard → Storage
2. Create new bucket: `complaint-images`
3. Set it to **public** for image access
4. Add RLS policy to allow authenticated users to upload

### Tables Check

Ensure these tables exist with the correct columns:

**categories**
- id (uuid, primary key)
- name (text)
- icon (text)
- description (text, optional)
- created_at (timestamptz)

**complaints**
- id (uuid, primary key)
- reporter_id (uuid, references auth.users)
- title (text)
- description (text)
- category_id (uuid, references categories)
- severity (text)
- location_lat (double precision)
- location_long (double precision)
- digipin (text)
- images (text[])
- status (text)
- resolved_at (timestamptz)
- reopen_count (integer, default 0)
- created_at (timestamptz)

**reviews**
- id (uuid, primary key)
- complaint_id (uuid, references complaints)
- user_id (uuid, references auth.users)
- rating (integer)
- comment (text)
- created_at (timestamptz)

**complaint_votes**
- id (uuid, primary key)
- complaint_id (uuid, references complaints)
- user_id (uuid, references auth.users)
- created_at (timestamptz)
- UNIQUE constraint on (complaint_id, user_id)

## Features Implemented

### 1. Dashboard (/citizen-app/dashboard)
- ✅ Full-screen OpenStreetMap with custom Leafline styling
- ✅ Clustered markers for issue density (using Leaflet MarkerCluster)
- ✅ Interactive pins colored by severity
- ✅ Complaint cards on pin click
- ✅ Severity legend
- ✅ Click to zoom clusters
- ✅ No API key required - completely free!

### 2. Report Submission (/citizen-app/report)
- ✅ Multi-step form (3 steps)
- ✅ Step 1: GPS auto-location + manual pin drop with DIGIPIN (using OpenStreetMap)
- ✅ Step 2: Photo upload (max 5), webcam support, voice-to-text
- ✅ Step 3: Category selection, severity picker
- ✅ Duplicate detection via check_for_duplicate_report RPC
- ✅ Upvote existing report prompt if duplicate found

### 3. My Activity (/citizen-app/my-reports)
- ✅ Server Component for initial fetch (optimized FCP)
- ✅ List of user's reports with images
- ✅ Feedback component for resolved tickets
- ✅ 1-10 rating slider
- ✅ Reopen button with reopen_count tracking
- ✅ Status and severity badges

### 4. Main Portal (/citizen-app)
- ✅ Navigation hub with 3 cards
- ✅ Quick stats section
- ✅ Leafline color palette
- ✅ User info and sign-out button

## Map Technology

This portal uses:
- **Leaflet** - Open-source JavaScript library for interactive maps
- **OpenStreetMap** - Free, editable map of the world
- **Leaflet MarkerCluster** - For clustering many markers efficiently

**Benefits:**
- ✅ No API keys needed
- ✅ No usage limits or billing
- ✅ 100% free and open source
- ✅ Community-driven map data

## Development Mode

Set `DEV_BACKDOOR = true` in `/app/citizen-app/page.tsx` to bypass authentication during development.

**Before production:** Set `DEV_BACKDOOR = false`

## Usage

1. Run database migrations (RPC function, extension, storage bucket)
2. Start dev server: `npm run dev`
3. Navigate to `/citizen-app` or use the "Open Citizen Folder" button on login page

## Performance Notes

- Dashboard uses client-side rendering for map interactivity with Leaflet
- My Reports uses server component wrapper for optimal FCP
- Report form uses progressive enhancement (GPS, voice, webcam)
- Images are stored in Supabase Storage with public URLs
- Maps load dynamically to avoid SSR issues with Leaflet
