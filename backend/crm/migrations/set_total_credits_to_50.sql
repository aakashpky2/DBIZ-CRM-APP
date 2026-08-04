-- Adjust existing student credit records to a total of 50 credits
-- This will set total_credits = 50 and recompute remaining_credits based on used_credits
-- If used_credits exceeds 50, remaining_credits will be set to 0 (cannot be negative)
UPDATE public.student_credits
SET
  total_credits = 50,
  remaining_credits = GREATEST(0, 50 - used_credits)
WHERE total_credits <> 50;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
