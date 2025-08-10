import { useEffect, useRef } from 'react';
// @ts-ignore - inferencejs package has typing issues with exports resolution
import { InferenceEngine } from 'inferencejs';
import { useHydrationStore } from '../store/hydrationStore';

interface Detection {
  class: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const useObjectDetection = (
  videoElement: HTMLVideoElement | null,
  canvasElement: HTMLCanvasElement | null,
  apiKey: string | null,
  modelId: string | null
) => {
  const inferenceRef = useRef<InferenceEngine | null>(null);
  const animationRef = useRef<number>(0);
  const setObjectDetected = useHydrationStore((state) => state.setObjectDetected);

  useEffect(() => {
    if (!videoElement || !canvasElement || !apiKey || !modelId) return;

    const initializeInference = async () => {
      inferenceRef.current = new InferenceEngine();
      
      const workerId = await inferenceRef.current.startWorker(
        modelId,
        1,
        apiKey
      );

      return workerId;
    };

    let workerId: string | null = null;

    const detectObjects = async () => {
      if (!inferenceRef.current || !videoElement || !canvasElement || !workerId) return;

      const ctx = canvasElement.getContext('2d');
      if (!ctx) return;

      try {
        const detections = await inferenceRef.current.infer(workerId, videoElement);
        
        const drinkingObjects = detections.filter((d: Detection) => 
          ['cup', 'glass', 'bottle'].includes(d.class.toLowerCase())
        );

        if (drinkingObjects.length > 0) {
          const primaryObject = drinkingObjects.reduce((prev: Detection, current: Detection) => 
            (prev.confidence > current.confidence) ? prev : current
          );

          setObjectDetected(
            true, 
            primaryObject.class.toLowerCase() as 'cup' | 'glass' | 'bottle'
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
      detectObjects();
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (inferenceRef.current) {
        inferenceRef.current = null;
      }
    };
  }, [videoElement, canvasElement, apiKey, modelId, setObjectDetected]);

  return null;
};