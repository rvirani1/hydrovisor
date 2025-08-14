import { useEffect, useRef } from 'react';
import { useHydrationStore } from '../store/hydrationStore';
import { sendNotification } from '../utils/notifications';

export const useHydrationReminder = () => {
  const { 
    isOverdue, 
    hydrationIntervalMinutes,
    notificationPermission,
    soundEnabled,
    lastHydrationTime,
    trackingStartTime
  } = useHydrationStore();
  
  const lastNotificationTimeRef = useRef<number>(0);
  const hasNotifiedForCurrentPeriod = useRef<boolean>(false);

  useEffect(() => {
    const checkAndNotify = () => {
      const overdue = isOverdue();
      const now = Date.now();
      
      // Only notify if:
      // 1. User is overdue for hydration
      // 2. Notifications are permitted
      // 3. We haven't notified in the last 5 minutes (to avoid spam)
      // 4. We haven't already notified for this overdue period
      if (
        overdue && 
        notificationPermission === 'granted' && 
        (now - lastNotificationTimeRef.current > 5 * 60 * 1000) &&
        !hasNotifiedForCurrentPeriod.current
      ) {
        const timeSinceLastDrink = lastHydrationTime 
          ? Math.floor((now - new Date(lastHydrationTime).getTime()) / 60000)
          : trackingStartTime 
          ? Math.floor((now - new Date(trackingStartTime).getTime()) / 60000)
          : 0;
        
        sendNotification({
          title: '💧 Time to Hydrate!',
          body: `It's been ${timeSinceLastDrink} minutes since your last drink. Stay hydrated!`,
          playSound: soundEnabled,
        });
        
        lastNotificationTimeRef.current = now;
        hasNotifiedForCurrentPeriod.current = true;
      }
      
      // Reset the flag when user is no longer overdue (they drank water)
      if (!overdue) {
        hasNotifiedForCurrentPeriod.current = false;
      }
    };

    // Check immediately
    checkAndNotify();
    
    // Check every 30 seconds
    const interval = setInterval(checkAndNotify, 30000);

    return () => clearInterval(interval);
  }, [isOverdue, hydrationIntervalMinutes, notificationPermission, soundEnabled, lastHydrationTime, trackingStartTime]);
};