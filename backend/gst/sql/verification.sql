-- Create the verification table
CREATE TABLE IF NOT EXISTS verification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trn TEXT REFERENCES business_details(trn) ON DELETE CASCADE,
    declarer_name TEXT,
    place TEXT,
    designation TEXT,
    verified BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(trn)
);

-- Set Permissions
ALTER TABLE verification ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions verification" ON verification;
CREATE POLICY "Allow all actions verification" ON verification FOR ALL USING (true) WITH CHECK (true);
