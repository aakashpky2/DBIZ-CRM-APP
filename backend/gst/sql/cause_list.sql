CREATE TABLE IF NOT EXISTS public.cause_list (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cause_number VARCHAR(50) NOT NULL,
    case_reference VARCHAR(50) NOT NULL,
    authority_type VARCHAR(100) NOT NULL,
    jurisdiction VARCHAR(100),
    state VARCHAR(100) NOT NULL,
    hearing_date DATE NOT NULL,
    hearing_time VARCHAR(20) NOT NULL,
    taxpayer_name VARCHAR(255) NOT NULL,
    gstin VARCHAR(15) NOT NULL,
    case_subject TEXT,
    case_status VARCHAR(50) NOT NULL,
    venue TEXT NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.cause_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for anon" 
    ON public.cause_list 
    FOR ALL 
    USING (true);

INSERT INTO public.cause_list (cause_number, case_reference, authority_type, jurisdiction, state, hearing_date, hearing_time, taxpayer_name, gstin, case_subject, case_status, venue, remarks)
VALUES 
('C-2023-001', 'REF-001', 'Central Tax', 'Jurisdiction A', 'Maharashtra', CURRENT_DATE, '10:30 AM', 'Reliance Industries Ltd.', '27AAAAA0000A1Z5', 'Appeal against tax demand', 'Scheduled', 'Room 101, Central Tax Office, Mumbai', 'Bring all original documents.'),
('C-2023-002', 'REF-002', 'State Tax', 'Jurisdiction B', 'Delhi', CURRENT_DATE, '02:00 PM', 'Tata Motors', '07BBBBB0000B1Z6', 'Dispute regarding input tax credit', 'Adjourned', 'Room 202, State Tax Office, Delhi', 'Next hearing date to be notified.'),
('C-2023-003', 'REF-003', 'Appellate Authority', 'Jurisdiction C', 'Maharashtra', CURRENT_DATE, '11:00 AM', 'Infosys Ltd.', '29CCCCC0000C1Z7', 'Appeal for refund rejection', 'Scheduled', 'Appellate Tribunal, Mumbai', 'Personal appearance required.');
