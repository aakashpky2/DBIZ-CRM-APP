-- Table to store GSTR-1 Credit/Debit Notes (Registered) (Table 9B)
CREATE TABLE IF NOT EXISTS public.gstr1_cdnr_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    recipient_gstin TEXT NOT NULL,
    recipient_name TEXT,
    name_in_master TEXT,
    note_number TEXT NOT NULL,
    note_date TEXT NOT NULL,
    note_type TEXT NOT NULL, -- 'Credit' or 'Debit'
    note_value NUMERIC(15, 2) NOT NULL,
    pos TEXT NOT NULL,
    supply_type TEXT,
    source TEXT,
    irn TEXT,
    irn_date TEXT,
    is_deemed_export BOOLEAN DEFAULT FALSE,
    is_sez_with_payment BOOLEAN DEFAULT FALSE,
    is_sez_without_payment BOOLEAN DEFAULT FALSE,
    is_reverse_charge BOOLEAN DEFAULT FALSE,
    is_intra_state_igst BOOLEAN DEFAULT FALSE,
    is_differential_rate BOOLEAN DEFAULT FALSE,
    tax_items JSONB DEFAULT '[]', -- Stores rate-wise breakdown if needed later
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trn, note_number) -- Prevents duplicate note numbers per TRN
);

-- Index for faster lookups by TRN
CREATE INDEX IF NOT EXISTS idx_gstr1_cdnr_trn ON public.gstr1_cdnr_invoices(trn);
