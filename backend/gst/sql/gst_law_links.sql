CREATE TABLE IF NOT EXISTS public.gst_law_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    category VARCHAR(50) DEFAULT 'State',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.gst_law_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for anon" 
    ON public.gst_law_links 
    FOR ALL 
    USING (true);

-- Insert initial mock data based on the prompt
INSERT INTO public.gst_law_links (name, url, display_order) VALUES
('CBIC', 'https://www.cbic.gov.in/', 1),
('Arunachal Pradesh', 'https://tax.arunachal.gov.in/', 2),
('Chandigarh', 'https://excise.chd.gov.in/', 3),
('Daman and Diu', 'https://daman.nic.in/vat.aspx', 4),
('Gujarat', 'https://commercialtax.gujarat.gov.in/', 5),
('Jammu and Kashmir', 'https://jkexcise.nic.in/', 6),
('Kerala', 'https://keralataxes.gov.in/', 7),
('Maharashtra', 'https://mahagst.gov.in/', 8),
('Mizoram', 'https://zotax.nic.in/', 9),
('Puducherry', 'https://gst.py.gov.in/', 10),
('Sikkim', 'https://sikkimtax.gov.in/', 11),
('Tripura', 'https://taxes.tripura.gov.in/', 12),
('West Bengal', 'https://wbcomtax.gov.in/', 13),
('Andaman and Nicobar Islands', 'https://andaman.gov.in/', 14),
('Assam', 'https://tax.assam.gov.in/', 15),
('Chhattisgarh', 'https://commercialtax.cgstate.gov.in/', 16),
('Delhi', 'https://dvat.gov.in/', 17),
('Haryana', 'https://haryanatax.gov.in/', 18),
('Jharkhand', 'https://jharkhandcomtax.gov.in/', 19),
('Lakshadweep', 'https://lakshadweep.gov.in/', 20),
('Manipur', 'https://manipur.gov.in/', 21),
('Nagaland', 'https://nagalandtax.nic.in/', 22),
('Punjab', 'https://pextax.com/', 23),
('Tamil Nadu', 'https://ctd.tn.gov.in/', 24),
('Uttarakhand', 'https://comtax.uk.gov.in/', 25),
('Andhra Pradesh', 'https://apct.gov.in/', 26),
('Bihar', 'https://biharcommercialtax.gov.in/', 27),
('Dadra and Nagar Haveli', 'https://dnh.gov.in/', 28),
('Goa', 'https://goact.gov.in/', 29),
('Himachal Pradesh', 'https://hptax.gov.in/', 30),
('Karnataka', 'https://gst.kar.nic.in/', 31),
('Madhya Pradesh', 'https://mptax.mp.gov.in/', 32),
('Meghalaya', 'https://megexcise.gov.in/', 33),
('Odisha', 'https://odishatax.gov.in/', 34),
('Rajasthan', 'https://rajtax.gov.in/', 35),
('Telangana', 'https://tgct.gov.in/', 36),
('Uttar Pradesh', 'https://upgst.up.nic.in/', 37);
