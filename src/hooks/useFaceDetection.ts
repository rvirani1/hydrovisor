import { useEffect, useRef } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@mediapipe/face_mesh';
import { useHydrationStore } from '../store/hydrationStore';
import { FRAME_RATES } from '../constants';

const FACE_FRAME_INTERVAL = 1000 / FRAME_RATES.faceDetection;
const FACE_PERSISTENCE_TIMEOUT = 1000; // 1 second grace period for face detection

export const useFaceDetection = (
  videoElement: HTMLVideoElement | null
) => {
  const detectorRef = useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const animationRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const lastFaceDetectedAtRef = useRef<number>(0);
  const setFaceDetected = useHydrationStore((state) => state.setFaceDetected);
  const setFaceDetectorReady = useHydrationStore((state) => state.setFaceDetectorReady);

  useEffect(() => {
    if (!videoElement) return;

    const initializeDetector = async () => {
      try {
        console.log('Initializing face detector...');
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshMediaPipeModelConfig = {
          runtime: 'mediapipe',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
          maxFaces: 1,
          refineLandmarks: false,
        };

        detectorRef.current = await faceLandmarksDetection.createDetector(model, detectorConfig);
        console.log('Face detector initialized successfully');
        setFaceDetectorReady(true);
      } catch (error) {
        console.error('Failed to initialize face detector:', error);
        setFaceDetectorReady(false);
      }
    };

    const detectFaces = async (currentTime: number) => {
      if (!detectorRef.current || !videoElement) {
        animationRef.current = requestAnimationFrame(detectFaces);
        return;
      }

      // Frame rate limiting - only process if enough time has passed
      if (currentTime - lastFrameTimeRef.current < FACE_FRAME_INTERVAL) {
        animationRef.current = requestAnimationFrame(detectFaces);
        return;
      }

      lastFrameTimeRef.current = currentTime;

      try {
        const faces = await detectorRef.current.estimateFaces(videoElement);
        
        if (faces.length > 0) {
          const face = faces[0];
          setFaceDetected(true, face.box || null, face.keypoints || null);
          lastFaceDetectedAtRef.current = currentTime;
        } else {
          // Check if we should clear the face
          const timeSinceLastFace = currentTime - lastFaceDetectedAtRef.current;
          
          if (timeSinceLastFace >= FACE_PERSISTENCE_TIMEOUT) {
            // Enough time has passed, clear the face
            setFaceDetected(false, null, null);
          }
          // Otherwise, do nothing - keep the current state
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
        setFaceDetectorReady(false);
      }
    };
  }, [videoElement, setFaceDetected, setFaceDetectorReady]);

  return null;
};