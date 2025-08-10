import React, { useState } from 'react';
import { useHydrationStore } from '../store/hydrationStore';

export const HydrationConfig: React.FC = () => {
  const {
    hydrationIntervalMinutes,
    setHydrationInterval,
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


      <div className="flex justify-center mt-6">
        <button 
          onClick={reset} 
          className="py-3 px-8 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
        >
          Reset Stats
        </button>
      </div>
    </div>
  );
};