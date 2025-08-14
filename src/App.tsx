import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WebcamFeed } from '@/components/WebcamFeed';
import { HydrationStats } from '@/components/HydrationStats';
import { LoadingScreen } from '@/components/LoadingScreen';
import { SettingsModal } from '@/components/SettingsModal';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { useObjectDetection } from '@/hooks/useObjectDetection';
import { useDrinkingDetection } from '@/hooks/useDrinkingDetection';
import { useCanvasRenderer } from '@/hooks/useCanvasRenderer';
import { useHydrationReminder } from '@/hooks/useHydrationReminder';
import { useHydrationStore } from '@/store/hydrationStore';
import { Clock } from 'lucide-react';
import logo from '@/assets/logo.png';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
};

function App() {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isFullyInitialized = useHydrationStore((state) => state.isFullyInitialized());
  const webcamReady = useHydrationStore((state) => state.webcamReady);
  const faceDetectorReady = useHydrationStore((state) => state.faceDetectorReady);
  const objectDetectorReady = useHydrationStore((state) => state.objectDetectorReady);
  const hydrationIntervalMinutes = useHydrationStore((state) => state.hydrationIntervalMinutes);

  // Debug logging
  useEffect(() => {
    console.log('Initialization status:', {
      webcamReady,
      faceDetectorReady,
      objectDetectorReady,
      isFullyInitialized
    });
  }, [webcamReady, faceDetectorReady, objectDetectorReady, isFullyInitialized]);

  useFaceDetection(videoElement);
  useObjectDetection(videoElement);
  useDrinkingDetection();
  useCanvasRenderer(canvasRef.current);
  useHydrationReminder();

  return (
    <>
      {/* Show loading screen as overlay while models initialize */}
      {!isFullyInitialized && <LoadingScreen />}

      {/* Main UI - render but hide during initialization */}
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 ${!isFullyInitialized ? 'opacity-0 pointer-events-none' : ''}`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        {/* Header */}
        <motion.header 
          variants={itemVariants}
          className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
        >
          <div className="container mx-auto px-4 py-4 md:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.img 
                  src={logo} 
                  alt="Hydrovisor Logo" 
                  className="h-10 w-10 md:h-12 md:w-12"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                />
                <div>
                  <h1 
                    className="text-3xl md:text-4xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                    style={{ fontFamily: 'Righteous, cursive' }}
                  >
                    Hydrovisor
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    Your AI hydration companion
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSettingsOpen(true)}
                  className="flex items-center gap-3 px-5 py-3 rounded-lg bg-purple-50/80 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer border border-purple-200 dark:border-purple-800"
                >
                  <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Interval</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {hydrationIntervalMinutes} min
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            {/* Webcam Section */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-7 xl:col-span-8"
            >
              <WebcamFeed 
                onVideoRef={setVideoElement} 
                canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
              />
            </motion.div>

            {/* Stats Section */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-5 xl:col-span-4"
            >
              <HydrationStats />
            </motion.div>
          </div>
        </main>

      </motion.div>
    </div>
    
    {/* Settings Modal */}
    <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

export default App;