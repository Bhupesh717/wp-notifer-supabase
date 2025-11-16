/*
  # WP Notifier Pro Database Schema

  ## Overview
  Creates the complete database structure for WordPress notification management system
  with OneSignal integration.

  ## New Tables
  
  ### `notification_settings`
  Configuration for the notification service
  - `id` (uuid, primary key) - Unique identifier
  - `daily_enabled` (boolean) - Whether daily notifications are active
  - `schedule_time` (time) - Time of day for scheduled notifications (24h format)
  - `wordpress_url` (text) - WordPress blog URL
  - `onesignal_app_id` (text) - OneSignal application ID
  - `onesignal_api_key` (text) - OneSignal REST API key
  - `service_active` (boolean) - Overall service status
  - `last_updated` (timestamptz) - Last configuration update
  - `created_at` (timestamptz) - Record creation timestamp

  ### `sent_notifications`
  History of all sent notifications
  - `id` (uuid, primary key) - Unique identifier
  - `post_id` (text) - WordPress post ID
  - `post_title` (text) - Title of the WordPress post
  - `post_url` (text) - URL to the WordPress post
  - `status` (text) - Delivery status: 'sent', 'failed', 'pending'
  - `error_message` (text, nullable) - Error details if failed
  - `recipients_count` (integer) - Number of recipients
  - `onesignal_notification_id` (text, nullable) - OneSignal notification ID
  - `sent_at` (timestamptz) - When notification was sent
  - `created_at` (timestamptz) - Record creation timestamp

  ### `random_posts_cache`
  Cache of random WordPress posts for quick access
  - `id` (uuid, primary key) - Unique identifier
  - `post_id` (text) - WordPress post ID
  - `post_title` (text) - Post title
  - `post_url` (text) - Post URL
  - `post_excerpt` (text, nullable) - Post excerpt/summary
  - `post_image` (text, nullable) - Featured image URL
  - `fetched_at` (timestamptz) - When post was fetched
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their notifications
  - Service role access for edge functions

  ## Notes
  - Single-tenant design (one configuration per installation)
  - Edge functions will use service role for database access
  - Frontend uses anon key with RLS policies
*/

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_enabled boolean DEFAULT false,
  schedule_time time DEFAULT '09:00:00',
  wordpress_url text DEFAULT '',
  onesignal_app_id text DEFAULT '',
  onesignal_api_key text DEFAULT '',
  service_active boolean DEFAULT false,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create sent_notifications table
CREATE TABLE IF NOT EXISTS sent_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id text NOT NULL,
  post_title text NOT NULL,
  post_url text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message text,
  recipients_count integer DEFAULT 0,
  onesignal_notification_id text,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create random_posts_cache table
CREATE TABLE IF NOT EXISTS random_posts_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id text NOT NULL,
  post_title text NOT NULL,
  post_url text NOT NULL,
  post_excerpt text,
  post_image text,
  fetched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sent_notifications_sent_at ON sent_notifications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_sent_notifications_status ON sent_notifications(status);
CREATE INDEX IF NOT EXISTS idx_random_posts_fetched_at ON random_posts_cache(fetched_at DESC);

-- Enable Row Level Security
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE random_posts_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_settings
CREATE POLICY "Public read access to settings"
  ON notification_settings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public update access to settings"
  ON notification_settings FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public insert access to settings"
  ON notification_settings FOR INSERT
  TO anon
  WITH CHECK (true);

-- RLS Policies for sent_notifications
CREATE POLICY "Public read access to notifications"
  ON sent_notifications FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public insert access to notifications"
  ON sent_notifications FOR INSERT
  TO anon
  WITH CHECK (true);

-- RLS Policies for random_posts_cache
CREATE POLICY "Public read access to posts cache"
  ON random_posts_cache FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public insert access to posts cache"
  ON random_posts_cache FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public delete access to posts cache"
  ON random_posts_cache FOR DELETE
  TO anon
  USING (true);

-- Insert default settings record if none exists
INSERT INTO notification_settings (id, daily_enabled, service_active)
VALUES ('00000000-0000-0000-0000-000000000001', false, false)
ON CONFLICT (id) DO NOTHING;