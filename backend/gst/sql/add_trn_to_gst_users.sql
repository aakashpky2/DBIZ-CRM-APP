ALTER TABLE public.gst_users
ADD COLUMN IF NOT EXISTS trn text;

CREATE UNIQUE INDEX IF NOT EXISTS
gst_users_trn_unique
ON public.gst_users (trn)
WHERE trn IS NOT NULL;
