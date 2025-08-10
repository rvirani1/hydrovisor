import { useEffect, useRef } from 'react';
import { useHydrationStore } from '../store/hydrationStore';

export const useDrinkingDetection = () => {
  const {
    faceDetected,
    objectDetected,
    isDrinking,
    startDrinking,
    stopDrinking,
  } = useHydrationStore();

  const drinkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const isCurrentlyDrinking = faceDetected && objectDetected;

    if (isCurrentlyDrinking && !isDrinking) {
      startDrinking();
      
      if (drinkingTimeoutRef.current) {
        clearTimeout(drinkingTimeoutRef.current);
      }
    } else if (!isCurrentlyDrinking && isDrinking) {
      if (drinkingTimeoutRef.current) {
        clearTimeout(drinkingTimeoutRef.current);
      }
      
      drinkingTimeoutRef.current = setTimeout(() => {
        stopDrinking();
      }, 500);
    }

    return () => {
      if (drinkingTimeoutRef.current) {
        clearTimeout(drinkingTimeoutRef.current);
      }
    };
  }, [faceDetected, objectDetected, isDrinking, startDrinking, stopDrinking]);
};