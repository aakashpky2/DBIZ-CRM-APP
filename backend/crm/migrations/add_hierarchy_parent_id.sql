-- Migration: Add parent_id to users for Hierarchy
-- This enables Super Admin -> Channel -> Institute -> Manager -> Student hierarchy

ALTER TABLE public.users
ADD COLUMN parent_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Optionally, create an index on parent_id for faster lookups
CREATE INDEX idx_users_parent_id ON public.users(parent_id);
