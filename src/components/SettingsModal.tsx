import React from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useHydrationStore } from '@/store/hydrationStore';
import { Settings, RotateCcw, Timer, Volume2, Camera } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { AVAILABLE_MODELS } from '@/constants';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ open, onOpenChange }) => {
  const {
    hydrationIntervalMinutes,
    setHydrationInterval,
    soundEnabled,
    setSoundEnabled,
    modelVersion,
    setModelVersion,
    reset,
  } = useHydrationStore();

  const handleIntervalChange = (value: number[]) => {
    setHydrationInterval(value[0]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure your hydration preferences
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Interval Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Reminder Interval
              </label>
              <span className="text-sm font-bold text-gray-700 dark:text-blue-400">
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
                    className="w-full text-xs cursor-pointer"
                  >
                    {minutes}m
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sound Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="sound-toggle" 
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 cursor-pointer"
              >
                <Volume2 className="h-4 w-4" />
                Notification Sound
              </label>
              <Switch
                id="sound-toggle"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Play a sound when it's time to hydrate
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Detection Model
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_MODELS.map((model) => (
                <motion.div 
                  key={model.versionNumber} 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={modelVersion === model.versionNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setModelVersion(model.versionNumber)}
                    className="w-full text-xs cursor-pointer"
                    title={model.description}
                  >
                    {model.name}
                  </Button>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Changes require page reload
            </p>
          </div>

          {/* Reset Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={reset}
              variant="outline"
              className="w-full cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Stats
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};