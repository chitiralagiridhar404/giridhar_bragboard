-- Drop existing foreign keys that point to the wrong table
ALTER TABLE public.shout_outs
DROP CONSTRAINT IF EXISTS shout_outs_sender_id_fkey;

ALTER TABLE public.shout_out_recipients
DROP CONSTRAINT IF EXISTS shout_out_recipients_recipient_id_fkey;

-- Recreate foreign keys pointing to profiles.user_id
ALTER TABLE public.shout_outs
ADD CONSTRAINT shout_outs_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.shout_out_recipients
ADD CONSTRAINT shout_out_recipients_recipient_id_fkey
FOREIGN KEY (recipient_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;