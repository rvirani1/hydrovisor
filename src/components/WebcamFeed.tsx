import React, { useRef, useEffect, useCallback } from 'react';
import { useHydrationStore } from '../store/hydrationStore';

interface WebcamFeedProps {
  onVideoRef: (video: HTMLVideoElement) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const WebcamFeed: React.FC<WebcamFeedProps> = ({ onVideoRef, canvasRef }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setWebcamReady, setIsTracking, isTracking } = useHydrationStore();

  const setupWebcam = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        },
        audio: false
      });

      videoRef.current.srcObject = stream;
      
      await new Promise<void>((resolve) => {
        if (!videoRef.current) return;
        videoRef.current.onloadedmetadata = () => {
          resolve();
        };
      });

      await videoRef.current.play();
      setWebcamReady(true);
      onVideoRef(videoRef.current);
      
      // Auto-start tracking when webcam is ready
      if (!isTracking) {
        setIsTracking(true);
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setWebcamReady(false);
    }
  }, [onVideoRef, setWebcamReady, setIsTracking, isTracking]);

  useEffect(() => {
    const videoElement = videoRef.current;
    setupWebcam();

    return () => {
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      setWebcamReady(false);
    };
  }, [setupWebcam, setWebcamReady]);

  return (
    <div className="relative rounded-xl overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        className="block scale-x-[-1]"
        width={640}
        height={480}
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 scale-x-[-1] pointer-events-none"
        width={640}
        height={480}
      />
    </div>
  );
};