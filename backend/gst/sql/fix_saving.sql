-- Run this in Supabase SQL Editor to prepare your database

-- 1. Ensure the JSONB column exists in business_details
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='business_details' AND column_name='form_tabs_data') THEN
        ALTER TABLE business_details ADD COLUMN form_tabs_data JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 2. Create the fallback table if not exists
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trn TEXT NOT NULL,
    tab_name TEXT NOT NULL,
    form_data JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(trn, tab_name)
);

-- 3. Create the promoter_partners table (already provided but ensuring it's here)
CREATE TABLE IF NOT EXISTS promoter_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trn TEXT REFERENCES business_details(trn) ON DELETE CASCADE,
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    father_first_name TEXT,
    father_middle_name TEXT,
    father_last_name TEXT,
    dob DATE,
    mobile TEXT,
    email TEXT,
    gender TEXT,
    std_code TEXT,
    telephone TEXT,
    designation TEXT,
    din TEXT,
    citizen_of_india BOOLEAN DEFAULT true,
    pan TEXT,
    passport TEXT,
    aadhaar TEXT,
    country TEXT DEFAULT 'India',
    pin_code TEXT,
    state TEXT,
    district TEXT,
    city TEXT,
    locality TEXT,
    road TEXT,
    premises TEXT,
    building_no TEXT,
    floor_no TEXT,
    landmark TEXT,
    also_signatory BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(trn)
);

-- 4. Set permissions
ALTER TABLE business_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoter_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all actions" ON business_details FOR ALL USING (true);
CREATE POLICY "Allow all actions" ON form_submissions FOR ALL USING (true);
CREATE POLICY "Allow all actions" ON promoter_partners FOR ALL USING (true);
