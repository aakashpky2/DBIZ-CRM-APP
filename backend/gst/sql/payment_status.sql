-- Create payment_status table
CREATE TABLE IF NOT EXISTS public.payment_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gstin VARCHAR(15) NOT NULL,
    cpin VARCHAR(14) NOT NULL,
    challan_number VARCHAR(50),
    payment_amount DECIMAL(15, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_mode VARCHAR(50),
    bank_name VARCHAR(100),
    transaction_reference VARCHAR(100),
    status VARCHAR(50) NOT NULL, -- Paid, Pending, Failed, etc.
    challan_pdf_url TEXT,
    receipt_pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.payment_status ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all access (since it's a self-learning app without strict auth for this demo)
CREATE POLICY "Allow all operations for anon" 
    ON public.payment_status 
    FOR ALL 
    USING (true);

-- Insert dummy data for testing
INSERT INTO public.payment_status (gstin, cpin, challan_number, payment_amount, payment_date, payment_mode, bank_name, transaction_reference, status)
VALUES 
('22AAAAA0000A1Z5', '20230101000001', 'CHL-123456', 1500.00, '2023-01-01 10:00:00', 'Net Banking', 'State Bank of India', 'TXN987654321', 'Paid'),
('22AAAAA0000A1Z5', '20230102000002', 'CHL-123457', 250.50, NULL, 'NEFT/RTGS', 'HDFC Bank', NULL, 'Pending'),
('33BBBBB1111B2Z6', '20230103000003', 'CHL-123458', 5000.00, '2023-01-03 14:30:00', 'Over the Counter', 'ICICI Bank', 'TXN543210987', 'Awaiting Bank Clearance');
