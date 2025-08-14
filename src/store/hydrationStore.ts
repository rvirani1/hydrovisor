import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type DetectedObject } from '../constants';

interface HydrationEvent {
  timestamp: Date;
  detectedObject: DetectedObject;
}

interface HydrationStore {
  hydrationEvents: HydrationEvent[];
  trackingStartTime: Date | null;
  hydrationIntervalMinutes: number;
  lastHydrationTime: Date | null;
  webcamReady: boolean;
  faceDetectorReady: boolean;
  objectDetectorReady: boolean;
  notificationPermission: NotificationPermission | null;
  faceDetected: boolean;
  faceBox: { xMin: number; yMin: number; width: number; height: number } | null;
  faceKeypoints: Array<{ x: number; y: number }> | null;
  objectDetected: boolean;
  objectDetections: Array<{ class: string; confidence: number; x: number; y: number; width: number; height: number }> | null;
  currentObject: DetectedObject | null;
  isDrinking: boolean;
  drinkingStartTime: Date | null;
  
  addHydrationEvent: (object: DetectedObject) => void;
  setHydrationInterval: (minutes: number) => void;
  setWebcamReady: (ready: boolean) => void;
  setFaceDetectorReady: (ready: boolean) => void;
  setObjectDetectorReady: (ready: boolean) => void;
  setNotificationPermission: (permission: NotificationPermission | null) => void;
  setFaceDetected: (detected: boolean, box?: { xMin: number; yMin: number; width: number; height: number } | null, keypoints?: Array<{ x: number; y: number }> | null) => void;
  setObjectDetected: (detected: boolean, object?: DetectedObject | null, detections?: Array<{ class: string; confidence: number; x: number; y: number; width: number; height: number }> | null) => void;
  setIsDrinking: (drinking: boolean) => void;
  startDrinking: () => void;
  stopDrinking: () => void;
  getTimeSinceLastHydration: () => number | null;
  isOverdue: () => boolean;
  getTodayHydrationCount: () => number;
  isFullyInitialized: () => boolean;
  reset: () => void;
}

// Helper function to check if a date is today
const isToday = (date: Date | string | null): boolean => {
  if (!date) return false;
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

// Helper to filter out events from previous days
const filterTodayEvents = (events: HydrationEvent[]): HydrationEvent[] => {
  if (!events) return [];
  return events.filter(event => {
    const eventDate = typeof event.timestamp === 'string' 
      ? new Date(event.timestamp)
      : event.timestamp;
    return isToday(eventDate);
  });
};

export const useHydrationStore = create<HydrationStore>()(
  persist(
    (set, get) => ({
  hydrationEvents: [],
  trackingStartTime: new Date(),
  hydrationIntervalMinutes: 3,
  lastHydrationTime: null,
  webcamReady: false,
  faceDetectorReady: false,
  objectDetectorReady: false,
  notificationPermission: null,
  faceDetected: false,
  faceBox: null,
  faceKeypoints: null,
  objectDetected: false,
  objectDetections: null,
  currentObject: null,
  isDrinking: false,
  drinkingStartTime: null,
  
  addHydrationEvent: (object) => {
    const now = new Date();
    console.log('Adding hydration event:', { object, time: now });
    set((state) => ({
      hydrationEvents: [...state.hydrationEvents, { timestamp: now, detectedObject: object }],
      lastHydrationTime: now,
    }));
  },
  
  setHydrationInterval: (minutes) => set({ hydrationIntervalMinutes: minutes }),
  
  setWebcamReady: (ready) => set((state) => ({ 
    webcamReady: ready,
    trackingStartTime: ready && !state.trackingStartTime ? new Date() : state.trackingStartTime
  })),
  
  setFaceDetectorReady: (ready) => set({ faceDetectorReady: ready }),
  
  setObjectDetectorReady: (ready) => set({ objectDetectorReady: ready }),
  
  setNotificationPermission: (permission) => set({ notificationPermission: permission }),
  
  setFaceDetected: (detected, box = null, keypoints = null) => set({ 
    faceDetected: detected,
    faceBox: box,
    faceKeypoints: keypoints
  }),
  
  setObjectDetected: (detected, object = null, detections = null) => set({ 
    objectDetected: detected,
    currentObject: object,
    objectDetections: detections
  }),
  
  setIsDrinking: (drinking) => set({ isDrinking: drinking }),
  
  startDrinking: () => {
    set({ isDrinking: true, drinkingStartTime: new Date() });
  },
  
  stopDrinking: () => {
    const state = get();
    if (state.isDrinking && state.drinkingStartTime) {
      const drinkingDuration = Date.now() - state.drinkingStartTime.getTime();
      console.log('Stopping drinking. Duration:', drinkingDuration, 'ms');
      
      // Use currentObject if available, otherwise default to 'cup'
      if (drinkingDuration > 2000) {
        const objectType = state.currentObject || 'cup';
        console.log('Drinking duration > 2s, adding hydration event for:', objectType);
        get().addHydrationEvent(objectType);
      }
    }
    set({ isDrinking: false, drinkingStartTime: null });
  },
  
  getTimeSinceLastHydration: () => {
    const state = get();
    // If we have a last hydration time, use that
    if (state.lastHydrationTime) {
      const lastTime = typeof state.lastHydrationTime === 'string' 
        ? new Date(state.lastHydrationTime) 
        : state.lastHydrationTime;
      return Math.floor((Date.now() - lastTime.getTime()) / 1000);
    }
    // If tracking started but no drinks yet, count from tracking start time
    if (state.trackingStartTime) {
      const startTime = typeof state.trackingStartTime === 'string'
        ? new Date(state.trackingStartTime)
        : state.trackingStartTime;
      return Math.floor((Date.now() - startTime.getTime()) / 1000);
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
    return state.hydrationEvents.filter(event => {
      const eventTime = typeof event.timestamp === 'string'
        ? new Date(event.timestamp)
        : event.timestamp;
      return eventTime >= today;
    }).length;
  },
  
  isFullyInitialized: () => {
    const state = get();
    return state.webcamReady && state.faceDetectorReady && state.objectDetectorReady && state.notificationPermission !== null;
  },
  
  reset: () => set((state) => ({
    ...state,
    hydrationEvents: [],
    lastHydrationTime: null,
    faceDetected: false,
    faceBox: null,
    faceKeypoints: null,
    objectDetected: false,
    objectDetections: null,
    currentObject: null,
    isDrinking: false,
    drinkingStartTime: null,
    // Keep trackingStartTime as is (it's always the current session start)
  })),
    }),
    {
      name: 'hydrovisor-storage',
      partialize: (state) => ({ 
        hydrationIntervalMinutes: state.hydrationIntervalMinutes,
        hydrationEvents: state.hydrationEvents,
        lastHydrationTime: state.lastHydrationTime,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert string dates back to Date objects
          if (state.lastHydrationTime && typeof state.lastHydrationTime === 'string') {
            state.lastHydrationTime = new Date(state.lastHydrationTime);
          }
          if (state.hydrationEvents) {
            state.hydrationEvents = state.hydrationEvents.map((event: HydrationEvent) => ({
              ...event,
              timestamp: typeof event.timestamp === 'string' ? new Date(event.timestamp) : event.timestamp
            }));
            
            // Filter to only keep today's events
            state.hydrationEvents = filterTodayEvents(state.hydrationEvents);
            
            // Update lastHydrationTime based on filtered events
            if (state.hydrationEvents.length > 0) {
              const lastEvent = state.hydrationEvents[state.hydrationEvents.length - 1];
              state.lastHydrationTime = lastEvent.timestamp;
            } else {
              state.lastHydrationTime = null;
            }
          }
          
          // Always set tracking start time to now (not persisted)
          state.trackingStartTime = new Date();
        }
      },
    }
  )
);