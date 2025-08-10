import React, { useState, useRef } from 'react';
import { WebcamFeed } from './components/WebcamFeed';
import { HydrationStats } from './components/HydrationStats';
import { HydrationConfig } from './components/HydrationConfig';
import { useFaceDetection } from './hooks/useFaceDetection';
import { useObjectDetection } from './hooks/useObjectDetection';
import { useDrinkingDetection } from './hooks/useDrinkingDetection';
import { useHydrationStore } from './store/hydrationStore';

function App() {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [modelId, setModelId] = useState<string>('');
  const isTracking = useHydrationStore((state) => state.isTracking);

  useFaceDetection(isTracking ? videoElement : null, canvasRef.current);
  useObjectDetection(
    isTracking ? videoElement : null, 
    canvasRef.current, 
    isTracking ? apiKey : null, 
    isTracking ? modelId : null
  );
  useDrinkingDetection();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 flex flex-col">
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 text-white text-center py-6">
        <h1 className="text-4xl font-bold mb-2">💧 Hydrovisor</h1>
        <p className="text-lg opacity-90">Your personal hydration tracking assistant</p>
      </header>

      <div className="flex-1 flex gap-8 p-8 max-w-7xl mx-auto w-full">
        <div className="flex-1 flex justify-center items-start">
          <WebcamFeed 
            onVideoRef={setVideoElement} 
            canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
          />
        </div>

        <div className="w-96 flex flex-col gap-6">
          <HydrationConfig
            apiKey={apiKey}
            setApiKey={setApiKey}
            modelId={modelId}
            setModelId={setModelId}
          />
          <HydrationStats />
        </div>
      </div>
    </div>
  );
}

export default App
