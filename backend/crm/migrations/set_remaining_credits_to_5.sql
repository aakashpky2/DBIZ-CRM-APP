-- Set remaining credits to 5 for all students (testing purpose)
UPDATE public.student_credits
SET remaining_credits = 5;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
