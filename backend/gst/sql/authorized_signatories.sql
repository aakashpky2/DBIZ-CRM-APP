-- Create the authorized_signatories table
CREATE TABLE IF NOT EXISTS authorized_signatories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trn TEXT REFERENCES business_details(trn) ON DELETE CASCADE,
    primary_signatory BOOLEAN DEFAULT false,
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
    proof_type TEXT,
    photo_url TEXT,
    proof_file_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(trn)
);

-- Safely set permissions
ALTER TABLE authorized_signatories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions signatory" ON authorized_signatories;
CREATE POLICY "Allow all actions signatory" ON authorized_signatories FOR ALL USING (true) WITH CHECK (true);
