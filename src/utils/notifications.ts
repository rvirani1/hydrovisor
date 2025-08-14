export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
}

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

export const sendNotification = (options: NotificationOptions): void => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.log('Notification permission not granted');
    return;
  }

  const notification = new Notification(options.title, {
    body: options.body,
    icon: options.icon || '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    tag: 'hydration-reminder',
    requireInteraction: false,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  setTimeout(() => notification.close(), 10000);
};

export const checkNotificationSupport = (): boolean => {
  return 'Notification' in window;
};

export const getNotificationPermissionStatus = (): NotificationPermission | null => {
  if (!('Notification' in window)) {
    return null;
  }
  return Notification.permission;
};