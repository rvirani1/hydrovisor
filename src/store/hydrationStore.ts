import { create } from 'zustand';

interface HydrationEvent {
  timestamp: Date;
  detectedObject: 'cup' | 'glass' | 'bottle';
}

interface HydrationStore {
  hydrationEvents: HydrationEvent[];
  isTracking: boolean;
  hydrationIntervalMinutes: number;
  lastHydrationTime: Date | null;
  webcamReady: boolean;
  faceDetected: boolean;
  objectDetected: boolean;
  currentObject: 'cup' | 'glass' | 'bottle' | null;
  isDrinking: boolean;
  drinkingStartTime: Date | null;
  
  addHydrationEvent: (object: 'cup' | 'glass' | 'bottle') => void;
  setIsTracking: (tracking: boolean) => void;
  setHydrationInterval: (minutes: number) => void;
  setWebcamReady: (ready: boolean) => void;
  setFaceDetected: (detected: boolean) => void;
  setObjectDetected: (detected: boolean, object?: 'cup' | 'glass' | 'bottle' | null) => void;
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
  hydrationIntervalMinutes: 30,
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
  
  setIsTracking: (tracking) => set({ isTracking: tracking }),
  
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
    if (!state.lastHydrationTime) return null;
    return Math.floor((Date.now() - state.lastHydrationTime.getTime()) / 60000);
  },
  
  isOverdue: () => {
    const state = get();
    const timeSince = state.getTimeSinceLastHydration();
    if (timeSince === null) return false;
    return timeSince >= state.hydrationIntervalMinutes;
  },
  
  getTodayHydrationCount: () => {
    const state = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return state.hydrationEvents.filter(event => event.timestamp >= today).length;
  },
  
  reset: () => set({
    hydrationEvents: [],
    lastHydrationTime: null,
    faceDetected: false,
    objectDetected: false,
    currentObject: null,
    isDrinking: false,
    drinkingStartTime: null,
  }),
}));