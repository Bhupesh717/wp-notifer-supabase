import { useEffect, useState } from 'react';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { Bell, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import type { SentNotification } from '../types';

interface RecentNotificationsProps {
  refresh: number;
}

export function RecentNotifications({ refresh }: RecentNotificationsProps) {
  const [notifications, setNotifications] = useState<SentNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [refresh]);

  const loadNotifications = async () => {
    try {
      const data = await api.getRecentNotifications(10);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#4169E1]">Recent Notifications</h2>
        <Bell className="w-6 h-6 text-[#87CEEB]" />
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No notifications sent yet</div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 bg-[#E6E6FA] rounded-lg hover:bg-[#d8d8f0] transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 flex-1">{notification.post_title}</h3>
                <StatusBadge status={notification.status} />
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span>{formatDate(notification.sent_at)}</span>
                {notification.status === 'sent' && (
                  <span className="text-green-600 font-medium">
                    {notification.recipients_count} recipients
                  </span>
                )}
              </div>

              <a
                href={notification.post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4169E1] hover:text-[#3154c4] text-sm flex items-center gap-1 underline"
              >
                View Post
                <ExternalLink className="w-3 h-3" />
              </a>

              {notification.error_message && (
                <div className="mt-2 p-2 bg-red-50 text-red-700 text-xs rounded">
                  Error: {notification.error_message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
