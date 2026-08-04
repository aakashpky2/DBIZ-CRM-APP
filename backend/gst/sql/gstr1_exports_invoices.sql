-- Table to store GSTR-1 Exports Invoices (Table 6A)
CREATE TABLE IF NOT EXISTS public.gstr1_exports_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    invoice_no TEXT NOT NULL,
    invoice_date TEXT NOT NULL,
    port_code TEXT,
    shipping_bill_no TEXT,
    shipping_bill_date TEXT,
    total_invoice_value NUMERIC(15, 2),
    supply_type TEXT DEFAULT 'Inter-State',
    gst_payment TEXT NOT NULL, -- 'With Payment of Tax' or 'Without Payment of Tax'
    item_details JSONB DEFAULT '[]', -- Stores rate-wise breakdown
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trn, invoice_no) -- Prevents duplicate invoices
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gstr1_exports_trn ON public.gstr1_exports_invoices(trn);
