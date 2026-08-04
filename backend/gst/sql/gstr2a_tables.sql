-- ============================================================
-- GSTR-2A AUTO-GENERATED TABLES (Dynamic, Live-updated from GSTR-1)
-- ============================================================

-- Table 1: GSTR-2A B2B Invoices
CREATE TABLE IF NOT EXISTS public.gstr2a_b2b_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_trn TEXT,
    receiver_trn TEXT NOT NULL,
    supplier_gstin TEXT NOT NULL,
    receiver_gstin TEXT NOT NULL,
    supplier_name TEXT,
    invoice_number TEXT NOT NULL,
    invoice_date TEXT,
    taxable_value NUMERIC(15, 2) DEFAULT 0.00,
    rate NUMERIC(10, 2) DEFAULT 0.00,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    cgst NUMERIC(15, 2) DEFAULT 0.00,
    sgst NUMERIC(15, 2) DEFAULT 0.00,
    cess NUMERIC(15, 2) DEFAULT 0.00,
    total_tax NUMERIC(15, 2) DEFAULT 0.00,
    place_of_supply TEXT,
    return_period TEXT,
    source_section TEXT DEFAULT 'B2B',
    source_gstr1_id TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    itc_eligible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(receiver_gstin, source_gstr1_id)
);
CREATE INDEX IF NOT EXISTS idx_gstr2a_b2b_receiver_gstin ON public.gstr2a_b2b_invoices(receiver_gstin);
CREATE INDEX IF NOT EXISTS idx_gstr2a_b2b_receiver_trn ON public.gstr2a_b2b_invoices(receiver_trn);

-- Table 2: GSTR-2A Credit/Debit Notes
CREATE TABLE IF NOT EXISTS public.gstr2a_credit_debit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_trn TEXT,
    receiver_trn TEXT NOT NULL,
    supplier_gstin TEXT NOT NULL,
    receiver_gstin TEXT NOT NULL,
    supplier_name TEXT,
    note_number TEXT NOT NULL,
    note_date TEXT,
    note_type TEXT DEFAULT 'Credit',
    taxable_value NUMERIC(15, 2) DEFAULT 0.00,
    rate NUMERIC(10, 2) DEFAULT 0.00,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    cgst NUMERIC(15, 2) DEFAULT 0.00,
    sgst NUMERIC(15, 2) DEFAULT 0.00,
    cess NUMERIC(15, 2) DEFAULT 0.00,
    total_tax NUMERIC(15, 2) DEFAULT 0.00,
    place_of_supply TEXT,
    return_period TEXT,
    source_section TEXT DEFAULT 'CDNR',
    source_gstr1_id TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    itc_eligible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(receiver_gstin, source_gstr1_id)
);
CREATE INDEX IF NOT EXISTS idx_gstr2a_cdnr_receiver_gstin ON public.gstr2a_credit_debit_notes(receiver_gstin);
CREATE INDEX IF NOT EXISTS idx_gstr2a_cdnr_receiver_trn ON public.gstr2a_credit_debit_notes(receiver_trn);

-- Table 3: GSTR-2A Amended Invoices
CREATE TABLE IF NOT EXISTS public.gstr2a_amended_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_trn TEXT,
    receiver_trn TEXT NOT NULL,
    supplier_gstin TEXT NOT NULL,
    receiver_gstin TEXT NOT NULL,
    supplier_name TEXT,
    invoice_number TEXT NOT NULL,
    invoice_date TEXT,
    taxable_value NUMERIC(15, 2) DEFAULT 0.00,
    rate NUMERIC(10, 2) DEFAULT 0.00,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    cgst NUMERIC(15, 2) DEFAULT 0.00,
    sgst NUMERIC(15, 2) DEFAULT 0.00,
    cess NUMERIC(15, 2) DEFAULT 0.00,
    total_tax NUMERIC(15, 2) DEFAULT 0.00,
    place_of_supply TEXT,
    return_period TEXT,
    source_section TEXT DEFAULT 'B2BA',
    source_gstr1_id TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    itc_eligible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(receiver_gstin, source_gstr1_id)
);
CREATE INDEX IF NOT EXISTS idx_gstr2a_amend_receiver_gstin ON public.gstr2a_amended_invoices(receiver_gstin);
CREATE INDEX IF NOT EXISTS idx_gstr2a_amend_receiver_trn ON public.gstr2a_amended_invoices(receiver_trn);

-- Table 4: GSTR-2A ISD Invoices
CREATE TABLE IF NOT EXISTS public.gstr2a_isd_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    isd_gstin TEXT NOT NULL,
    receiver_gstin TEXT NOT NULL,
    receiver_trn TEXT NOT NULL,
    isd_document_number TEXT NOT NULL,
    isd_document_date TEXT,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    cgst NUMERIC(15, 2) DEFAULT 0.00,
    sgst NUMERIC(15, 2) DEFAULT 0.00,
    cess NUMERIC(15, 2) DEFAULT 0.00,
    total_tax NUMERIC(15, 2) DEFAULT 0.00,
    return_period TEXT,
    source_gstr1_id TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(receiver_gstin, source_gstr1_id)
);
CREATE INDEX IF NOT EXISTS idx_gstr2a_isd_receiver_gstin ON public.gstr2a_isd_invoices(receiver_gstin);

-- Table 5: GSTR-2A TDS/TCS Credits
CREATE TABLE IF NOT EXISTS public.gstr2a_tds_tcs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deductor_gstin TEXT NOT NULL,
    receiver_gstin TEXT NOT NULL,
    receiver_trn TEXT NOT NULL,
    credit_type TEXT DEFAULT 'TDS',
    document_number TEXT,
    document_date TEXT,
    gross_value NUMERIC(15, 2) DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) DEFAULT 0.00,
    return_period TEXT,
    source_gstr1_id TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(receiver_gstin, source_gstr1_id)
);
CREATE INDEX IF NOT EXISTS idx_gstr2a_tds_receiver_gstin ON public.gstr2a_tds_tcs(receiver_gstin);

-- ============================================================
-- GSTR-2B TABLES (Monthly Snapshot - Locked after generation)
-- ============================================================

-- Table 1: GSTR-2B B2B Invoices
CREATE TABLE IF NOT EXISTS public.gstr2b_b2b_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID,
    supplier_trn TEXT,
    receiver_trn TEXT NOT NULL,
    supplier_gstin TEXT NOT NULL,
    receiver_gstin TEXT NOT NULL,
    supplier_name TEXT,
    invoice_number TEXT NOT NULL,
    invoice_date TEXT,
    taxable_value NUMERIC(15, 2) DEFAULT 0.00,
    rate NUMERIC(10, 2) DEFAULT 0.00,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    cgst NUMERIC(15, 2) DEFAULT 0.00,
    sgst NUMERIC(15, 2) DEFAULT 0.00,
    cess NUMERIC(15, 2) DEFAULT 0.00,
    total_tax NUMERIC(15, 2) DEFAULT 0.00,
    place_of_supply TEXT,
    return_period TEXT,
    source_section TEXT DEFAULT 'B2B',
    source_gstr1_id TEXT NOT NULL,
    snapshot_month INTEGER,
    snapshot_year INTEGER,
    itc_status TEXT DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gstr2b_b2b_receiver_gstin ON public.gstr2b_b2b_invoices(receiver_gstin);
CREATE INDEX IF NOT EXISTS idx_gstr2b_b2b_receiver_trn ON public.gstr2b_b2b_invoices(receiver_trn);

-- Table 2: GSTR-2B Credit/Debit Notes
CREATE TABLE IF NOT EXISTS public.gstr2b_credit_debit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID,
    supplier_trn TEXT,
    receiver_trn TEXT NOT NULL,
    supplier_gstin TEXT NOT NULL,
    receiver_gstin TEXT NOT NULL,
    supplier_name TEXT,
    note_number TEXT NOT NULL,
    note_date TEXT,
    note_type TEXT DEFAULT 'Credit',
    taxable_value NUMERIC(15, 2) DEFAULT 0.00,
    rate NUMERIC(10, 2) DEFAULT 0.00,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    cgst NUMERIC(15, 2) DEFAULT 0.00,
    sgst NUMERIC(15, 2) DEFAULT 0.00,
    cess NUMERIC(15, 2) DEFAULT 0.00,
    total_tax NUMERIC(15, 2) DEFAULT 0.00,
    place_of_supply TEXT,
    return_period TEXT,
    source_section TEXT DEFAULT 'CDNR',
    source_gstr1_id TEXT NOT NULL,
    snapshot_month INTEGER,
    snapshot_year INTEGER,
    itc_status TEXT DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gstr2b_cdnr_receiver_gstin ON public.gstr2b_credit_debit_notes(receiver_gstin);

-- Table 3: GSTR-2B Amended Invoices
CREATE TABLE IF NOT EXISTS public.gstr2b_amended_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID,
    supplier_trn TEXT,
    receiver_trn TEXT NOT NULL,
    supplier_gstin TEXT NOT NULL,
    receiver_gstin TEXT NOT NULL,
    supplier_name TEXT,
    invoice_number TEXT NOT NULL,
    invoice_date TEXT,
    taxable_value NUMERIC(15, 2) DEFAULT 0.00,
    rate NUMERIC(10, 2) DEFAULT 0.00,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    cgst NUMERIC(15, 2) DEFAULT 0.00,
    sgst NUMERIC(15, 2) DEFAULT 0.00,
    cess NUMERIC(15, 2) DEFAULT 0.00,
    total_tax NUMERIC(15, 2) DEFAULT 0.00,
    place_of_supply TEXT,
    return_period TEXT,
    source_section TEXT,
    source_gstr1_id TEXT NOT NULL,
    snapshot_month INTEGER,
    snapshot_year INTEGER,
    itc_status TEXT DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gstr2b_amend_receiver_gstin ON public.gstr2b_amended_invoices(receiver_gstin);

-- Table 4: GSTR-2B ISD
CREATE TABLE IF NOT EXISTS public.gstr2b_isd_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID,
    isd_gstin TEXT NOT NULL,
    receiver_gstin TEXT NOT NULL,
    receiver_trn TEXT NOT NULL,
    isd_document_number TEXT,
    isd_document_date TEXT,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    cgst NUMERIC(15, 2) DEFAULT 0.00,
    sgst NUMERIC(15, 2) DEFAULT 0.00,
    cess NUMERIC(15, 2) DEFAULT 0.00,
    total_tax NUMERIC(15, 2) DEFAULT 0.00,
    return_period TEXT,
    snapshot_month INTEGER,
    snapshot_year INTEGER,
    itc_status TEXT DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 5: GSTR-2B Snapshots (Metadata / lock table)
CREATE TABLE IF NOT EXISTS public.gstr2b_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receiver_trn TEXT NOT NULL,
    receiver_gstin TEXT NOT NULL,
    snapshot_month INTEGER NOT NULL,
    snapshot_year INTEGER NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    total_taxable_value NUMERIC(15,2) DEFAULT 0.00,
    total_igst NUMERIC(15,2) DEFAULT 0.00,
    total_cgst NUMERIC(15,2) DEFAULT 0.00,
    total_sgst NUMERIC(15,2) DEFAULT 0.00,
    total_cess NUMERIC(15,2) DEFAULT 0.00,
    total_itc_available NUMERIC(15,2) DEFAULT 0.00,
    status TEXT DEFAULT 'GENERATED',
    UNIQUE(receiver_trn, snapshot_month, snapshot_year)
);
CREATE INDEX IF NOT EXISTS idx_gstr2b_snapshots_trn ON public.gstr2b_snapshots(receiver_trn);
