-- Table to store GSTR-1 Nil Rated, Exempted and Non-GST Supplies (Table 8)
CREATE TABLE IF NOT EXISTS public.gstr1_nil_rated_supplies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trn TEXT NOT NULL,
    description TEXT NOT NULL, -- e.g., 'Intra-state supplies to registered person'
    nil_rated_value NUMERIC(15, 2) DEFAULT 0,
    exempted_value NUMERIC(15, 2) DEFAULT 0,
    non_gst_value NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trn, description) -- Prevents multiple entries for the same category per TRN
);

-- Index for faster lookups by TRN
CREATE INDEX IF NOT EXISTS idx_gstr1_nil_rated_trn ON public.gstr1_nil_rated_supplies(trn);
