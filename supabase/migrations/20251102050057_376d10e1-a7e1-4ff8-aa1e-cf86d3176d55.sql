-- Add foreign key for reports.reported_by to profiles
ALTER TABLE public.reports 
ADD CONSTRAINT reports_reported_by_fkey 
FOREIGN KEY (reported_by) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Add foreign key for reports.resolved_by to auth.users
ALTER TABLE public.reports 
ADD CONSTRAINT reports_resolved_by_fkey 
FOREIGN KEY (resolved_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;