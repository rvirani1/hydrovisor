# Hydrovisor Architecture

## Overview
Hydrovisor is a client-only web application that detects hydration events using your webcam and AI. It combines face detection (TensorFlow.js + MediaPipe FaceMesh) with object detection (Roboflow InferenceJS) and logs drinking events in local state persisted to the browser.

- **Frontend**: React 18 + TypeScript (Vite)
- **Styling**: TailwindCSS
- **State**: Zustand with `persist`
- **CV**: TensorFlow.js + MediaPipe FaceMesh; Roboflow InferenceJS
- **Build**: Vite (SPA), static hosting friendly

## High-Level Flow
1. User grants camera access; `WebcamFeed` obtains a stream.
2. Face detection runs at ~15 FPS via TF.js/MediaPipe. The largest/primary face and keypoints are tracked.
3. Object detection runs at ~5 FPS via Roboflow InferenceJS for the classes defined in `VITE_DETECTION_CLASSES`.
4. Drinking detection correlates face presence and object overlap/proximity over time. If drinking persists ≥ 2 frames, a hydration event is recorded. Stopping is debounced by 200ms.
5. State is managed in a single Zustand store. Selectors feed UI components for status, stats, and reminders.

## Key Modules
- `src/components/WebcamFeed.tsx`
  - Renders `<video>` and a `<canvas>` overlay.
  - Orchestrates detection hooks and draws boxes/keypoints.
- `src/components/HydrationStats.tsx`
  - Displays daily counts, first/last hydration times, progress indicators.
- `src/components/SettingsModal.tsx`
  - UI for interval settings, model selection, sound toggle, and reset controls.
- `src/components/ui/*`
  - Small, reusable UI primitives (button, card, dialog, etc.).
- `src/hooks/useFaceDetection.ts`
  - Initializes TF.js + MediaPipe FaceMesh, detects face box and keypoints.
  - Emits readiness and detection state to the store.
- `src/hooks/useObjectDetection.ts`
  - Initializes Roboflow InferenceJS with `ROBOFLOW_CONFIG` and selected model version.
  - Supports switching between YOLO v8, RF-DETR Small, and RF-DETR Nano models.
  - Emits detected objects and confidences to the store.
- `src/hooks/useDrinkingDetection.ts`
  - Consumes face/object signals and performs temporal logic for drinking start/stop with thresholds.
- `src/hooks/useHydrationReminder.ts`
  - Computes overdue state and triggers notifications at configured intervals.
- `src/hooks/useCanvasRenderer.ts`
  - Efficient canvas drawing of overlays with requestAnimationFrame.
- `src/store/hydrationStore.ts`
  - Single source of truth: events, readiness, detection state, timers, and helper selectors.
- `src/utils/*`
  - Utilities like notification helpers and geometric overlap logic.
- `src/constants.ts`
  - Environment-driven constants and defaults.

## State Model (Zustand)
The store tracks:
- Readiness: `webcamReady`, `faceDetectorReady`, `objectDetectorReady`, `notificationPermission`
- Detection: `faceDetected`, `faceBox`, `faceKeypoints`, `objectDetected`, `objectDetections`, `currentObject`
- Drinking lifecycle: `isDrinking`, `drinkingStartTime`
- Hydration events: `hydrationEvents[]`, `firstHydrationTime`, `lastHydrationTime`
- Config: `hydrationIntervalMinutes`, `soundEnabled`, `modelVersion`
- Session: `trackingStartTime`

Persistence (via `persist`) stores user config and historical events; volatile session fields are reinitialized on load.

## Drinking Detection Logic
- Start condition: face detected as primary and a valid object class in frame, with spatial overlap/proximity logic (2% IoU threshold).
- Temporal threshold: drinking must be sustained for ≥ 2 frames to start detection.
- Stop condition: loss of face/object or insufficient overlap, debounced by 200ms.
- Duplicate prevention: events are only added on transition from not-drinking → drinking.
- Visual feedback: Background pulses orange during active drinking detection.

## Performance & UX
- Frame-rate limits: face ~15 FPS, object ~5 FPS to balance CPU/network.
- Rendering: `requestAnimationFrame` and a single composited canvas.
- Cleanup: all hooks release camera streams and cancel loops on unmount.
- Accessibility: keyboard-focusable controls, ARIA where appropriate, clear status indicators.

## Configuration
Environment variables (Vite-style):
- `VITE_ROBOFLOW_PUBLISHABLE_KEY`: Roboflow publishable key.
- `VITE_ROBOFLOW_MODEL_NAME`: Model name (e.g., `drinks-detection`).
- `VITE_DETECTION_CLASSES`: Comma-separated classes (default `cup,glass,bottle`).

### Model Selection
Users can select from three detection models via the Settings modal:
- **YOLO v8** (version 10): Fast and accurate general-purpose detection
- **RF-DETR Small** (version 8): Balanced transformer-based detection  
- **RF-DETR Nano** (version 9): Lightweight transformer for lower-end devices

Model selection persists across sessions and triggers a page reload to reinitialize the detector.

## Build & Deployment
- Dev: `npm run dev`
- Build: `npm run build` → `dist/`
- Deploy: Static hosting (Vercel, Render static sites) with env vars configured.

## Future Enhancements
- Local persistence of settings and history (expanded) and export to CSV
- Daily/weekly goals and historical charts
- Push notifications and PWA enhancements
- Dark mode and multiple profiles