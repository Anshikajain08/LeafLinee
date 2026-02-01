-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add icon column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'icon'
    ) THEN
        ALTER TABLE public.categories ADD COLUMN icon TEXT;
    END IF;
END $$;

-- Add description column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE public.categories ADD COLUMN description TEXT;
    END IF;
END $$;

-- Add unique constraint on name if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'categories_name_key'
    ) THEN
        ALTER TABLE public.categories ADD CONSTRAINT categories_name_key UNIQUE (name);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read categories
CREATE POLICY "Allow public read access to categories"
    ON public.categories
    FOR SELECT
    TO public
    USING (true);

-- Create policy to allow only admins to insert/update categories
CREATE POLICY "Allow admin insert access to categories"
    ON public.categories
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Allow admin update access to categories"
    ON public.categories
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Insert default categories (update existing or insert new)
INSERT INTO public.categories (name, icon, description) VALUES
    ('Waste Management', '🗑️', 'Garbage collection, illegal dumping, overflowing bins'),
    ('Road Issues', '🚧', 'Potholes, damaged roads, road maintenance'),
    ('Street Lighting', '💡', 'Broken lights, dark areas, electrical issues'),
    ('Water Supply', '💧', 'Water leakage, shortage, quality issues'),
    ('Drainage', '🌊', 'Blocked drains, waterlogging, sewage issues'),
    ('Traffic', '🚦', 'Signal problems, congestion, parking issues'),
    ('Parks & Gardens', '🌳', 'Park maintenance, encroachment, cleanliness'),
    ('Air Pollution', '🏭', 'Smoke, dust, industrial pollution'),
    ('Noise Pollution', '🔊', 'Loud music, construction noise, traffic noise'),
    ('Public Property', '🏛️', 'Damaged benches, vandalism, maintenance'),
    ('Sanitation', '🧹', 'Public toilet issues, cleanliness, hygiene'),
    ('Stray Animals', '🐕', 'Stray dogs, cattle on roads, animal welfare')
ON CONFLICT (name) 
DO UPDATE SET 
    icon = EXCLUDED.icon,
    description = EXCLUDED.description;

-- Verify the data
SELECT * FROM public.categories ORDER BY name;
