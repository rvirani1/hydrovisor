import React, { useState, useEffect } from 'react';
import { useHydrationStore } from '../store/hydrationStore';

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
    if (timeSinceLastDrinkSeconds === null) return 'bg-gray-500';
    if (overdue) return 'bg-red-500';
    const timeSinceMinutes = Math.floor(timeSinceLastDrinkSeconds / 60);
    if (timeSinceMinutes >= hydrationIntervalMinutes * 0.8) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (timeSinceLastDrinkSeconds === null) {
      return isTracking ? 'Tracking started' : 'Not tracking';
    }
    if (overdue) return 'Time to drink!';
    const timeSinceMinutes = Math.floor(timeSinceLastDrinkSeconds / 60);
    if (timeSinceMinutes >= hydrationIntervalMinutes * 0.8) return 'Drink soon';
    if (lastHydrationTime) return 'Hydrated';
    return 'No drinks yet';
  };

  // Don't show the component when tracking is off
  if (!isTracking) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className={`
        ${getStatusColor()} 
        text-white px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm 
        transition-all duration-300 hover:scale-105
        ${overdue ? 'animate-pulse-slow' : ''}
      `}>
        <div className="flex items-center gap-3">
          <div className="text-2xl">
            {timeSinceLastDrinkSeconds === null ? '🚰' : overdue ? '⚠️' : '💧'}
          </div>
          <div>
            <div className="text-xs font-medium opacity-90">
              {getStatusText()}
            </div>
            <div className="text-lg font-bold">
              {formatTime(timeSinceLastDrinkSeconds)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};