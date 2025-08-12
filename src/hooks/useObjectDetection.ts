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

export const useObjectDetection = (
  videoElement: HTMLVideoElement | null
) => {
  const inferenceRef = useRef<InferenceEngine | null>(null);
  const animationRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const setObjectDetected = useHydrationStore((state) => state.setObjectDetected);

  useEffect(() => {
    if (!videoElement) return;

    const initializeInference = async () => {
      inferenceRef.current = new InferenceEngine();
      
      const workerId = await inferenceRef.current.startWorker(
        ROBOFLOW_CONFIG.modelName,
        ROBOFLOW_CONFIG.modelVersion,
        ROBOFLOW_CONFIG.publishableKey
      );

      return workerId;
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
        console.log('detections', detections);
        
        const drinkingObjects = detections.filter((d: Detection) => 
          DETECTION_CLASSES.includes(d.class.toLowerCase())
        );

        if (drinkingObjects.length > 0) {
          const primaryObject = drinkingObjects.reduce((prev: Detection, current: Detection) => 
            (prev.confidence > current.confidence) ? prev : current
          );

          // Convert bbox format to our store format
          const detectionData = drinkingObjects.map((d: Detection) => ({
            class: d.class,
            confidence: d.confidence,
            x: d.bbox.x,
            y: d.bbox.y,
            width: d.bbox.width,
            height: d.bbox.height
          }));

          setObjectDetected(
            true, 
            primaryObject.class.toLowerCase() as DetectedObject,
            detectionData
          );
        } else {
          setObjectDetected(false, null, null);
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
      }
    };
  }, [videoElement, setObjectDetected]);

  return null;
};