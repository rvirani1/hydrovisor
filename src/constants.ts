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
  modelName: import.meta.env.VITE_ROBOFLOW_MODEL_NAME,
} as const;

// Available detection models
export const AVAILABLE_MODELS = [
  {
    name: 'YOLO v8',
    // Once trained versionNumber: 10,
    versionNumber: 2,
    description: 'Fast and accurate general-purpose detection'
  },
  {
    name: 'RF-DETR S',
    versionNumber: 8,
    description: 'Balanced transformer-based detection'
  },
  {
    name: 'RF-DETR N',
    versionNumber: 9,
    description: 'Lightweight transformer for lower-end devices'
  }
] as const;

// Frame rate constants
export const FRAME_RATES = {
  faceDetection: 15,
  objectDetection: 5,
} as const;
