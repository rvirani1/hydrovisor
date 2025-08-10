// Global configuration constants

// Parse detection classes from environment variable
const detectionClassesEnv = import.meta.env.VITE_DETECTION_CLASSES || 'cup,glass,bottle';
export const DETECTION_CLASSES = detectionClassesEnv
  .split(',')
  .map((cls: string) => cls.trim().toLowerCase())
  .filter((cls: string) => cls.length > 0);

// Type for detected objects (derived from environment variable)
export type DetectedObject = typeof DETECTION_CLASSES[number];

// Roboflow configuration
export const ROBOFLOW_CONFIG = {
  publishableKey: import.meta.env.VITE_ROBOFLOW_PUBLISHABLE_KEY,
  modelId: import.meta.env.VITE_ROBOFLOW_MODEL_ID,
} as const;

// Frame rate constants
export const FRAME_RATES = {
  faceDetection: 15,
  objectDetection: 5,
} as const;

// Default hydration interval
export const DEFAULT_HYDRATION_INTERVAL_MINUTES = 30;