-- Table to store GSTR-1 B2C(Large) Invoices (Table 5)
CREATE TABLE IF NOT EXISTS public.gstr1_b2cl_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    pos TEXT NOT NULL,
    invoice_no TEXT NOT NULL,
    invoice_date TEXT NOT NULL,
    supply_type TEXT DEFAULT 'Inter-State',
    total_invoice_value NUMERIC(15, 2),
    is_differential BOOLEAN DEFAULT FALSE,
    item_details JSONB DEFAULT '[]', -- Stores rate-wise breakdown (Rate, Taxable Value, Integrated Tax, Cess)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trn, invoice_no) -- Prevents duplicate invoices for the same learner
);

-- Index for faster lookups by TRN
CREATE INDEX IF NOT EXISTS idx_gstr1_b2cl_trn ON public.gstr1_b2cl_invoices(trn);
