ALTER TABLE public.learning_videos
ADD COLUMN IF NOT EXISTS category text DEFAULT 'GST';
