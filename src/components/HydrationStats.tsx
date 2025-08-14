import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useHydrationStore } from '@/store/hydrationStore';
import { Droplets, Coffee } from 'lucide-react';

export const HydrationStats: React.FC = () => {
  const {
    hydrationEvents,
    getTimeSinceLastHydration,
    isOverdue,
    getTodayHydrationCount,
    hydrationIntervalMinutes,
    isDrinking,
    objectDetected,
  } = useHydrationStore();

  const timeSinceLastHydrationSeconds = getTimeSinceLastHydration();
  const overdue = isOverdue();
  const todayCount = getTodayHydrationCount();
  const progressPercentage = timeSinceLastHydrationSeconds !== null 
    ? Math.min((timeSinceLastHydrationSeconds / 60 / hydrationIntervalMinutes) * 100, 100)
    : 0;

  // Calculate time remaining until next drink
  const timeRemaining = timeSinceLastHydrationSeconds !== null
    ? Math.max(0, (hydrationIntervalMinutes * 60) - timeSinceLastHydrationSeconds)
    : hydrationIntervalMinutes * 60;
  
  const minutesRemaining = Math.floor(timeRemaining / 60);
  const secondsRemaining = timeRemaining % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-6"
    >
      {/* Countdown Timer - Not in a card */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Badge 
            variant={objectDetected ? "default" : "secondary"}
            className={objectDetected ? "bg-green-500 hover:bg-green-600" : ""}
          >
            <Coffee className="h-3 w-3 mr-1" />
            {objectDetected ? "Cup Detected" : "No Cup"}
          </Badge>
          {isDrinking && (
            <Badge className="bg-orange-500 hover:bg-orange-600 animate-pulse">
              Drinking
            </Badge>
          )}
        </div>
        
        <div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {overdue ? "Overdue! Time to hydrate" : "Next drink in"}
          </div>
          <div className={`text-6xl font-bold tabular-nums ${
            overdue 
              ? "text-red-600 dark:text-red-400 animate-pulse" 
              : "text-gray-900 dark:text-gray-100"
          }`}>
            {overdue ? (
              <span>Drink Now!</span>
            ) : (
              <span>{minutesRemaining}:{secondsRemaining.toString().padStart(2, '0')}</span>
            )}
          </div>
        </div>

        <Progress 
          value={100 - progressPercentage} 
          className="h-3"
        />
      </div>

      {/* Today's Drinks Card */}
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle>Today's Hydration</CardTitle>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {todayCount}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-2">

          {/* Drink Times */}
          {hydrationEvents.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {hydrationEvents.map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className=""
                  >
                    <Badge 
                      variant="secondary" 
                      className="text-xs font-light px-3 py-1.5 bg-opacity-50 border border-gray-200"
                    >
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Coffee className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Start drinking to track your hydration</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};