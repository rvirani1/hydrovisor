import React, { useState } from 'react';
import { useHydrationStore } from '../store/hydrationStore';

interface HydrationConfigProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  modelId: string;
  setModelId: (id: string) => void;
}

export const HydrationConfig: React.FC<HydrationConfigProps> = ({
  apiKey,
  setApiKey,
  modelId,
  setModelId,
}) => {
  const {
    hydrationIntervalMinutes,
    setHydrationInterval,
    isTracking,
    setIsTracking,
    reset,
  } = useHydrationStore();

  const [tempInterval, setTempInterval] = useState(hydrationIntervalMinutes.toString());
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempModelId, setTempModelId] = useState(modelId);

  const handleIntervalChange = () => {
    const interval = parseInt(tempInterval);
    if (!isNaN(interval) && interval > 0) {
      setHydrationInterval(interval);
    }
  };

  const handleApiKeyChange = () => {
    setApiKey(tempApiKey);
  };

  const handleModelIdChange = () => {
    setModelId(tempModelId);
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

      <div className="mb-6">
        <label className="flex flex-col gap-2 text-gray-600 font-medium">
          Roboflow API Key:
          <input
            type="text"
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            onBlur={handleApiKeyChange}
            placeholder="Enter your Roboflow API key"
            className="p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-purple-500"
          />
        </label>
      </div>

      <div className="mb-6">
        <label className="flex flex-col gap-2 text-gray-600 font-medium">
          Roboflow Model ID:
          <input
            type="text"
            value={tempModelId}
            onChange={(e) => setTempModelId(e.target.value)}
            onBlur={handleModelIdChange}
            placeholder="e.g., drinking-detection/1"
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