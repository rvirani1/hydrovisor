import { useEffect, useRef } from 'react';
import { useHydrationStore } from '../store/hydrationStore';

const RENDER_FPS = 15;
const RENDER_INTERVAL = 1000 / RENDER_FPS;

export const useCanvasRenderer = (
  canvasElement: HTMLCanvasElement | null
) => {
  const animationRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasElement) return;

    const render = (currentTime: number) => {
      // Frame rate limiting
      if (currentTime - lastFrameTimeRef.current < RENDER_INTERVAL) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      lastFrameTimeRef.current = currentTime;

      const ctx = canvasElement.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      // Get current detection states from store
      const state = useHydrationStore.getState();
      
      // Clear canvas before drawing
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Draw face detection if present
      if (state.faceDetected && state.faceBox) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          state.faceBox.xMin,
          state.faceBox.yMin,
          state.faceBox.width,
          state.faceBox.height
        );

        // Draw face keypoints
        if (state.faceKeypoints) {
          ctx.fillStyle = '#00ff00';
          state.faceKeypoints.forEach((keypoint) => {
            ctx.beginPath();
            ctx.arc(keypoint.x, keypoint.y, 2, 0, 2 * Math.PI);
            ctx.fill();
          });
        }
      }

      // Draw object detections if present
      if (state.objectDetected && state.objectDetections) {
        state.objectDetections.forEach((detection) => {
          // x, y are center points, so calculate top-left corner
          const topLeftX = detection.x - detection.width / 2;
          const topLeftY = detection.y - detection.height / 2;
          
          // Blue semi-transparent fill
          ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
          ctx.fillRect(topLeftX, topLeftY, detection.width, detection.height);
          
          // Blue border
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 3;
          ctx.strokeRect(topLeftX, topLeftY, detection.width, detection.height);
        });
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [canvasElement]);

  return null;
};