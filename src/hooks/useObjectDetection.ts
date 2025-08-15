import { useEffect, useRef } from 'react';
// @ts-expect-error - inferencejs package has typing issues with exports resolution
import { InferenceEngine, CVImage } from 'inferencejs';
import { useHydrationStore } from '../store/hydrationStore';
import { DETECTION_CLASSES, FRAME_RATES, ROBOFLOW_CONFIG, type DetectedObject } from '../constants';

interface Detection {
  class: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color?: string;
}

const OBJECT_FRAME_INTERVAL = 1000 / FRAME_RATES.objectDetection;
const OBJECT_PERSISTENCE_TIMEOUT = 1000; // 1 second grace period for object detection

export const useObjectDetection = (
  videoElement: HTMLVideoElement | null
) => {
  const inferenceRef = useRef<InferenceEngine | null>(null);
  const animationRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const lastObjectDetectedAtRef = useRef<number>(0);
  const setObjectDetected = useHydrationStore((state) => state.setObjectDetected);
  const setObjectDetectorReady = useHydrationStore((state) => state.setObjectDetectorReady);
  const modelVersion = useHydrationStore((state) => state.modelVersion);

  useEffect(() => {
    if (!videoElement) return;

    const initializeInference = async () => {
      try {
        console.log('Initializing object detector...');
        inferenceRef.current = new InferenceEngine();
        
        const workerId = await inferenceRef.current.startWorker(
          ROBOFLOW_CONFIG.modelName,
          modelVersion,
          ROBOFLOW_CONFIG.publishableKey
        );
        
        console.log('Object detector initialized successfully');
        setObjectDetectorReady(true);
        return workerId;
      } catch (error) {
        console.error('Failed to initialize object detector:', error);
        setObjectDetectorReady(false);
        return null;
      }
    };

    let workerId: string | null = null;

    const detectObjects = async (currentTime: number) => {
      if (!inferenceRef.current || !videoElement || !workerId) {
        animationRef.current = requestAnimationFrame(detectObjects);
        return;
      }

      // Frame rate limiting - only process if enough time has passed
      if (currentTime - lastFrameTimeRef.current < OBJECT_FRAME_INTERVAL) {
        animationRef.current = requestAnimationFrame(detectObjects);
        return;
      }

      lastFrameTimeRef.current = currentTime;

      try {
        const image = new CVImage(videoElement);
        const detections = await inferenceRef.current.infer(workerId, image);
        
        const drinkingObjects = detections.filter((d: Detection) => 
          DETECTION_CLASSES.includes(d.class.toLowerCase())
        );

        if (drinkingObjects.length > 0) {
          // Find the largest cup by area (width * height)
          const largestCup = drinkingObjects.reduce((prev: Detection, current: Detection) => {
            const prevArea = prev.bbox.width * prev.bbox.height;
            const currentArea = current.bbox.width * current.bbox.height;
            return currentArea > prevArea ? current : prev;
          });

          // Only keep the largest cup for tracking
          const detectionData = [{
            class: largestCup.class,
            confidence: largestCup.confidence,
            x: largestCup.bbox.x,
            y: largestCup.bbox.y,
            width: largestCup.bbox.width,
            height: largestCup.bbox.height
          }];

          // Update timestamp and set object detected
          lastObjectDetectedAtRef.current = currentTime;
          setObjectDetected(
            true, 
            largestCup.class.toLowerCase() as DetectedObject,
            detectionData
          );
        } else {
          // Check if we should clear the object
          const timeSinceLastObject = currentTime - lastObjectDetectedAtRef.current;
          
          if (timeSinceLastObject >= OBJECT_PERSISTENCE_TIMEOUT) {
            // Enough time has passed, clear the object
            setObjectDetected(false, null, null);
          }
          // Otherwise, do nothing - keep the current state
        }
      } catch (error) {
        console.error('Object detection error:', error);
      }

      animationRef.current = requestAnimationFrame(detectObjects);
    };

    initializeInference().then((id) => {
      workerId = id;
      animationRef.current = requestAnimationFrame(detectObjects);
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (inferenceRef.current) {
        inferenceRef.current = null;
        setObjectDetectorReady(false);
      }
    };
  }, [videoElement, setObjectDetected, setObjectDetectorReady, modelVersion]);

  return null;
};