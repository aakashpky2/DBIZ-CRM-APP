CREATE TABLE IF NOT EXISTS public.hsn_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hsn_code VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    chapter VARCHAR(100),
    gst_rate DECIMAL(5, 2),
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.hsn_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for anon" 
    ON public.hsn_codes 
    FOR ALL 
    USING (true);

INSERT INTO public.hsn_codes (hsn_code, description, chapter, gst_rate, category)
VALUES 
('1006', 'Rice', 'Chapter 10', 5.00, 'Goods'),
('100630', 'Semi-milled or wholly milled rice, whether or not polished or glazed', 'Chapter 10', 5.00, 'Goods'),
('10063010', 'Rice, parboiled', 'Chapter 10', 5.00, 'Goods'),
('8471', 'Automatic data processing machines and units thereof', 'Chapter 84', 18.00, 'Goods'),
('9983', 'Other professional, technical and business services', 'Chapter 99', 18.00, 'Services');
