import { useEffect, useRef } from 'react';
import { useHydrationStore } from '../store/hydrationStore';
import { detectDrinking, ConsecutiveFrameTracker } from '../utils/overlapDetection';

const REQUIRED_CONSECUTIVE_FRAMES = 3; // Require 3 consecutive frames of overlap
const OVERLAP_THRESHOLD = 0.05; // 5% IoU threshold for drinking detection

export const useDrinkingDetection = () => {
  const {
    faceKeypoints,
    objectDetections,
    isDrinking,
    startDrinking,
    stopDrinking,
  } = useHydrationStore();

  const drinkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const frameTrackerRef = useRef(new ConsecutiveFrameTracker(REQUIRED_CONSECUTIVE_FRAMES));

  useEffect(() => {
    // Detect if lip area overlaps with any object
    const { isDrinking: isOverlapping } = detectDrinking(
      faceKeypoints,
      objectDetections,
      OVERLAP_THRESHOLD
    );

    // Track consecutive frames
    const hasConsecutiveFrames = frameTrackerRef.current.update(isOverlapping);

    if (hasConsecutiveFrames && !isDrinking) {
      // Start drinking after required consecutive frames
      startDrinking();
      
      if (drinkingTimeoutRef.current) {
        clearTimeout(drinkingTimeoutRef.current);
      }
    } else if (!isOverlapping && isDrinking) {
      // Stop drinking after a delay when overlap is lost
      if (drinkingTimeoutRef.current) {
        clearTimeout(drinkingTimeoutRef.current);
      }
      
      drinkingTimeoutRef.current = setTimeout(() => {
        stopDrinking();
        frameTrackerRef.current.reset();
      }, 500);
    }

    return () => {
      if (drinkingTimeoutRef.current) {
        clearTimeout(drinkingTimeoutRef.current);
      }
    };
  }, [faceKeypoints, objectDetections, isDrinking, startDrinking, stopDrinking]);
};