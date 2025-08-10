import { useEffect, useRef } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@mediapipe/face_mesh';
import { useHydrationStore } from '../store/hydrationStore';
import { FRAME_RATES } from '../constants';

const FACE_FRAME_INTERVAL = 1000 / FRAME_RATES.faceDetection;

export const useFaceDetection = (
  videoElement: HTMLVideoElement | null,
  canvasElement: HTMLCanvasElement | null
) => {
  const detectorRef = useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const animationRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const setFaceDetected = useHydrationStore((state) => state.setFaceDetected);

  useEffect(() => {
    if (!videoElement || !canvasElement) return;

    const initializeDetector = async () => {
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshMediaPipeModelConfig = {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        maxFaces: 1,
        refineLandmarks: false,
      };

      detectorRef.current = await faceLandmarksDetection.createDetector(model, detectorConfig);
    };

    const detectFaces = async (currentTime: number) => {
      if (!detectorRef.current || !videoElement || !canvasElement) {
        animationRef.current = requestAnimationFrame(detectFaces);
        return;
      }

      // Frame rate limiting - only process if enough time has passed
      if (currentTime - lastFrameTimeRef.current < FACE_FRAME_INTERVAL) {
        animationRef.current = requestAnimationFrame(detectFaces);
        return;
      }

      lastFrameTimeRef.current = currentTime;

      const ctx = canvasElement.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(detectFaces);
        return;
      }

      try {
        const faces = await detectorRef.current.estimateFaces(videoElement);
        
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        if (faces.length > 0) {
          setFaceDetected(true);
          const face = faces[0];
          
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          
          const box = face.box;
          if (box) {
            ctx.strokeRect(box.xMin, box.yMin, box.width, box.height);
          }
          
          ctx.fillStyle = '#00ff00';
          face.keypoints.forEach((keypoint) => {
            ctx.beginPath();
            ctx.arc(keypoint.x, keypoint.y, 2, 0, 2 * Math.PI);
            ctx.fill();
          });
        } else {
          setFaceDetected(false);
        }
      } catch (error) {
        console.error('Face detection error:', error);
      }

      animationRef.current = requestAnimationFrame(detectFaces);
    };

    initializeDetector().then(() => {
      animationRef.current = requestAnimationFrame(detectFaces);
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (detectorRef.current) {
        detectorRef.current = null;
      }
    };
  }, [videoElement, canvasElement, setFaceDetected]);

  return null;
};