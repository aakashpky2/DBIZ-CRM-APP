CREATE TABLE IF NOT EXISTS public.holiday_list (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year INT NOT NULL,
    state VARCHAR(100) NOT NULL,
    holiday_date DATE NOT NULL,
    holiday_day VARCHAR(20) NOT NULL,
    description VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.holiday_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for anon" 
    ON public.holiday_list 
    FOR ALL 
    USING (true);

INSERT INTO public.holiday_list (year, state, holiday_date, holiday_day, description, type)
VALUES 
(2026, 'Maharashtra', '2026-01-26', 'Monday', 'Republic Day', 'National'),
(2026, 'Maharashtra', '2026-02-19', 'Thursday', 'Chhatrapati Shivaji Maharaj Jayanti', 'State'),
(2026, 'Maharashtra', '2026-03-20', 'Friday', 'Gudi Padwa', 'State'),
(2026, 'Maharashtra', '2026-05-01', 'Friday', 'Maharashtra Day', 'State'),
(2026, 'Maharashtra', '2026-08-15', 'Saturday', 'Independence Day', 'National'),
(2026, 'Maharashtra', '2026-10-02', 'Friday', 'Mahatma Gandhi Jayanti', 'National'),
(2026, 'Maharashtra', '2026-11-09', 'Monday', 'Diwali (Bali Pratipada)', 'Festival'),
(2026, 'Maharashtra', '2026-12-25', 'Friday', 'Christmas', 'National');
