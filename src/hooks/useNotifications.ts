import { useEffect } from 'react';
import { useSettings } from './useSettings';
import { scheduleNotification, clearNotification } from '@/lib/notifications';

export function useNotifications() {
  const { data: settings } = useSettings();

  useEffect(() => {
    if (settings) {
      scheduleNotification(settings.notification_time, settings.notifications_enabled);
    }

    return () => {
      clearNotification();
    };
  }, [settings?.notification_time, settings?.notifications_enabled]);
}
