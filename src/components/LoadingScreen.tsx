import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useHydrationStore } from '@/store/hydrationStore';
import { requestNotificationPermission, checkNotificationSupport } from '@/utils/notifications';

export const LoadingScreen: React.FC = () => {
  const { webcamReady, faceDetectorReady, objectDetectorReady, notificationPermission, setNotificationPermission } = useHydrationStore();
  const [permissionRequested, setPermissionRequested] = useState(false);
  
  const supportsNotifications = checkNotificationSupport();
  const notificationReady = !supportsNotifications || notificationPermission !== null;
  
  const loadingSteps = [
    { label: 'Camera', ready: webcamReady },
    { label: 'Face Detection', ready: faceDetectorReady },
    { label: 'Object Detection', ready: objectDetectorReady },
    ...(supportsNotifications ? [{ label: 'Notifications', ready: notificationReady }] : []),
  ];

  useEffect(() => {
    const requestPermission = async () => {
      if (!permissionRequested && supportsNotifications) {
        setPermissionRequested(true);
        const permission = await requestNotificationPermission();
        setNotificationPermission(permission);
      }
    };
    
    requestPermission();
  }, [permissionRequested, supportsNotifications, setNotificationPermission]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className="text-center">
        {/* Animated Water Drop Logo */}
        <motion.div
          className="mb-8 inline-block"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            className="filter drop-shadow-2xl"
          >
            <defs>
              <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <motion.path
              d="M60 20 C60 20, 30 50, 30 75 C30 95, 45 110, 60 110 C75 110, 90 95, 90 75 C90 50, 60 20, 60 20"
              fill="url(#waterGradient)"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "reverse"
              }}
            />
            <motion.circle
              cx="65"
              cy="75"
              r="8"
              fill="white"
              opacity="0.6"
              animate={{
                y: [0, -10, 0],
                opacity: [0.6, 0.3, 0.6],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </svg>
        </motion.div>

        <motion.h1
          className="text-5xl text-white mb-2"
          style={{ fontFamily: 'Righteous, cursive' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Hydrovisor
        </motion.h1>
        
        <motion.p
          className="text-slate-400 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Initializing your hydration assistant...
        </motion.p>

        {/* Loading Steps */}
        <div className="space-y-3 mb-8">
          {loadingSteps.map((step, index) => (
            <motion.div
              key={step.label}
              className="flex items-center justify-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <div className="w-32 text-right text-white font-medium">
                {step.label}
              </div>
              <div className="w-8 h-8 relative">
                {step.ready ? (
                  <motion.svg
                    className="w-8 h-8"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                    <motion.path
                      d="M9 16l4 4 8-8"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.svg>
                ) : (
                  <motion.div
                    className="w-8 h-8 border-3 border-blue-300 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Wave Animation at Bottom */}
        <motion.div
          className="absolute bottom-0 left-0 right-0"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          <svg
            className="w-full h-32"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,64 C320,100 420,20 720,60 C1020,100 1120,20 1440,60 L1440,120 L0,120 Z"
              fill="rgba(100, 116, 139, 0.15)"
            >
              <animate
                attributeName="d"
                values="M0,64 C320,100 420,20 720,60 C1020,100 1120,20 1440,60 L1440,120 L0,120 Z;M0,64 C320,20 420,100 720,60 C1020,20 1120,100 1440,60 L1440,120 L0,120 Z;M0,64 C320,100 420,20 720,60 C1020,100 1120,20 1440,60 L1440,120 L0,120 Z"
                dur="4s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
};