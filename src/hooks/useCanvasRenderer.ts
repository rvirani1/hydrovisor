import { useEffect, useRef } from 'react';
import { useHydrationStore } from '../store/hydrationStore';
import { getLipBoundingBox } from '../utils/overlapDetection';

const RENDER_FPS = 15;
const RENDER_INTERVAL = 1000 / RENDER_FPS;
const DEBUG_LIP_AREA = false; // Set to true to see lip bounding box

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
        // Draw face bounding box
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          state.faceBox.xMin,
          state.faceBox.yMin,
          state.faceBox.width,
          state.faceBox.height
        );

        // Draw only lip keypoints
        if (state.faceKeypoints && state.faceKeypoints.length > 0) {
          // Lip landmark indices from MediaPipe Face Mesh
          // Based on the official MediaPipe face mesh topology
          const lipIndices = [
            // Outer upper lip (left to right)
            61, 146, 91, 181, 84, 17, 314, 405, 269, 270, 267,
            // Outer lower lip (left to right)  
            61, 78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 375, 291,
            // Inner upper lip
            78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308,
            // Inner lower lip
            78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308,
            // Corners
            61, 291,
            // Centers
            0, 13, 14, 17, 18, 269
          ];
          
          // Get unique indices
          const uniqueLipIndices = [...new Set(lipIndices)];

          ctx.fillStyle = '#00ff00';
          uniqueLipIndices.forEach((index) => {
            if (state.faceKeypoints && state.faceKeypoints[index]) {
              const keypoint = state.faceKeypoints[index];
              ctx.beginPath();
              ctx.arc(keypoint.x, keypoint.y, 3, 0, 2 * Math.PI);
              ctx.fill();
            }
          });

          // Debug: Draw lip bounding box
          if (DEBUG_LIP_AREA) {
            const lipBox = getLipBoundingBox(state.faceKeypoints);
            if (lipBox) {
              ctx.strokeStyle = '#ff00ff';
              ctx.lineWidth = 2;
              const lipLeft = lipBox.x - lipBox.width / 2;
              const lipTop = lipBox.y - lipBox.height / 2;
              ctx.strokeRect(lipLeft, lipTop, lipBox.width, lipBox.height);
              ctx.fillStyle = '#ff00ff';
              ctx.font = '12px Arial';
              ctx.fillText('Lip Area', lipLeft, lipTop - 5);
            }
          }
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