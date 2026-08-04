CREATE TABLE public.learning_videos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text,
  video_id text NOT NULL,
  youtube_url text NOT NULL,
  thumbnail text NOT NULL,
  category text DEFAULT 'gst',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_learning_videos_video_id ON public.learning_videos(video_id);
CREATE INDEX idx_learning_videos_title ON public.learning_videos(title);
