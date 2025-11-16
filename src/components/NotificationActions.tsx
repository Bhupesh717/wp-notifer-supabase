import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Send, Shuffle } from 'lucide-react';
import { api } from '../services/api';
import type { RandomPost } from '../types';

interface NotificationActionsProps {
  onNotificationSent: () => void;
}

export function NotificationActions({ onNotificationSent }: NotificationActionsProps) {
  const [loading, setLoading] = useState(false);
  const [randomPost, setRandomPost] = useState<RandomPost | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleGetRandomPost = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const post = await api.getRandomPost();
      setRandomPost(post);
      setMessage({ type: 'success', text: 'Random post fetched successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to fetch post' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const result = await api.sendNotification();
      setMessage({
        type: 'success',
        text: `Notification sent to ${result.recipients} recipients!`
      });
      onNotificationSent();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to send notification' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-[#4169E1] mb-4">Actions</h2>

      <div className="space-y-4">
        <Button
          onClick={handleGetRandomPost}
          loading={loading}
          variant="secondary"
          className="w-full flex items-center justify-center gap-2"
        >
          <Shuffle className="w-5 h-5" />
          Get Random Post
        </Button>

        <Button
          onClick={handleSendNotification}
          loading={loading}
          variant="primary"
          className="w-full flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          Send Notification Now
        </Button>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {randomPost && (
          <div className="mt-4 p-4 bg-[#E6E6FA] rounded-lg">
            <h3 className="font-semibold text-[#4169E1] mb-2">Random Post Preview</h3>
            <p className="text-gray-900 font-medium mb-1">{randomPost.title}</p>
            <a
              href={randomPost.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4169E1] hover:text-[#3154c4] text-sm underline"
            >
              View Post →
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}
