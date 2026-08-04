-- Table to store GSTR-1 B2B Invoices (4A, 4B, 6B, 6C)
CREATE TABLE IF NOT EXISTS public.gstr1_b2b_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    recipient_gstin TEXT NOT NULL,
    recipient_name TEXT,
    invoice_no TEXT NOT NULL,
    invoice_date TEXT NOT NULL,
    total_invoice_value NUMERIC(15, 2),
    pos TEXT NOT NULL,
    supply_type TEXT,
    is_deemed_export BOOLEAN DEFAULT FALSE,
    is_sez_with_payment BOOLEAN DEFAULT FALSE,
    is_sez_without_payment BOOLEAN DEFAULT FALSE,
    is_reverse_charge BOOLEAN DEFAULT FALSE,
    is_intra_state_igst BOOLEAN DEFAULT FALSE,
    is_differential_percentage BOOLEAN DEFAULT FALSE,
    tax_items JSONB DEFAULT '[]', -- To store rate-wise breakdown (Rate, Taxable Value, Integrated Tax, etc.)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trn, invoice_no)
);

-- Index for faster lookups by TRN
CREATE INDEX IF NOT EXISTS idx_gstr1_b2b_trn ON public.gstr1_b2b_invoices(trn);

-- Enable RLS (Row Level Security) if needed, otherwise assume public for now as per project pattern
-- ALTER TABLE public.gstr1_b2b_invoices ENABLE ROW LEVEL SECURITY;
