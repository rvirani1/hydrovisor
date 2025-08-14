export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  playSound?: boolean;
}

// Create a singleton audio instance for notification sounds
let notificationAudio: HTMLAudioElement | null = null;
let fadeInterval: NodeJS.Timeout | null = null;

const getNotificationAudio = (): HTMLAudioElement => {
  if (!notificationAudio) {
    notificationAudio = new Audio('/sound.mp3');
    notificationAudio.volume = 0; // Start at 0 for fade in
  }
  return notificationAudio;
};

// Fade in audio over duration (in milliseconds)
const fadeInAudio = (audio: HTMLAudioElement, targetVolume: number = 0.2, duration: number = 500): void => {
  // Clear any existing fade
  if (fadeInterval) {
    clearInterval(fadeInterval);
  }
  
  audio.volume = 0;
  const steps = 20; // Number of volume steps
  const stepDuration = duration / steps;
  const volumeIncrement = targetVolume / steps;
  let currentStep = 0;
  
  fadeInterval = setInterval(() => {
    currentStep++;
    audio.volume = Math.min(volumeIncrement * currentStep, targetVolume);
    
    if (currentStep >= steps) {
      if (fadeInterval) clearInterval(fadeInterval);
      fadeInterval = null;
    }
  }, stepDuration);
};

// Fade out audio over duration (in milliseconds)
const fadeOutAudio = (audio: HTMLAudioElement, duration: number = 1000): void => {
  // Clear any existing fade
  if (fadeInterval) {
    clearInterval(fadeInterval);
  }
  
  const startVolume = audio.volume;
  const steps = 20; // Number of volume steps
  const stepDuration = duration / steps;
  const volumeDecrement = startVolume / steps;
  let currentStep = 0;
  
  fadeInterval = setInterval(() => {
    currentStep++;
    audio.volume = Math.max(startVolume - (volumeDecrement * currentStep), 0);
    
    if (currentStep >= steps) {
      if (fadeInterval) clearInterval(fadeInterval);
      fadeInterval = null;
      audio.pause();
      audio.currentTime = 0;
    }
  }, stepDuration);
};

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

  // Play sound if enabled
  if (options.playSound) {
    try {
      const audio = getNotificationAudio();
      // Reset audio to beginning
      audio.currentTime = 0;
      
      // Start playing with fade in
      audio.play().then(() => {
        fadeInAudio(audio, 0.2, 500); // Fade in over 500ms to 20% volume
        
        // Schedule fade out after 3 seconds
        setTimeout(() => {
          fadeOutAudio(audio, 1000); // Fade out over 1 second
        }, 3000);
      }).catch(error => {
        console.log('Failed to play notification sound:', error);
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  const notification = new Notification(options.title, {
    body: options.body,
    icon: options.icon || '/logo.png',
    badge: '/logo.png',
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