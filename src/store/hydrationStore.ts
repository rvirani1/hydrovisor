import { create } from 'zustand';
import { type DetectedObject } from '../constants';

interface HydrationEvent {
  timestamp: Date;
  detectedObject: DetectedObject;
}

interface HydrationStore {
  hydrationEvents: HydrationEvent[];
  isTracking: boolean;
  trackingStartTime: Date | null;
  hydrationIntervalMinutes: number;
  lastHydrationTime: Date | null;
  webcamReady: boolean;
  faceDetected: boolean;
  objectDetected: boolean;
  currentObject: DetectedObject | null;
  isDrinking: boolean;
  drinkingStartTime: Date | null;
  
  addHydrationEvent: (object: DetectedObject) => void;
  setIsTracking: (tracking: boolean) => void;
  setHydrationInterval: (minutes: number) => void;
  setWebcamReady: (ready: boolean) => void;
  setFaceDetected: (detected: boolean) => void;
  setObjectDetected: (detected: boolean, object?: DetectedObject | null) => void;
  setIsDrinking: (drinking: boolean) => void;
  startDrinking: () => void;
  stopDrinking: () => void;
  getTimeSinceLastHydration: () => number | null;
  isOverdue: () => boolean;
  getTodayHydrationCount: () => number;
  reset: () => void;
}

export const useHydrationStore = create<HydrationStore>((set, get) => ({
  hydrationEvents: [],
  isTracking: false,
  trackingStartTime: null,
  hydrationIntervalMinutes: 3,
  lastHydrationTime: null,
  webcamReady: false,
  faceDetected: false,
  objectDetected: false,
  currentObject: null,
  isDrinking: false,
  drinkingStartTime: null,
  
  addHydrationEvent: (object) => {
    const now = new Date();
    set((state) => ({
      hydrationEvents: [...state.hydrationEvents, { timestamp: now, detectedObject: object }],
      lastHydrationTime: now,
    }));
  },
  
  setIsTracking: (tracking) => set((state) => ({ 
    isTracking: tracking,
    trackingStartTime: tracking && !state.trackingStartTime ? new Date() : state.trackingStartTime
  })),
  
  setHydrationInterval: (minutes) => set({ hydrationIntervalMinutes: minutes }),
  
  setWebcamReady: (ready) => set({ webcamReady: ready }),
  
  setFaceDetected: (detected) => set({ faceDetected: detected }),
  
  setObjectDetected: (detected, object = null) => set({ 
    objectDetected: detected,
    currentObject: object
  }),
  
  setIsDrinking: (drinking) => set({ isDrinking: drinking }),
  
  startDrinking: () => {
    set({ isDrinking: true, drinkingStartTime: new Date() });
  },
  
  stopDrinking: () => {
    const state = get();
    if (state.isDrinking && state.drinkingStartTime && state.currentObject) {
      const drinkingDuration = Date.now() - state.drinkingStartTime.getTime();
      if (drinkingDuration > 2000) {
        get().addHydrationEvent(state.currentObject);
      }
    }
    set({ isDrinking: false, drinkingStartTime: null });
  },
  
  getTimeSinceLastHydration: () => {
    const state = get();
    // If we have a last hydration time, use that
    if (state.lastHydrationTime) {
      return Math.floor((Date.now() - state.lastHydrationTime.getTime()) / 1000);
    }
    // If tracking started but no drinks yet, count from tracking start time
    if (state.trackingStartTime && state.isTracking) {
      return Math.floor((Date.now() - state.trackingStartTime.getTime()) / 1000);
    }
    // No tracking started yet
    return null;
  },
  
  isOverdue: () => {
    const state = get();
    const timeSinceSeconds = state.getTimeSinceLastHydration();
    if (timeSinceSeconds === null) return false;
    const timeSinceMinutes = Math.floor(timeSinceSeconds / 60);
    return timeSinceMinutes >= state.hydrationIntervalMinutes;
  },
  
  getTodayHydrationCount: () => {
    const state = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return state.hydrationEvents.filter(event => event.timestamp >= today).length;
  },
  
  reset: () => set((state) => ({
    hydrationEvents: [],
    lastHydrationTime: null,
    faceDetected: false,
    objectDetected: false,
    currentObject: null,
    isDrinking: false,
    drinkingStartTime: null,
    // Reset tracking start time to now, keeping tracking active
    trackingStartTime: state.isTracking ? new Date() : state.trackingStartTime,
  })),
}));