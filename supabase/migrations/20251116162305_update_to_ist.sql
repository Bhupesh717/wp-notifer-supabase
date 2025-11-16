/*
  # Update Schedule Time to Indian Standard Time (IST)

  ## Overview
  Updates the notification schedule time to 9:00 AM Indian Standard Time (IST - UTC+5:30)

  ## Changes
  - Changes schedule_time from 09:00:00 to 09:00:00 IST
  - Updates last_updated timestamp
*/

UPDATE notification_settings 
SET 
  schedule_time = '09:00:00'::time,
  last_updated = now()
WHERE id = '00000000-0000-0000-0000-000000000001';