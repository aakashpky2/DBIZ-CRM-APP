-- Table to store GSTR-1 Adjustment of Advances (Table 11B(1), 11B(2))
CREATE TABLE IF NOT EXISTS public.gstr1_adj_advances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    pos TEXT NOT NULL, -- Place of Supply
    supply_type TEXT NOT NULL, -- 'Inter-State' or 'Intra-State'
    is_differential_rate BOOLEAN DEFAULT FALSE,
    gross_advance_adjusted NUMERIC(15, 2) DEFAULT 0,
    rate TEXT, -- Tax Rate
    integrated_tax NUMERIC(15, 2) DEFAULT 0,
    central_tax NUMERIC(15, 2) DEFAULT 0,
    state_ut_tax NUMERIC(15, 2) DEFAULT 0,
    cess NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Grouped by TRN, POS, and Rate
    UNIQUE(trn, pos, rate)
);

-- Index for faster retrieval
CREATE INDEX IF NOT EXISTS idx_gstr1_adj_advances_trn ON public.gstr1_adj_advances(trn);
