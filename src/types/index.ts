export interface NotificationSettings {
  id: string;
  daily_enabled: boolean;
  schedule_time: string;
  wordpress_url: string;
  onesignal_app_id: string;
  onesignal_api_key: string;
  service_active: boolean;
  last_updated: string;
  created_at: string;
}

export interface SentNotification {
  id: string;
  post_id: string;
  post_title: string;
  post_url: string;
  status: 'sent' | 'failed' | 'pending';
  error_message?: string;
  recipients_count: number;
  onesignal_notification_id?: string;
  sent_at: string;
  created_at: string;
}

export interface RandomPost {
  id: string;
  title: string;
  url: string;
  excerpt: string;
  image?: string;
}

export interface ServiceStatus {
  service_active: boolean;
  daily_enabled: boolean;
  schedule_time: string;
  next_scheduled: string | null;
  last_notification_sent: string | null;
  configured: boolean;
}
