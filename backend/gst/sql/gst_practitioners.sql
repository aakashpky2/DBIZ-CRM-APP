CREATE TABLE IF NOT EXISTS public.gst_practitioners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    gstp_id VARCHAR(50) UNIQUE NOT NULL,
    enrollment_number VARCHAR(50) UNIQUE NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.gst_practitioners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for anon" 
    ON public.gst_practitioners 
    FOR ALL 
    USING (true);

INSERT INTO public.gst_practitioners (name, gstp_id, enrollment_number, mobile, email, state, district, status)
VALUES 
('Rajesh Kumar', 'GSTP27MUM001', 'ENR2023MH1234', '9876543210', 'rajesh.kumar@email.com', 'Maharashtra', 'Mumbai', 'Active'),
('Priya Sharma', 'GSTP07DEL002', 'ENR2023DL5678', '9988776655', 'priya.sharma@email.com', 'Delhi', 'New Delhi', 'Active'),
('Amit Patel', 'GSTP24AHD003', 'ENR2023GJ9012', '9123456789', 'amit.patel@email.com', 'Gujarat', 'Ahmedabad', 'Inactive');
