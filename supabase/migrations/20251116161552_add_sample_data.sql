/*
  # Add Sample Data for WP Notifier Pro

  ## Overview
  Populates the database with sample data for testing and demonstration purposes.

  ## Data Additions
  
  ### Settings Record
  - Updates the default settings record with example configuration
  - Sets daily notifications to enabled
  - Configures a 9:00 AM schedule time
  - Adds example WordPress URL and OneSignal credentials (placeholders)
  
  ### Sample Sent Notifications
  - Adds 5 sample notification records
  - Mix of sent and failed statuses
  - Realistic timestamps over the past week
  - Example post titles and URLs
  
  ### Sample Random Posts Cache
  - Adds 3 cached WordPress posts
  - Includes titles, URLs, excerpts
  - Recent fetch timestamps

  ## Notes
  - All data is for demonstration purposes
  - Users should update settings with their actual credentials
  - Sample notifications show the history UI functionality
*/

-- Update default settings with sample configuration
UPDATE notification_settings 
SET 
  daily_enabled = true,
  schedule_time = '09:00:00',
  wordpress_url = 'https://example.wordpress.com',
  onesignal_app_id = 'your-app-id-here',
  onesignal_api_key = 'your-api-key-here',
  service_active = true,
  last_updated = now()
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Insert sample sent notifications
INSERT INTO sent_notifications (post_id, post_title, post_url, status, recipients_count, onesignal_notification_id, sent_at, created_at)
VALUES 
  (
    '123',
    'Getting Started with React Hooks',
    'https://example.wordpress.com/getting-started-with-react-hooks',
    'sent',
    156,
    'os-notif-abc123',
    now() - interval '1 day',
    now() - interval '1 day'
  ),
  (
    '124',
    'Advanced TypeScript Patterns',
    'https://example.wordpress.com/advanced-typescript-patterns',
    'sent',
    142,
    'os-notif-abc124',
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  (
    '125',
    'Building Scalable APIs with Node.js',
    'https://example.wordpress.com/building-scalable-apis',
    'sent',
    189,
    'os-notif-abc125',
    now() - interval '3 days',
    now() - interval '3 days'
  ),
  (
    '126',
    'CSS Grid Layout Masterclass',
    'https://example.wordpress.com/css-grid-layout-masterclass',
    'failed',
    0,
    NULL,
    now() - interval '4 days',
    now() - interval '4 days'
  ),
  (
    '127',
    'Database Optimization Techniques',
    'https://example.wordpress.com/database-optimization',
    'sent',
    203,
    'os-notif-abc127',
    now() - interval '5 days',
    now() - interval '5 days'
  )
ON CONFLICT DO NOTHING;

-- Insert sample random posts cache
INSERT INTO random_posts_cache (post_id, post_title, post_url, post_excerpt, post_image, fetched_at, created_at)
VALUES 
  (
    '128',
    'Understanding Web Performance',
    'https://example.wordpress.com/understanding-web-performance',
    'Learn the key metrics and techniques for optimizing web application performance...',
    'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg',
    now() - interval '2 hours',
    now() - interval '2 hours'
  ),
  (
    '129',
    'Modern JavaScript Features',
    'https://example.wordpress.com/modern-javascript-features',
    'Explore the latest JavaScript features that make development easier and more efficient...',
    'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
    now() - interval '5 hours',
    now() - interval '5 hours'
  ),
  (
    '130',
    'Responsive Design Best Practices',
    'https://example.wordpress.com/responsive-design-best-practices',
    'Master the art of creating websites that work beautifully on all devices...',
    'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg',
    now() - interval '8 hours',
    now() - interval '8 hours'
  )
ON CONFLICT DO NOTHING;