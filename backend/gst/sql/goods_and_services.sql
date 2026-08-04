-- Create the goods_and_services table
CREATE TABLE IF NOT EXISTS goods_and_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trn TEXT REFERENCES business_details(trn) ON DELETE CASCADE,
    goods TEXT[],       -- Array to hold selected goods (HSN codes/names)
    services TEXT[],    -- Array to hold selected services (SAC codes/names)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(trn)
);

-- Set Permissions
ALTER TABLE goods_and_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions goods_services" ON goods_and_services;
CREATE POLICY "Allow all actions goods_services" ON goods_and_services FOR ALL USING (true) WITH CHECK (true);
