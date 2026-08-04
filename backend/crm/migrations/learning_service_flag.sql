-- Add learning_service_enabled flag to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS learning_service_enabled BOOLEAN DEFAULT true;

-- Update schema cache
NOTIFY pgrst, 'reload schema';
