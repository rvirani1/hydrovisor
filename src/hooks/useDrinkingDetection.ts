import { useEffect, useRef } from 'react';
import { useHydrationStore } from '../store/hydrationStore';
import { detectDrinking } from '../utils/overlapDetection';

const OVERLAP_THRESHOLD = 0.02; // 2% IoU threshold for drinking detection
const DEBOUNCE_MS = 500; // Wait 500ms after last detection before stopping
const MIN_DRINKING_FRAMES = 2; // Minimum frames to start drinking

export const useDrinkingDetection = () => {
  const {
    faceKeypoints,
    objectDetections,
    isDrinking,
    startDrinking,
    stopDrinking,
  } = useHydrationStore();

  // Track timestamps instead of timeouts
  const lastOverlapTimeRef = useRef<number>(0);
  const overlapFrameCountRef = useRef<number>(0);
  const lastCheckTimeRef = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    
    // Rate limit checks (only check every 100ms)
    if (now - lastCheckTimeRef.current < 100) {
      return;
    }
    lastCheckTimeRef.current = now;

    // Detect if lip area overlaps with any object
    const { isDrinking: isOverlapping } = detectDrinking(
      faceKeypoints,
      objectDetections,
      OVERLAP_THRESHOLD
    );

    if (isOverlapping) {
      // Update last overlap time
      lastOverlapTimeRef.current = now;
      overlapFrameCountRef.current++;
      
      // Start drinking after minimum frames
      if (!isDrinking && overlapFrameCountRef.current >= MIN_DRINKING_FRAMES) {
        console.log('Starting drinking detection');
        startDrinking();
      }
    } else {
      // Check if enough time has passed since last overlap
      const timeSinceLastOverlap = now - lastOverlapTimeRef.current;
      
      if (isDrinking && timeSinceLastOverlap > DEBOUNCE_MS) {
        // Stop drinking if no overlap for DEBOUNCE_MS
        console.log('Stopping drinking - no overlap for', timeSinceLastOverlap, 'ms');
        stopDrinking();
        overlapFrameCountRef.current = 0;
      } else if (!isDrinking && timeSinceLastOverlap > DEBOUNCE_MS) {
        // Reset frame count if not drinking and no recent overlap
        overlapFrameCountRef.current = 0;
      }
    }
  }, [faceKeypoints, objectDetections, isDrinking, startDrinking, stopDrinking]);
};