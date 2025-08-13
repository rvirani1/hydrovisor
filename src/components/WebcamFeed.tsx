import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useHydrationStore } from '@/store/hydrationStore';
import { Camera, CameraOff } from 'lucide-react';

interface WebcamFeedProps {
  onVideoRef: (video: HTMLVideoElement) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const WebcamFeed: React.FC<WebcamFeedProps> = ({ onVideoRef, canvasRef }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setWebcamReady } = useHydrationStore();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const setupWebcam = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      // Guard against null video ref
      if (!videoRef.current) {
        console.warn('Video ref became null during setup');
        return;
      }
      
      videoRef.current.srcObject = stream;
      
      await new Promise<void>((resolve) => {
        if (!videoRef.current) return;
        videoRef.current.onloadedmetadata = () => {
          resolve();
        };
      });

      await videoRef.current.play();
      console.log('Webcam ready');
      setWebcamReady(true);
      onVideoRef(videoRef.current);
      setError(null);
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setError('Unable to access camera. Please check permissions.');
      setWebcamReady(false);
    } finally {
      setLoading(false);
    }
  }, [onVideoRef, setWebcamReady]);

  useEffect(() => {
    // Prevent multiple webcam setups
    let isMounted = true;
    
    const initWebcam = async () => {
      if (isMounted) {
        await setupWebcam();
      }
    };
    
    initWebcam();

    return () => {
      isMounted = false;
      const videoElement = videoRef.current;
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      setWebcamReady(false);
    };
  }, [setupWebcam, setWebcamReady]);

  return (
    <div className="relative w-full">
      <motion.div 
        className="relative rounded-xl overflow-hidden bg-gray-900 aspect-[4/3] md:aspect-video"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3 animate-pulse" />
              <p className="text-gray-400 text-sm">Initializing camera...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <CameraOff className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-400 text-sm px-4">{error}</p>
              <button 
                onClick={setupWebcam}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="block w-full h-full object-cover scale-x-[-1]"
          autoPlay
          playsInline
          muted
        />
        
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full scale-x-[-1] pointer-events-none"
          width={640}
          height={480}
        />

        {/* Status Indicators */}
        <div className="absolute top-3 left-3 flex gap-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full flex items-center gap-1.5"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-white font-medium">Live</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};