import React, { useState } from 'react';
import { useHydrationStore } from '../store/hydrationStore';

export const HydrationConfig: React.FC = () => {
  const {
    hydrationIntervalMinutes,
    setHydrationInterval,
    isTracking,
    setIsTracking,
    reset,
  } = useHydrationStore();

  const [tempInterval, setTempInterval] = useState(hydrationIntervalMinutes.toString());

  const handleIntervalChange = () => {
    const interval = parseInt(tempInterval);
    if (!isNaN(interval) && interval > 0) {
      setHydrationInterval(interval);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Configuration</h2>
      
      <div className="mb-6">
        <label className="flex flex-col gap-2 text-gray-600 font-medium">
          Hydration Interval (minutes):
          <input
            type="number"
            value={tempInterval}
            onChange={(e) => setTempInterval(e.target.value)}
            onBlur={handleIntervalChange}
            min="1"
            max="120"
            className="p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-purple-500"
          />
        </label>
      </div>


      <div className="flex gap-4 mt-6">
        <button
          onClick={() => setIsTracking(!isTracking)}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
            isTracking 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </button>
        
        <button 
          onClick={reset} 
          className="flex-1 py-3 px-6 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
        >
          Reset Stats
        </button>
      </div>
    </div>
  );
};