CREATE TABLE IF NOT EXISTS public.rfn_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rfn_number VARCHAR(50) UNIQUE NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_title VARCHAR(255) NOT NULL,
    issued_by VARCHAR(100) NOT NULL,
    officer_name VARCHAR(100) NOT NULL,
    officer_designation VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    gstin VARCHAR(15) NOT NULL,
    taxpayer_name VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    validity_date DATE,
    document_status VARCHAR(50) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.rfn_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for anon" 
    ON public.rfn_documents 
    FOR ALL 
    USING (true);

INSERT INTO public.rfn_documents (rfn_number, document_type, document_title, issued_by, officer_name, officer_designation, state, gstin, taxpayer_name, issue_date, validity_date, document_status, remarks)
VALUES 
('RFN-2023-VALID-01', 'Notice', 'Show Cause Notice for Tax Demand', 'State Tax', 'Rajesh Kumar', 'Assistant Commissioner', 'Maharashtra', '27AAAAA0000A1Z5', 'Reliance Industries Ltd.', '2023-01-15', '2023-12-31', 'Valid', 'Respond within 30 days.'),
('RFN-2023-EXPIR-02', 'Order', 'Order for Cancellation of Registration', 'Central Tax', 'Amit Singh', 'Joint Commissioner', 'Delhi', '07BBBBB0000B1Z6', 'Tata Motors', '2022-05-10', '2022-11-10', 'Expired', 'Validity period has ended.'),
('RFN-2023-CANCE-03', 'Certificate', 'Registration Certificate', 'State Tax', 'Priya Sharma', 'Superintendent', 'Karnataka', '29CCCCC0000C1Z7', 'Infosys Ltd.', '2023-02-20', '2024-02-20', 'Cancelled', 'Cancelled due to taxpayer request.'),
('RFN-2023-REVOK-04', 'Notice', 'Notice for Non-filing of Returns', 'Integrated Tax', 'Vikram Patel', 'Deputy Commissioner', 'Gujarat', '24DDDDD0000D1Z8', 'Adani Enterprises', '2023-03-01', NULL, 'Revoked', 'Notice revoked after compliance.'),
('RFN-2023-REVIE-05', 'Summons', 'Summons to Appear', 'State Tax', 'Neha Gupta', 'Assistant Commissioner', 'Tamil Nadu', '33EEEEE0000E1Z9', 'TVS Motor Company', '2023-04-10', NULL, 'Under Review', 'Pending further investigation.');
