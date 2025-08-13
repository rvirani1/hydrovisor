import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useHydrationStore } from '@/store/hydrationStore';
import { Settings, Play, Pause, RotateCcw, Timer } from 'lucide-react';

export const HydrationConfig: React.FC = () => {
  const {
    hydrationIntervalMinutes,
    setHydrationInterval,
    isTracking,
    setIsTracking,
    reset,
  } = useHydrationStore();

  const handleIntervalChange = (value: number[]) => {
    setHydrationInterval(value[0]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle>Settings</CardTitle>
            </div>
            <Badge variant={isTracking ? "default" : "secondary"}>
              {isTracking ? "Tracking Active" : "Tracking Paused"}
            </Badge>
          </div>
          <CardDescription>Configure your hydration preferences</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Interval Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Reminder Interval
              </label>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {hydrationIntervalMinutes} min
              </span>
            </div>
            
            <Slider
              value={[hydrationIntervalMinutes]}
              onValueChange={handleIntervalChange}
              min={1}
              max={60}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 min</span>
              <span>30 min</span>
              <span>60 min</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setIsTracking(!isTracking)}
                variant={isTracking ? "destructive" : "default"}
                className="w-full"
              >
                {isTracking ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={reset}
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </motion.div>
          </div>

          {/* Quick Settings */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Quick Settings</p>
            <div className="grid grid-cols-3 gap-2">
              {[5, 15, 30].map((minutes) => (
                <motion.div key={minutes} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={hydrationIntervalMinutes === minutes ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHydrationInterval(minutes)}
                    className="w-full text-xs"
                  >
                    {minutes}m
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};