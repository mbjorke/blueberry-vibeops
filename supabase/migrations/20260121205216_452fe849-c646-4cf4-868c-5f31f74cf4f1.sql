-- Create activity_events table for real-time updates
CREATE TABLE public.activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('deployment', 'status_change', 'security_event', 'compliance')),
  title text NOT NULL,
  description text NOT NULL,
  severity text CHECK (severity IN ('info', 'success', 'warning', 'critical')),
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for project lookups
CREATE INDEX idx_activity_events_project ON public.activity_events(project_id);
CREATE INDEX idx_activity_events_created ON public.activity_events(created_at DESC);

-- Enable RLS
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

-- Users can view events for their assigned projects
CREATE POLICY "Users can view activity for assigned projects"
ON public.activity_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_projects
    WHERE client_projects.project_id = activity_events.project_id
    AND client_projects.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Only admins can insert activity events
CREATE POLICY "Admins can insert activity events"
ON public.activity_events
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_events;