import { useHydrationStore } from '../hydrationStore';
import { renderHook, act } from '@testing-library/react';

// Mock console.log to prevent test output pollution
const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

afterAll(() => {
  consoleSpy.mockRestore();
});

describe('hydrationStore', () => {
  beforeEach(() => {
    // Clear all store state before each test
    const { reset } = useHydrationStore.getState();
    act(() => {
      reset();
    });
    
    // Clear any persisted state
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      expect(result.current.hydrationEvents).toEqual([]);
      expect(result.current.hydrationIntervalMinutes).toBe(3);
      expect(result.current.firstHydrationTime).toBeNull();
      expect(result.current.lastHydrationTime).toBeNull();
      expect(result.current.webcamReady).toBe(false);
      expect(result.current.faceDetectorReady).toBe(false);
      expect(result.current.objectDetectorReady).toBe(false);
      expect(result.current.notificationPermission).toBeNull();
      expect(result.current.faceDetected).toBe(false);
      expect(result.current.faceBox).toBeNull();
      expect(result.current.faceKeypoints).toBeNull();
      expect(result.current.objectDetected).toBe(false);
      expect(result.current.objectDetections).toBeNull();
      expect(result.current.currentObject).toBeNull();
      expect(result.current.isDrinking).toBe(false);
      expect(result.current.drinkingStartTime).toBeNull();
    });

    it('should set trackingStartTime when webcam becomes ready', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      act(() => {
        result.current.setWebcamReady(true);
      });
      
      expect(result.current.webcamReady).toBe(true);
      expect(result.current.trackingStartTime).toBeInstanceOf(Date);
    });
  });

  describe('hydration events', () => {
    it('should add hydration event', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      act(() => {
        result.current.addHydrationEvent('cup');
      });
      
      expect(result.current.hydrationEvents).toHaveLength(1);
      expect(result.current.hydrationEvents[0].detectedObject).toBe('cup');
      expect(result.current.hydrationEvents[0].timestamp).toBeInstanceOf(Date);
      expect(result.current.lastHydrationTime).toBeInstanceOf(Date);
      expect(result.current.firstHydrationTime).toBeInstanceOf(Date);
    });

    it('should set firstHydrationTime only once', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      act(() => {
        result.current.addHydrationEvent('cup');
      });
      
      const firstTime = result.current.firstHydrationTime;
      
      // Wait a bit and add another event
      setTimeout(() => {
        act(() => {
          result.current.addHydrationEvent('bottle');
        });
        
        expect(result.current.firstHydrationTime).toBe(firstTime);
        expect(result.current.hydrationEvents).toHaveLength(2);
      }, 10);
    });

    it('should update lastHydrationTime with each event', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      act(() => {
        result.current.addHydrationEvent('cup');
      });
      
      const firstLastTime = result.current.lastHydrationTime;
      
      setTimeout(() => {
        act(() => {
          result.current.addHydrationEvent('bottle');
        });
        
        expect(result.current.lastHydrationTime).not.toBe(firstLastTime);
        expect(result.current.lastHydrationTime!.getTime()).toBeGreaterThan(firstLastTime!.getTime());
      }, 10);
    });
  });

  describe('settings', () => {
    it('should update hydration interval', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      act(() => {
        result.current.setHydrationInterval(60);
      });
      
      expect(result.current.hydrationIntervalMinutes).toBe(60);
    });
  });

  describe('device states', () => {
    it('should update webcam ready state', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      act(() => {
        result.current.setWebcamReady(true);
      });
      
      expect(result.current.webcamReady).toBe(true);
    });

    it('should update face detector ready state', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      act(() => {
        result.current.setFaceDetectorReady(true);
      });
      
      expect(result.current.faceDetectorReady).toBe(true);
    });

    it('should update object detector ready state', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      act(() => {
        result.current.setObjectDetectorReady(true);
      });
      
      expect(result.current.objectDetectorReady).toBe(true);
    });

    it('should update notification permission', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      act(() => {
        result.current.setNotificationPermission('granted');
      });
      
      expect(result.current.notificationPermission).toBe('granted');
    });
  });

  describe('detection states', () => {
    it('should update face detection state', () => {
      const { result } = renderHook(() => useHydrationStore());
      const mockBox = { xMin: 10, yMin: 20, width: 100, height: 120 };
      const mockKeypoints = [{ x: 50, y: 60 }];
      
      act(() => {
        result.current.setFaceDetected(true, mockBox, mockKeypoints);
      });
      
      expect(result.current.faceDetected).toBe(true);
      expect(result.current.faceBox).toEqual(mockBox);
      expect(result.current.faceKeypoints).toEqual(mockKeypoints);
    });

    it('should update object detection state', () => {
      const { result } = renderHook(() => useHydrationStore());
      const mockDetections = [{ class: 'cup', confidence: 0.8, x: 100, y: 200, width: 50, height: 60 }];
      
      act(() => {
        result.current.setObjectDetected(true, 'cup', mockDetections);
      });
      
      expect(result.current.objectDetected).toBe(true);
      expect(result.current.currentObject).toBe('cup');
      expect(result.current.objectDetections).toEqual(mockDetections);
    });

    it('should update drinking state', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      act(() => {
        result.current.setIsDrinking(true);
      });
      
      expect(result.current.isDrinking).toBe(true);
    });
  });

  describe('drinking workflow', () => {
    it('should start drinking and add hydration event', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      // Set up current object first
      act(() => {
        result.current.setObjectDetected(true, 'bottle');
      });
      
      act(() => {
        result.current.startDrinking();
      });
      
      expect(result.current.isDrinking).toBe(true);
      expect(result.current.drinkingStartTime).toBeInstanceOf(Date);
      expect(result.current.hydrationEvents).toHaveLength(1);
      expect(result.current.hydrationEvents[0].detectedObject).toBe('bottle');
    });

    it('should not add duplicate events when already drinking', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      act(() => {
        result.current.setObjectDetected(true, 'cup');
        result.current.startDrinking();
      });
      
      expect(result.current.hydrationEvents).toHaveLength(1);
      
      // Try to start drinking again
      act(() => {
        result.current.startDrinking();
      });
      
      expect(result.current.hydrationEvents).toHaveLength(1); // Should still be 1
    });

    it('should stop drinking', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      act(() => {
        result.current.setObjectDetected(true, 'cup');
        result.current.startDrinking();
      });
      
      expect(result.current.isDrinking).toBe(true);
      
      act(() => {
        result.current.stopDrinking();
      });
      
      expect(result.current.isDrinking).toBe(false);
      expect(result.current.drinkingStartTime).toBeNull();
    });

    it('should use default object type when none set', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      act(() => {
        result.current.startDrinking();
      });
      
      expect(result.current.hydrationEvents).toHaveLength(1);
      expect(result.current.hydrationEvents[0].detectedObject).toBe('cup'); // default
    });
  });

  describe('time calculations', () => {
    it('should calculate time since last hydration', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      // Add a hydration event
      act(() => {
        result.current.addHydrationEvent('cup');
      });
      
      const timeSince = result.current.getTimeSinceLastHydration();
      expect(timeSince).toBeGreaterThanOrEqual(0);
      expect(typeof timeSince).toBe('number');
    });

    it('should return null when no tracking started', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      const timeSince = result.current.getTimeSinceLastHydration();
      expect(timeSince).toBeNull();
    });

    it('should calculate time since tracking start when no hydration events', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      act(() => {
        result.current.setWebcamReady(true); // This sets trackingStartTime
      });
      
      const timeSince = result.current.getTimeSinceLastHydration();
      expect(timeSince).toBeGreaterThanOrEqual(0);
      expect(typeof timeSince).toBe('number');
    });

    it('should detect overdue status', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      // Set interval to 1 minute for testing
      act(() => {
        result.current.setHydrationInterval(1);
        result.current.setWebcamReady(true);
      });
      
      // Mock Date to simulate time passing
      const originalDate = Date.now;
      const mockDate = jest.fn();
      Date.now = mockDate;
      
      // Simulate 2 minutes ago
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      
      // Mock the store's tracking start time to be 2 minutes ago
      act(() => {
        result.current.trackingStartTime = twoMinutesAgo;
      });
      
      mockDate.mockReturnValue(Date.now());
      
      expect(result.current.isOverdue()).toBe(true);
      
      Date.now = originalDate;
    });

    it('should not be overdue when within interval', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      act(() => {
        result.current.setHydrationInterval(60); // 1 hour
        result.current.setWebcamReady(true);
      });
      
      expect(result.current.isOverdue()).toBe(false);
    });
  });

  describe('today hydration count', () => {
    it('should count todays hydration events', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      act(() => {
        result.current.addHydrationEvent('cup');
        result.current.addHydrationEvent('bottle');
      });
      
      expect(result.current.getTodayHydrationCount()).toBe(2);
    });

    it('should filter out events from other days', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      // Add an event from yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      act(() => {
        result.current.hydrationEvents = [
          { timestamp: yesterday, detectedObject: 'cup' }
        ];
        result.current.addHydrationEvent('bottle'); // Today's event
      });
      
      expect(result.current.getTodayHydrationCount()).toBe(1); // Only today's event
    });
  });

  describe('initialization status', () => {
    it('should return false when not fully initialized', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      expect(result.current.isFullyInitialized()).toBe(false);
    });

    it('should return true when fully initialized', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      act(() => {
        result.current.setWebcamReady(true);
        result.current.setFaceDetectorReady(true);
        result.current.setObjectDetectorReady(true);
        result.current.setNotificationPermission('granted');
      });
      
      expect(result.current.isFullyInitialized()).toBe(true);
    });
  });

  describe('reset functionality', () => {
    it('should reset relevant state while preserving system state', () => {
      const { result } = renderHook(() => useHydrationStore());
      
      // Set up some state
      act(() => {
        result.current.addHydrationEvent('cup');
        result.current.setFaceDetected(true, { xMin: 0, yMin: 0, width: 100, height: 100 });
        result.current.setObjectDetected(true, 'bottle');
        result.current.startDrinking();
        result.current.setWebcamReady(true);
      });
      
      const trackingStartTime = result.current.trackingStartTime;
      
      act(() => {
        result.current.reset();
      });
      
      // Should reset hydration data
      expect(result.current.hydrationEvents).toEqual([]);
      expect(result.current.firstHydrationTime).toBeNull();
      expect(result.current.lastHydrationTime).toBeNull();
      expect(result.current.faceDetected).toBe(false);
      expect(result.current.objectDetected).toBe(false);
      expect(result.current.isDrinking).toBe(false);
      
      // Should preserve system state
      expect(result.current.trackingStartTime).toBe(trackingStartTime);
      expect(result.current.webcamReady).toBe(true);
    });
  });
});