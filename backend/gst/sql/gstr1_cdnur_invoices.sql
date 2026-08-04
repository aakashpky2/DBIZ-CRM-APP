-- Table to store GSTR-1 Credit/Debit Notes (Unregistered) (Table 9B)
CREATE TABLE IF NOT EXISTS public.gstr1_cdnur_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    unregistered_type TEXT NOT NULL, -- 'B2CL', 'Exports with Payment', 'Exports without Payment'
    note_number TEXT NOT NULL,
    note_date TEXT NOT NULL,
    note_value NUMERIC(15, 2) NOT NULL,
    note_type TEXT NOT NULL, -- 'Credit' or 'Debit'
    pos TEXT NOT NULL,
    supply_type TEXT DEFAULT 'Inter-State',
    is_differential_rate BOOLEAN DEFAULT FALSE,
    source TEXT,
    irn TEXT,
    irn_date TEXT,
    tax_details JSONB DEFAULT '{}', -- Stores rate-wise breakdown (taxableValue, integratedTax, cess)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trn, note_number) -- Prevents duplicate notes for the same learner
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gstr1_cdnur_trn ON public.gstr1_cdnur_invoices(trn);
