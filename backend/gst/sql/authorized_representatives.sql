-- Create the authorized_representatives table
CREATE TABLE IF NOT EXISTS authorized_representatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trn TEXT REFERENCES business_details(trn) ON DELETE CASCADE,
    has_representative BOOLEAN DEFAULT false,
    representative_type TEXT,
    enrolment_id TEXT,
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    designation TEXT,
    mobile TEXT,
    email TEXT,
    pan TEXT,
    aadhaar TEXT,
    std_tel TEXT,
    telephone TEXT,
    std_fax TEXT,
    fax TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(trn)
);

-- Set Permissions
ALTER TABLE authorized_representatives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions rep" ON authorized_representatives;
CREATE POLICY "Allow all actions rep" ON authorized_representatives FOR ALL USING (true) WITH CHECK (true);
