-- Table to store GSTR-1 B2C(Others) Invoices (Table 7)
CREATE TABLE IF NOT EXISTS public.gstr1_b2cs_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    pos TEXT NOT NULL,
    taxable_value NUMERIC(15, 2) NOT NULL,
    supply_type TEXT DEFAULT 'Intra-State',
    is_differential_rate BOOLEAN DEFAULT FALSE,
    rate TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by TRN
CREATE INDEX IF NOT EXISTS idx_gstr1_b2cs_trn ON public.gstr1_b2cs_invoices(trn);
