-- Table to store GSTR-1 Supplies U/s 9(5) (Table 15)
CREATE TABLE IF NOT EXISTS public.gstr1_sup95 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    tab_type TEXT NOT NULL, -- 'R2R', 'R2NR', 'NR2R', 'NR2NR'
    
    -- Generic & B2C/URP Fields
    supplier_gstin TEXT,
    supplier_name TEXT,
    pos TEXT NOT NULL,
    supply_type TEXT,
    taxable_value NUMERIC(15, 2) DEFAULT 0,
    rate TEXT,
    
    -- B2B Specific Fields (R2R, NR2R)
    recipient_gstin TEXT,
    recipient_name TEXT,
    document_number TEXT,
    document_date TEXT,
    total_value NUMERIC(15, 2) DEFAULT 0,
    is_deemed_exports BOOLEAN DEFAULT false,
    is_sez_with_payment BOOLEAN DEFAULT false,
    is_sez_without_payment BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint depends on the type, but let's use a safe combination
    -- For B2B types: trn + tab_type + document_number
    -- For B2C types: trn + tab_type + pos + rate
    -- To keep it simple in a learning app:
    UNIQUE(trn, tab_type, document_number, pos, rate, supplier_gstin, recipient_gstin)
);

-- Index for faster retrieval
CREATE INDEX IF NOT EXISTS idx_gstr1_sup95_trn ON public.gstr1_sup95(trn);
