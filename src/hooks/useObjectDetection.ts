import { useEffect, useRef } from 'react';
// @ts-expect-error - inferencejs package has typing issues with exports resolution
import { InferenceEngine, CVImage } from 'inferencejs';
import { useHydrationStore } from '../store/hydrationStore';
import { DETECTION_CLASSES, FRAME_RATES, ROBOFLOW_CONFIG, type DetectedObject } from '../constants';

interface Detection {
  class: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const OBJECT_FRAME_INTERVAL = 1000 / FRAME_RATES.objectDetection;

export const useObjectDetection = (
  videoElement: HTMLVideoElement | null,
  canvasElement: HTMLCanvasElement | null,
) => {
  const inferenceRef = useRef<InferenceEngine | null>(null);
  const animationRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const setObjectDetected = useHydrationStore((state) => state.setObjectDetected);

  useEffect(() => {
    if (!videoElement || !canvasElement) return;

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
      if (!inferenceRef.current || !videoElement || !canvasElement || !workerId) {
        animationRef.current = requestAnimationFrame(detectObjects);
        return;
      }

      // Frame rate limiting - only process if enough time has passed
      if (currentTime - lastFrameTimeRef.current < OBJECT_FRAME_INTERVAL) {
        animationRef.current = requestAnimationFrame(detectObjects);
        return;
      }

      lastFrameTimeRef.current = currentTime;

      const ctx = canvasElement.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(detectObjects);
        return;
      }

      try {
        const image = new CVImage(videoElement);
        const detections = await inferenceRef.current.infer(workerId, image);
        
        const drinkingObjects = detections.filter((d: Detection) => 
          DETECTION_CLASSES.includes(d.class.toLowerCase())
        );

        if (drinkingObjects.length > 0) {
          const primaryObject = drinkingObjects.reduce((prev: Detection, current: Detection) => 
            (prev.confidence > current.confidence) ? prev : current
          );

          setObjectDetected(
            true, 
            primaryObject.class.toLowerCase() as DetectedObject
          );

          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 3;
          ctx.font = '16px Arial';
          ctx.fillStyle = '#ff0000';

          drinkingObjects.forEach((detection: Detection) => {
            const x = detection.x - detection.width / 2;
            const y = detection.y - detection.height / 2;
            
            ctx.strokeRect(x, y, detection.width, detection.height);
            
            const label = `${detection.class} (${Math.round(detection.confidence * 100)}%)`;
            ctx.fillText(label, x, y - 5);
          });
        } else {
          setObjectDetected(false);
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
  }, [videoElement, canvasElement, setObjectDetected]);

  return null;
};