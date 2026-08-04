-- Add Foreign Key relationships for video_watch_sessions
ALTER TABLE public.video_watch_sessions 
ADD CONSTRAINT fk_video_watch_sessions_student 
FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.video_watch_sessions 
ADD CONSTRAINT fk_video_watch_sessions_video 
FOREIGN KEY (video_id) REFERENCES public.learning_videos(id) ON DELETE CASCADE;

-- Update schema cache for PostgREST
NOTIFY pgrst, 'reload schema';
