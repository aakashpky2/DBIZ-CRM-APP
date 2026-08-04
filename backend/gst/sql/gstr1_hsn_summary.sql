-- Table to store GSTR-1 HSN-wise summary (Table 12)
CREATE TABLE IF NOT EXISTS public.gstr1_hsn_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    hsn TEXT NOT NULL,
    description TEXT,
    product_name_master TEXT,
    description_per_hsn TEXT,
    uqc TEXT NOT NULL,
    total_quantity NUMERIC(15, 2) DEFAULT 0,
    total_taxable_value NUMERIC(15, 2) DEFAULT 0,
    rate TEXT NOT NULL,
    integrated_tax NUMERIC(15, 2) DEFAULT 0,
    central_tax NUMERIC(15, 2) DEFAULT 0,
    state_tax NUMERIC(15, 2) DEFAULT 0,
    cess NUMERIC(15, 2) DEFAULT 0,
    supply_type TEXT NOT NULL, -- 'B2B' or 'B2C' as per the frontend tabs
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- For HSN summary, uniqueness is usually HSN + Rate + UQC + SupplyType per TRN
    UNIQUE(trn, hsn, rate, uqc, supply_type)
);

-- Index for faster retrieval
CREATE INDEX IF NOT EXISTS idx_gstr1_hsn_summary_trn ON public.gstr1_hsn_summary(trn);
