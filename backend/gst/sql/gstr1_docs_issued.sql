-- Table to store GSTR-1 Documents Issued (Table 13)
CREATE TABLE IF NOT EXISTS public.gstr1_docs_issued (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g., "1. Invoices for outward supply"
    from_serial_no TEXT NOT NULL,
    to_serial_no TEXT NOT NULL,
    total_number INTEGER DEFAULT 0,
    cancelled INTEGER DEFAULT 0,
    net_issued INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Usually multiple entries per category can exist, but often it's one range.
    -- We can just use a unique constraint on trn, category, from_serial_no to allow multiple ranges.
    UNIQUE(trn, category, from_serial_no)
);

-- Index for faster retrieval
CREATE INDEX IF NOT EXISTS idx_gstr1_docs_issued_trn ON public.gstr1_docs_issued(trn);
