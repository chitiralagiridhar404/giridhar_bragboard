-- Create shout_out_reactions table
CREATE TABLE public.shout_out_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shout_out_id UUID NOT NULL REFERENCES public.shout_outs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'clap', 'star')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shout_out_id, user_id, reaction_type)
);

-- Add foreign key to profiles
ALTER TABLE public.shout_out_reactions
ADD CONSTRAINT shout_out_reactions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.shout_out_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view reactions"
ON public.shout_out_reactions
FOR SELECT
USING (true);

CREATE POLICY "Users can add their own reactions"
ON public.shout_out_reactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
ON public.shout_out_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_shout_out_reactions_shout_out_id ON public.shout_out_reactions(shout_out_id);
CREATE INDEX idx_shout_out_reactions_user_id ON public.shout_out_reactions(user_id);