-- Add new columns to credit_transactions
ALTER TABLE public.credit_transactions 
ADD COLUMN IF NOT EXISTS video_id UUID REFERENCES public.learning_videos(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS watch_seconds INTEGER;

-- Update schema cache
NOTIFY pgrst, 'reload schema';
