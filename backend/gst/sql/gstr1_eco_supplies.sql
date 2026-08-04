-- Table to store GSTR-1 Supplies made through ECO (Table 14)
CREATE TABLE IF NOT EXISTS public.gstr1_eco_supplies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    eco_type TEXT NOT NULL, -- 'TCS' or 'PAY' (TCS u/s 52 or PAY u/s 9(5))
    eco_gstin TEXT NOT NULL,
    trade_name TEXT,
    net_value NUMERIC(15, 2) DEFAULT 0,
    integrated_tax NUMERIC(15, 2) DEFAULT 0,
    central_tax NUMERIC(15, 2) DEFAULT 0,
    state_tax NUMERIC(15, 2) DEFAULT 0,
    cess NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Grouped by TRN, Type, and ECO GSTIN

);

-- Index for faster retrieval
CREATE INDEX IF NOT EXISTS idx_gstr1_eco_supplies_trn ON public.gstr1_eco_supplies(trn);
