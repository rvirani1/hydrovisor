import React from 'react';
import { useHydrationStore } from '../store/hydrationStore';

export const HydrationStats: React.FC = () => {
  const {
    hydrationEvents,
    getTimeSinceLastHydration,
    isOverdue,
    getTodayHydrationCount,
    hydrationIntervalMinutes,
    isDrinking,
    faceDetected,
    objectDetected,
    currentObject,
  } = useHydrationStore();

  const timeSinceLastHydration = getTimeSinceLastHydration();
  const overdue = isOverdue();
  const todayCount = getTodayHydrationCount();

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Hydration Tracker</h2>
      
      <div className="flex gap-3 mb-6">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
          faceDetected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            faceDetected ? 'bg-green-500' : 'bg-gray-400'
          }`}></span>
          Face Detected
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
          objectDetected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            objectDetected ? 'bg-green-500' : 'bg-gray-400'
          }`}></span>
          {currentObject ? `${currentObject} Detected` : 'Object Detected'}
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
          isDrinking ? 'bg-orange-100 text-orange-700 animate-pulse' : 'bg-gray-100 text-gray-600'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isDrinking ? 'bg-orange-500 animate-blink' : 'bg-gray-400'
          }`}></span>
          {isDrinking ? 'Drinking!' : 'Not Drinking'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <h3 className="text-xs font-medium text-gray-600 mb-2">Today's Hydration</h3>
          <div className="text-3xl font-bold text-gray-800">{todayCount}</div>
          <div className="text-xs text-gray-500 mt-1">drinks</div>
        </div>

        <div className={`p-4 rounded-lg text-center ${
          overdue ? 'bg-red-50 border-2 border-red-300' : 'bg-gray-50'
        }`}>
          <h3 className="text-xs font-medium text-gray-600 mb-2">Time Since Last Drink</h3>
          <div className={`text-3xl font-bold ${overdue ? 'text-red-600' : 'text-gray-800'}`}>
            {timeSinceLastHydration !== null ? `${timeSinceLastHydration}` : '--'}
          </div>
          <div className="text-xs text-gray-500 mt-1">minutes</div>
          {overdue && (
            <div className="text-red-600 font-semibold mt-2 animate-pulse-slow">
              ⚠️ Time to hydrate!
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <h3 className="text-xs font-medium text-gray-600 mb-2">Target Interval</h3>
          <div className="text-3xl font-bold text-gray-800">{hydrationIntervalMinutes}</div>
          <div className="text-xs text-gray-500 mt-1">minutes</div>
        </div>
      </div>

      {hydrationEvents.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Hydration Events</h3>
          <ul className="space-y-2">
            {hydrationEvents.slice(-5).reverse().map((event, index) => (
              <li key={index} className="bg-gray-50 px-3 py-2 rounded-md text-sm text-gray-600">
                {new Date(event.timestamp).toLocaleTimeString()} - {event.detectedObject}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};