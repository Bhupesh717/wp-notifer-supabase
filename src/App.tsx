import { useState, useEffect } from 'react';
import { ServiceStatusCard } from './components/ServiceStatusCard';
import { NotificationActions } from './components/NotificationActions';
import { RecentNotifications } from './components/RecentNotifications';
import { SettingsForm } from './components/SettingsForm';
import { api } from './services/api';
import type { ServiceStatus } from './types';

function App() {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServiceStatus();
  }, [refreshKey]);

  const loadServiceStatus = async () => {
    try {
      const status = await api.getServiceStatus();
      setServiceStatus(status);
    } catch (error) {
      console.error('Failed to load service status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#E6E6FA] font-['Inter',sans-serif]">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-[#4169E1]">WP Notifier Pro</h1>
          <p className="text-gray-600 mt-1">Manage WordPress push notifications with ease</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4169E1]"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {serviceStatus && <ServiceStatusCard status={serviceStatus} />}
              <NotificationActions onNotificationSent={handleRefresh} />
            </div>

            <div className="space-y-6">
              <SettingsForm onSettingsUpdate={handleRefresh} />
            </div>

            <div className="lg:col-span-2">
              <RecentNotifications refresh={refreshKey} />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white shadow-md mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-600 text-sm">
            WP Notifier Pro - Powered by WordPress & OneSignal
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
