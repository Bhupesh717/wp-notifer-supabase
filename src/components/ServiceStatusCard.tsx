import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { Activity, Clock, CheckCircle } from 'lucide-react';
import type { ServiceStatus } from '../types';

interface ServiceStatusCardProps {
  status: ServiceStatus;
}

export function ServiceStatusCard({ status }: ServiceStatusCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#4169E1]">Service Status</h2>
        <Activity className="w-6 h-6 text-[#87CEEB]" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Service Active</span>
          <StatusBadge status={status.service_active ? 'active' : 'inactive'} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-700">Daily Notifications</span>
          <StatusBadge status={status.daily_enabled ? 'active' : 'inactive'} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-700">Configuration</span>
          <StatusBadge status={status.configured ? 'active' : 'inactive'} />
        </div>

        <div className="border-t pt-4 mt-4 space-y-3">
          <div className="flex items-start gap-2">
            <Clock className="w-5 h-5 text-[#4169E1] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Next Scheduled</p>
              <p className="font-medium text-gray-900">{formatDate(status.next_scheduled)}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-[#4169E1] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Last Notification</p>
              <p className="font-medium text-gray-900">{formatDate(status.last_notification_sent)}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
