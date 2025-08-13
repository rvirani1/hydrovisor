import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHydrationStore } from '@/store/hydrationStore';
import { Clock, Droplets, AlertTriangle } from 'lucide-react';

export const TimeSinceLastDrink: React.FC = () => {
  const { getTimeSinceLastHydration, isOverdue, hydrationIntervalMinutes, isTracking, lastHydrationTime } = useHydrationStore();
  const [, forceUpdate] = useState(0);

  // Update component every second for real-time display
  useEffect(() => {
    const timer = setInterval(() => {
      forceUpdate(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeSinceLastDrinkSeconds = getTimeSinceLastHydration();
  const overdue = isOverdue();

  const formatTime = (totalSeconds: number | null): string => {
    if (totalSeconds === null) return 'Never';
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  };

  const getStatusColor = () => {
    if (timeSinceLastDrinkSeconds === null) return 'from-gray-500 to-gray-600';
    if (overdue) return 'from-red-500 to-red-600';
    const timeSinceMinutes = Math.floor(timeSinceLastDrinkSeconds / 60);
    if (timeSinceMinutes >= hydrationIntervalMinutes * 0.8) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const getStatusText = () => {
    if (timeSinceLastDrinkSeconds === null) {
      return isTracking ? 'Tracking started' : 'Not tracking';
    }
    if (overdue) return 'Time to hydrate!';
    const timeSinceMinutes = Math.floor(timeSinceLastDrinkSeconds / 60);
    if (timeSinceMinutes >= hydrationIntervalMinutes * 0.8) return 'Drink soon';
    if (lastHydrationTime) return 'Well hydrated';
    return 'No drinks yet';
  };

  const getIcon = () => {
    if (timeSinceLastDrinkSeconds === null) return <Clock className="h-5 w-5" />;
    if (overdue) return <AlertTriangle className="h-5 w-5" />;
    return <Droplets className="h-5 w-5" />;
  };

  // Don't show the component when tracking is off
  if (!isTracking) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50"
      >
        <div className={`
          bg-gradient-to-r ${getStatusColor()} 
          text-white px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-2xl backdrop-blur-sm 
          transition-all duration-300 hover:scale-105 cursor-pointer
          ${overdue ? 'animate-pulse' : ''}
        `}>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: overdue ? [0, -10, 10, -10, 10, 0] : 0 }}
              transition={{ repeat: overdue ? Infinity : 0, duration: 2 }}
              className="text-white/90"
            >
              {getIcon()}
            </motion.div>
            <div className="flex-1">
              <div className="text-xs font-medium opacity-90">
                {getStatusText()}
              </div>
              <div className="text-lg md:text-xl font-bold">
                {formatTime(timeSinceLastDrinkSeconds)}
              </div>
            </div>
            {overdue && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="hidden md:block"
              >
                <span className="text-2xl">💧</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};