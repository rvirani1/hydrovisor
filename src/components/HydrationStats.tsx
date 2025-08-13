import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHydrationStore } from '@/store/hydrationStore';
import { Droplets, TrendingUp, Clock, AlertTriangle, CheckCircle2, Coffee } from 'lucide-react';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle>Hydration Stats</CardTitle>
            </div>
            <div className="flex gap-2">
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
          </div>
          <CardDescription>Track your daily hydration goals</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Time until next drink</span>
              <span className="font-medium">
                {timeSinceLastHydrationSeconds !== null 
                  ? `${Math.floor(timeSinceLastHydrationSeconds / 60)}m ${timeSinceLastHydrationSeconds % 60}s`
                  : '--'}
              </span>
            </div>
            <Progress 
              value={100 - progressPercentage} 
              className="h-2"
            />
            {overdue && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Alert className="border-0 bg-orange-50/50 dark:bg-orange-900/10">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
                    Time to hydrate! You're overdue for a drink.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/10"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Today's Count</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{todayCount}</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">drinks</div>
            </motion.div>

            <motion.div 
              className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/10"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Target Interval</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{hydrationIntervalMinutes}</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">minutes</div>
            </motion.div>
          </div>

          {/* Recent Events */}
          {hydrationEvents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                Recent Drinks
              </h3>
              <div className="space-y-1.5">
                {hydrationEvents.slice(-3).reverse().map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-sm"
                  >
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {event.detectedObject}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};