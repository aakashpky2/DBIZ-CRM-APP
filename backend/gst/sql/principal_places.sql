-- Create the principal_places table
CREATE TABLE IF NOT EXISTS principal_places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trn TEXT REFERENCES business_details(trn) ON DELETE CASCADE,
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
    latitude TEXT,
    longitude TEXT,
    sector TEXT,
    commissionerate TEXT,
    division TEXT,
    range TEXT,
    email TEXT,
    std_tel TEXT,
    telephone TEXT,
    mobile TEXT,
    std_fax TEXT,
    fax TEXT,
    possession TEXT,
    proof_type TEXT,
    activities TEXT[], -- Array of strings for business activities
    has_additional BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(trn)
);

-- Set Permissions
ALTER TABLE principal_places ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions principal" ON principal_places;
CREATE POLICY "Allow all actions principal" ON principal_places FOR ALL USING (true) WITH CHECK (true);
