-- Create table for scheduling notifications
CREATE TABLE IF NOT EXISTS public.notification_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  notification_time time NOT NULL,        -- time (HH:MM:SS) user wants notification in their timezone
  timezone text NOT NULL,                 -- e.g., 'Asia/Kolkata'
  enabled boolean DEFAULT TRUE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_time_timezone ON public.notification_schedules(notification_time, timezone);

-- Function to return tokens for users whose schedules are due right now (rounded to minute)
CREATE OR REPLACE FUNCTION public.get_tokens_for_due_schedules()
RETURNS TABLE(token text, user_id uuid) AS $$
  SELECT ud.token, ns.user_id
  FROM public.notification_schedules ns
  JOIN public.user_devices ud ON ud.user_id = ns.user_id
  WHERE ns.enabled = true
    -- Compare schedule time with current time in the user's timezone, rounded to minute
    AND date_trunc('minute', now() AT TIME ZONE ns.timezone)::time = ns.notification_time;
$$ LANGUAGE sql STABLE;
