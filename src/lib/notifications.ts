let notificationTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleNotification(notificationTime: string, enabled: boolean) {
  clearNotification();

  if (!enabled) return;

  if (!('Notification' in window)) return;

  const [hours, minutes] = notificationTime.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  const delay = target.getTime() - now.getTime();

  notificationTimer = setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification('Controle de Ponto', {
        body: 'Não esqueça de bater ponto!',
        icon: '/icon-192.png',
      });
    }
  }, delay);
}

export function clearNotification() {
  if (notificationTimer) {
    clearTimeout(notificationTimer);
    notificationTimer = null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;

  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}
