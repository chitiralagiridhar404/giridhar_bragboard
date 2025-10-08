-- First, update existing profiles to have valid roles
UPDATE public.profiles 
SET role = 'employee' 
WHERE role NOT IN ('manager', 'hr', 'team_lead', 'employee', 'learner', 'fresher');

-- Add avatar_url and bio columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Now add the check constraints
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('manager', 'hr', 'team_lead', 'employee', 'learner', 'fresher'));

-- Update departments
UPDATE public.profiles 
SET department = 'general' 
WHERE department NOT IN ('engineering', 'human_resources', 'marketing', 'sales', 'operations', 'general');

ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_department_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_department_check 
CHECK (department IN ('engineering', 'human_resources', 'marketing', 'sales', 'operations', 'general'));

-- Create articles table
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view articles" 
ON public.articles 
FOR SELECT 
USING (true);

CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample articles
INSERT INTO public.articles (title, description, category) VALUES
('Welcome to BragBoard', 'Share your achievements and celebrate your wins with the team', 'welcome'),
('Team Achievements', 'Check out the latest accomplishments from your colleagues', 'team'),
('Recognition Board', 'Give and receive recognition for outstanding work', 'recognition');