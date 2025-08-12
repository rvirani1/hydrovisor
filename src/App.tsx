import React, { useState, useRef } from 'react';
import { WebcamFeed } from './components/WebcamFeed';
import { HydrationStats } from './components/HydrationStats';
import { HydrationConfig } from './components/HydrationConfig';
import { TimeSinceLastDrink } from './components/TimeSinceLastDrink';
import { useFaceDetection } from './hooks/useFaceDetection';
import { useObjectDetection } from './hooks/useObjectDetection';
import { useDrinkingDetection } from './hooks/useDrinkingDetection';
import { useCanvasRenderer } from './hooks/useCanvasRenderer';

function App() {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useFaceDetection(videoElement);
  useObjectDetection(videoElement);
  useDrinkingDetection();
  useCanvasRenderer(canvasRef.current);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 text-gray-800 text-center py-6 shadow-sm">
        <h1 className="text-4xl font-bold mb-2 text-blue-600">💧 Hydrovisor</h1>
        <p className="text-lg text-gray-600">Your personal hydration tracking assistant</p>
      </header>

      <div className="flex-1 flex gap-8 p-8 max-w-7xl mx-auto w-full">
        <div className="flex-1 flex justify-center items-start">
          <WebcamFeed 
            onVideoRef={setVideoElement} 
            canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
          />
        </div>

        <div className="w-96 flex flex-col gap-6">
          <HydrationConfig />
          <HydrationStats />
        </div>
      </div>
      
      <TimeSinceLastDrink />
    </div>
  );
}

export default App
