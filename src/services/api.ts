import { supabase } from '../lib/supabase';
import type { NotificationSettings, SentNotification, RandomPost, ServiceStatus } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

export const api = {
  async getSettings(): Promise<NotificationSettings | null> {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    const { error } = await supabase
      .from('notification_settings')
      .update({ ...settings, last_updated: new Date().toISOString() })
      .eq('id', '00000000-0000-0000-0000-000000000001');

    if (error) throw error;
  },

  async getRandomPost(): Promise<RandomPost> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-random-post`, { headers });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch random post');
    }

    return response.json();
  },

  async sendNotification(): Promise<any> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-notification`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send notification');
    }

    return response.json();
  },

  async getServiceStatus(): Promise<ServiceStatus> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/service-status`, { headers });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch service status');
    }

    return response.json();
  },

  async getRecentNotifications(limit: number = 10): Promise<SentNotification[]> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/recent-notifications?limit=${limit}`, { headers });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch recent notifications');
    }

    return response.json();
  },
};
