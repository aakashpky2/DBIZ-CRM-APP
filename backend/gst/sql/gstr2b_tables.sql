-- Table 1: GSTR-2B ITC Available
CREATE TABLE IF NOT EXISTS public.gstr2b_itc_available (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    fy TEXT NOT NULL,
    month TEXT NOT NULL,
    supplier_gstin TEXT NOT NULL,
    supplier_name TEXT,
    invoice_no TEXT NOT NULL,
    invoice_date TEXT NOT NULL,
    taxable_value NUMERIC(15, 2) DEFAULT 0.00,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    cgst NUMERIC(15, 2) DEFAULT 0.00,
    sgst NUMERIC(15, 2) DEFAULT 0.00,
    cess NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trn, invoice_no)
);
CREATE INDEX IF NOT EXISTS idx_gstr2b_itc_avail_trn ON public.gstr2b_itc_available(trn);

-- Table 2: GSTR-2B ITC Not Available
CREATE TABLE IF NOT EXISTS public.gstr2b_itc_not_available (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    fy TEXT NOT NULL,
    month TEXT NOT NULL,
    supplier_gstin TEXT NOT NULL,
    supplier_name TEXT,
    reason TEXT NOT NULL, -- Blocked Credit, Personal Consumption, etc.
    taxable_value NUMERIC(15, 2) DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trn, supplier_gstin, taxable_value)
);
CREATE INDEX IF NOT EXISTS idx_gstr2b_itc_not_avail_trn ON public.gstr2b_itc_not_available(trn);

-- Table 3: GSTR-2B Debit Notes
CREATE TABLE IF NOT EXISTS public.gstr2b_debit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    fy TEXT NOT NULL,
    month TEXT NOT NULL,
    supplier_gstin TEXT NOT NULL,
    debit_note_no TEXT NOT NULL,
    note_date TEXT NOT NULL,
    taxable_value NUMERIC(15, 2) DEFAULT 0.00,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    cgst NUMERIC(15, 2) DEFAULT 0.00,
    sgst NUMERIC(15, 2) DEFAULT 0.00,
    cess NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trn, debit_note_no)
);
CREATE INDEX IF NOT EXISTS idx_gstr2b_deb_notes_trn ON public.gstr2b_debit_notes(trn);

-- Table 4: GSTR-2B Credit Notes
CREATE TABLE IF NOT EXISTS public.gstr2b_credit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    fy TEXT NOT NULL,
    month TEXT NOT NULL,
    supplier_gstin TEXT NOT NULL,
    credit_note_no TEXT NOT NULL,
    note_date TEXT NOT NULL,
    taxable_value NUMERIC(15, 2) DEFAULT 0.00,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    cgst NUMERIC(15, 2) DEFAULT 0.00,
    sgst NUMERIC(15, 2) DEFAULT 0.00,
    cess NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trn, credit_note_no)
);
CREATE INDEX IF NOT EXISTS idx_gstr2b_cred_notes_trn ON public.gstr2b_credit_notes(trn);

-- Table 5: GSTR-2B Import of Goods
CREATE TABLE IF NOT EXISTS public.gstr2b_import_goods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    fy TEXT NOT NULL,
    month TEXT NOT NULL,
    port_code TEXT NOT NULL,
    boe_no TEXT NOT NULL,
    boe_date TEXT NOT NULL,
    taxable_value NUMERIC(15, 2) DEFAULT 0.00,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trn, boe_no)
);
CREATE INDEX IF NOT EXISTS idx_gstr2b_imp_goods_trn ON public.gstr2b_import_goods(trn);

-- Table 6: GSTR-2B Import of Services
CREATE TABLE IF NOT EXISTS public.gstr2b_import_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    fy TEXT NOT NULL,
    month TEXT NOT NULL,
    country TEXT NOT NULL,
    supplier_name TEXT,
    invoice_no TEXT NOT NULL,
    invoice_date TEXT NOT NULL,
    taxable_value NUMERIC(15, 2) DEFAULT 0.00,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trn, invoice_no)
);
CREATE INDEX IF NOT EXISTS idx_gstr2b_imp_serv_trn ON public.gstr2b_import_services(trn);
