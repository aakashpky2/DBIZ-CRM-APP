-- Create the aadhaar_auth table
CREATE TABLE IF NOT EXISTS aadhaar_auth (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trn TEXT REFERENCES business_details(trn) ON DELETE CASCADE,
    opt_for_auth BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(trn)
);

-- Set Permissions
ALTER TABLE aadhaar_auth ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions aadhaar" ON aadhaar_auth;
CREATE POLICY "Allow all actions aadhaar" ON aadhaar_auth FOR ALL USING (true) WITH CHECK (true);
