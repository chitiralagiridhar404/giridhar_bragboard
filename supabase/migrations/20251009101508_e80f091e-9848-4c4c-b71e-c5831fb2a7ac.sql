-- Create shout_outs table
CREATE TABLE public.shout_outs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create shout_out_recipients table for tagging
CREATE TABLE public.shout_out_recipients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shout_out_id uuid NOT NULL REFERENCES public.shout_outs(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(shout_out_id, recipient_id)
);

-- Enable RLS
ALTER TABLE public.shout_outs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shout_out_recipients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shout_outs
CREATE POLICY "Anyone can view shout-outs"
ON public.shout_outs
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own shout-outs"
ON public.shout_outs
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own shout-outs"
ON public.shout_outs
FOR UPDATE
USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own shout-outs"
ON public.shout_outs
FOR DELETE
USING (auth.uid() = sender_id);

-- RLS Policies for shout_out_recipients
CREATE POLICY "Anyone can view recipients"
ON public.shout_out_recipients
FOR SELECT
USING (true);

CREATE POLICY "Shout-out sender can add recipients"
ON public.shout_out_recipients
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shout_outs
    WHERE id = shout_out_id AND sender_id = auth.uid()
  )
);

CREATE POLICY "Shout-out sender can delete recipients"
ON public.shout_out_recipients
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.shout_outs
    WHERE id = shout_out_id AND sender_id = auth.uid()
  )
);

-- Create trigger for updating shout_outs timestamp
CREATE TRIGGER update_shout_outs_updated_at
BEFORE UPDATE ON public.shout_outs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for shout-out images
INSERT INTO storage.buckets (id, name, public)
VALUES ('shout-outs', 'shout-outs', true);

-- Storage policies for shout-outs bucket
CREATE POLICY "Shout-out images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'shout-outs');

CREATE POLICY "Users can upload shout-out images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'shout-outs' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own shout-out images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'shout-outs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own shout-out images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'shout-outs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);