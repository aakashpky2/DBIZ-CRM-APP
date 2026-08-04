-- Table 1: GSTR-2B B2B Invoices
CREATE TABLE IF NOT EXISTS public.gstr2b_b2b_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_user_id TEXT,
    receiver_user_id TEXT,
    supplier_gstin TEXT NOT NULL,
    receiver_gstin TEXT NOT NULL,
    supplier_name TEXT,
    invoice_number TEXT NOT NULL,
    invoice_date TEXT NOT NULL,
    taxable_value NUMERIC(15, 2) DEFAULT 0.00,
    rate NUMERIC(15, 2) DEFAULT 0.00,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    cgst NUMERIC(15, 2) DEFAULT 0.00,
    sgst NUMERIC(15, 2) DEFAULT 0.00,
    cess NUMERIC(15, 2) DEFAULT 0.00,
    total_tax NUMERIC(15, 2) DEFAULT 0.00,
    place_of_supply TEXT,
    return_period TEXT,
    source_section TEXT DEFAULT 'B2B',
    source_gstr1_id TEXT,
    itc_status TEXT DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(receiver_gstin, source_gstr1_id)
);
CREATE INDEX IF NOT EXISTS idx_gstr2b_b2b_receiver ON public.gstr2b_b2b_invoices(receiver_gstin);

-- Table 2: GSTR-2B Credit / Debit Notes
CREATE TABLE IF NOT EXISTS public.gstr2b_credit_debit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_user_id TEXT,
    receiver_user_id TEXT,
    supplier_gstin TEXT NOT NULL,
    receiver_gstin TEXT NOT NULL,
    supplier_name TEXT,
    invoice_number TEXT NOT NULL,
    invoice_date TEXT NOT NULL,
    taxable_value NUMERIC(15, 2) DEFAULT 0.00,
    rate NUMERIC(15, 2) DEFAULT 0.00,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    cgst NUMERIC(15, 2) DEFAULT 0.00,
    sgst NUMERIC(15, 2) DEFAULT 0.00,
    cess NUMERIC(15, 2) DEFAULT 0.00,
    total_tax NUMERIC(15, 2) DEFAULT 0.00,
    place_of_supply TEXT,
    return_period TEXT,
    source_section TEXT DEFAULT 'CDNR',
    source_gstr1_id TEXT,
    itc_status TEXT DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(receiver_gstin, source_gstr1_id)
);
CREATE INDEX IF NOT EXISTS idx_gstr2b_cdnr_receiver ON public.gstr2b_credit_debit_notes(receiver_gstin);

-- Table 3: GSTR-2B Amended B2B Invoices
CREATE TABLE IF NOT EXISTS public.gstr2b_amended_b2b_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_user_id TEXT,
    receiver_user_id TEXT,
    supplier_gstin TEXT NOT NULL,
    receiver_gstin TEXT NOT NULL,
    supplier_name TEXT,
    invoice_number TEXT NOT NULL,
    invoice_date TEXT NOT NULL,
    taxable_value NUMERIC(15, 2) DEFAULT 0.00,
    rate NUMERIC(15, 2) DEFAULT 0.00,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    cgst NUMERIC(15, 2) DEFAULT 0.00,
    sgst NUMERIC(15, 2) DEFAULT 0.00,
    cess NUMERIC(15, 2) DEFAULT 0.00,
    total_tax NUMERIC(15, 2) DEFAULT 0.00,
    place_of_supply TEXT,
    return_period TEXT,
    source_section TEXT DEFAULT 'B2BA',
    source_gstr1_id TEXT,
    itc_status TEXT DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(receiver_gstin, source_gstr1_id)
);
CREATE INDEX IF NOT EXISTS idx_gstr2b_b2ba_receiver ON public.gstr2b_amended_b2b_invoices(receiver_gstin);

-- Table 4: GSTR-2B Amended Credit / Debit Notes
CREATE TABLE IF NOT EXISTS public.gstr2b_amended_credit_debit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_user_id TEXT,
    receiver_user_id TEXT,
    supplier_gstin TEXT NOT NULL,
    receiver_gstin TEXT NOT NULL,
    supplier_name TEXT,
    invoice_number TEXT NOT NULL,
    invoice_date TEXT NOT NULL,
    taxable_value NUMERIC(15, 2) DEFAULT 0.00,
    rate NUMERIC(15, 2) DEFAULT 0.00,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    cgst NUMERIC(15, 2) DEFAULT 0.00,
    sgst NUMERIC(15, 2) DEFAULT 0.00,
    cess NUMERIC(15, 2) DEFAULT 0.00,
    total_tax NUMERIC(15, 2) DEFAULT 0.00,
    place_of_supply TEXT,
    return_period TEXT,
    source_section TEXT DEFAULT 'CDNRA',
    source_gstr1_id TEXT,
    itc_status TEXT DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(receiver_gstin, source_gstr1_id)
);
CREATE INDEX IF NOT EXISTS idx_gstr2b_cdnra_receiver ON public.gstr2b_amended_credit_debit_notes(receiver_gstin);
