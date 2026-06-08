export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("Este navegador não suporta notificações.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    console.warn("Permissão de notificação negada pelo usuário.");
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

let notificationTimeout: ReturnType<typeof setTimeout>;

export function scheduleNotification(time: Date, title: string, body: string) {
  clearNotification(); // Clear any existing notifications

  const now = new Date();
  const delay = time.getTime() - now.getTime();

  if (delay <= 0) {
    // If the time is in the past, display immediately or schedule for next day
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
    return;
  }

  notificationTimeout = setTimeout(() => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  }, delay);
}

export function clearNotification() {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
}
