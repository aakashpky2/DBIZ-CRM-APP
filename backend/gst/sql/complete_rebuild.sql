-- CLEAN REBUILD OF ALL NECESSARY TABLES
-- Run this in Supabase SQL Editor

-- 1. Create Base Table: business_details
CREATE TABLE IF NOT EXISTS business_details (
    trn TEXT PRIMARY KEY,
    legal_name TEXT,
    pan TEXT,
    state_name TEXT,
    trade_name TEXT,
    additional_trade TEXT,
    constitution TEXT,
    district TEXT,
    casual_taxable BOOLEAN DEFAULT false,
    composition BOOLEAN DEFAULT false,
    rule_14a TEXT,
    reason TEXT,
    commencement_date TEXT,
    liability_date TEXT,
    form_tabs_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Structured Table: promoter_partners
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

-- 3. Create Fallback Table: form_submissions
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trn TEXT NOT NULL,
    tab_name TEXT NOT NULL,
    form_data JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(trn, tab_name)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE business_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoter_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- 5. Create "Allow All" Policies (Safety for Learning Environment)
DROP POLICY IF EXISTS "Allow all actions business" ON business_details;
DROP POLICY IF EXISTS "Allow all actions promoter" ON promoter_partners;
DROP POLICY IF EXISTS "Allow all actions fallback" ON form_submissions;

CREATE POLICY "Allow all actions business" ON business_details FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions promoter" ON promoter_partners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions fallback" ON form_submissions FOR ALL USING (true) WITH CHECK (true);
