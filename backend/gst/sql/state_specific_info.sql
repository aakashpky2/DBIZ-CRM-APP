-- Create the state_specific_info table
CREATE TABLE IF NOT EXISTS state_specific_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trn TEXT REFERENCES business_details(trn) ON DELETE CASCADE,
    pt_ec_no TEXT,
    pt_rc_no TEXT,
    excise_license_no TEXT,
    excise_license_name TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(trn)
);

-- Set Permissions
ALTER TABLE state_specific_info ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions state_info" ON state_specific_info;
CREATE POLICY "Allow all actions state_info" ON state_specific_info FOR ALL USING (true) WITH CHECK (true);
