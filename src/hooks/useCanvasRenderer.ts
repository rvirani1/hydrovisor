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
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.font = '16px Arial';
        ctx.fillStyle = '#ff0000';

        state.objectDetections.forEach((detection) => {
          const x = detection.x - detection.width / 2;
          const y = detection.y - detection.height / 2;
          
          ctx.strokeRect(x, y, detection.width, detection.height);
          
          const label = `${detection.class} (${Math.round(detection.confidence * 100)}%)`;
          ctx.fillText(label, x, y - 5);
        });
      }

      // Draw drinking indicator if active
      if (state.isDrinking) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.fillRect(0, 0, canvasElement.width, 40);
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('DRINKING DETECTED! 💧', 10, 28);
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