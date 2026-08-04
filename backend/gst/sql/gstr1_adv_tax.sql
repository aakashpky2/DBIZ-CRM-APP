-- Table to store GSTR-1 Tax Liability (Advances Received) (Table 11A(1), 11A(2))
CREATE TABLE IF NOT EXISTS public.gstr1_adv_tax (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    pos TEXT NOT NULL, -- Place of Supply
    supply_type TEXT NOT NULL, -- 'Inter-State' or 'Intra-State'
    is_differential_rate BOOLEAN DEFAULT FALSE,
    gross_advance_received NUMERIC(15, 2) DEFAULT 0,
    rate TEXT, -- Tax Rate
    integrated_tax NUMERIC(15, 2) DEFAULT 0,
    central_tax NUMERIC(15, 2) DEFAULT 0,
    state_ut_tax NUMERIC(15, 2) DEFAULT 0,
    cess NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- For advances, we usually group by POS and Rate per period (represented by TRN here)
    UNIQUE(trn, pos, rate) 
);

-- Index for faster retrieval
CREATE INDEX IF NOT EXISTS idx_gstr1_adv_tax_trn ON public.gstr1_adv_tax(trn);
