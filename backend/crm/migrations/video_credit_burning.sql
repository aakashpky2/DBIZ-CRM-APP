-- =======================================================
-- VIDEO CREDIT BURNING SYSTEM SETUP SQL
-- Run this in your Supabase SQL Editor
-- =======================================================

-- 1. Create 'video_watch_sessions' table
CREATE TABLE IF NOT EXISTS public.video_watch_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  video_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  watch_seconds INTEGER DEFAULT 0 CHECK (watch_seconds >= 0),
  credits_burned INTEGER DEFAULT 0 CHECK (credits_burned >= 0),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Modify 'credit_transactions' to support VIDEO_WATCH
-- Note: Postgres doesn't allow easy dropping of check constraints without knowing their name,
-- but typically we can try to add the new value if it's an ENUM or modify the CHECK constraint.
-- Because the previous setup used a CHECK constraint:
-- CHECK (transaction_type IN ('credit_added', 'credit_used', 'credit_request_approved', 'credit_request_rejected'))
-- We need to drop that constraint and add a new one.

DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find the constraint name for transaction_type
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.credit_transactions'::regclass
      AND pg_get_constraintdef(oid) LIKE '%transaction_type%';
      
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.credit_transactions DROP CONSTRAINT ' || constraint_name;
    END IF;
    
    -- Add the new constraint
    ALTER TABLE public.credit_transactions 
    ADD CONSTRAINT credit_transactions_transaction_type_check 
    CHECK (transaction_type IN ('credit_added', 'credit_used', 'credit_request_approved', 'credit_request_rejected', 'VIDEO_WATCH'));
END $$;


-- 3. Enable RLS
ALTER TABLE public.video_watch_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Allow public select on video_watch_sessions" ON public.video_watch_sessions FOR SELECT USING (true);
CREATE POLICY "Allow service_role full control on video_watch_sessions" ON public.video_watch_sessions TO service_role USING (true) WITH CHECK (true);
