import { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Settings } from 'lucide-react';
import { api } from '../services/api';
import type { NotificationSettings } from '../types';

interface SettingsFormProps {
  onSettingsUpdate: () => void;
}

export function SettingsForm({ onSettingsUpdate }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settings, setSettings] = useState<Partial<NotificationSettings>>({
    wordpress_url: '',
    onesignal_app_id: '',
    onesignal_api_key: '',
    daily_enabled: false,
    schedule_time: '09:00',
    service_active: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      if (data) {
        setSettings({
          wordpress_url: data.wordpress_url,
          onesignal_app_id: data.onesignal_app_id,
          onesignal_api_key: data.onesignal_api_key,
          daily_enabled: data.daily_enabled,
          schedule_time: data.schedule_time,
          service_active: data.service_active,
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.updateSettings(settings);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      onSettingsUpdate();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save settings'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#4169E1]">Settings</h2>
        <Settings className="w-6 h-6 text-[#87CEEB]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WordPress URL
          </label>
          <input
            type="url"
            value={settings.wordpress_url}
            onChange={(e) => handleChange('wordpress_url', e.target.value)}
            placeholder="https://yourblog.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            OneSignal App ID
          </label>
          <input
            type="text"
            value={settings.onesignal_app_id}
            onChange={(e) => handleChange('onesignal_app_id', e.target.value)}
            placeholder="Enter your OneSignal App ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            OneSignal API Key
          </label>
          <input
            type="password"
            value={settings.onesignal_api_key}
            onChange={(e) => handleChange('onesignal_api_key', e.target.value)}
            placeholder="Enter your OneSignal REST API Key"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent"
            required
          />
        </div>

        <div className="border-t pt-4">
          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={settings.service_active}
              onChange={(e) => handleChange('service_active', e.target.checked)}
              className="w-5 h-5 text-[#4169E1] rounded focus:ring-2 focus:ring-[#4169E1]"
            />
            <span className="text-sm font-medium text-gray-700">Service Active</span>
          </label>

          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={settings.daily_enabled}
              onChange={(e) => handleChange('daily_enabled', e.target.checked)}
              className="w-5 h-5 text-[#4169E1] rounded focus:ring-2 focus:ring-[#4169E1]"
            />
            <span className="text-sm font-medium text-gray-700">Enable Daily Notifications</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Schedule Time
            </label>
            <input
              type="time"
              value={settings.schedule_time}
              onChange={(e) => handleChange('schedule_time', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent"
            />
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Save Settings
        </Button>
      </form>
    </Card>
  );
}
