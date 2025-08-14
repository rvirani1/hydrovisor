import { renderHook, act } from '@testing-library/react';
import { useDrinkingDetection } from '../useDrinkingDetection';
import { useHydrationStore } from '../../store/hydrationStore';
import * as overlapDetection from '../../utils/overlapDetection';

// Mock the overlap detection module
jest.mock('../../utils/overlapDetection');
const mockDetectDrinking = overlapDetection.detectDrinking as jest.MockedFunction<typeof overlapDetection.detectDrinking>;

// Mock console.log
const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

afterAll(() => {
  consoleSpy.mockRestore();
});

describe('useDrinkingDetection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset store state
    const { reset } = useHydrationStore.getState();
    act(() => {
      reset();
    });
    
    // Mock timers for testing debounce behavior
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not start drinking immediately on first overlap', () => {
    mockDetectDrinking.mockReturnValue({ isDrinking: true, drinkingObject: null });
    
    const { result: storeResult } = renderHook(() => useHydrationStore());
    const startDrinkingSpy = jest.spyOn(storeResult.current, 'startDrinking');
    
    // Set up face and object detections
    act(() => {
      storeResult.current.setFaceDetected(true, null, [{ x: 100, y: 100 }]);
      storeResult.current.setObjectDetected(true, 'cup', [{ class: 'cup', confidence: 0.8, x: 100, y: 100, width: 50, height: 50 }]);
    });

    renderHook(() => useDrinkingDetection());
    
    // Should not start drinking immediately (needs minimum frames)
    expect(startDrinkingSpy).not.toHaveBeenCalled();
  });

  it('should start drinking after minimum overlap frames', () => {
    mockDetectDrinking.mockReturnValue({ isDrinking: true, drinkingObject: null });
    
    const { result: storeResult } = renderHook(() => useHydrationStore());
    const startDrinkingSpy = jest.spyOn(storeResult.current, 'startDrinking');
    
    // Set up detections
    act(() => {
      storeResult.current.setFaceDetected(true, null, [{ x: 100, y: 100 }]);
      storeResult.current.setObjectDetected(true, 'cup', [{ class: 'cup', confidence: 0.8, x: 100, y: 100, width: 50, height: 50 }]);
    });

    const { rerender } = renderHook(() => useDrinkingDetection());
    
    // Simulate multiple detections
    for (let i = 0; i < 4; i++) {
      act(() => {
        jest.advanceTimersByTime(150); // Advance past rate limit
      });
      rerender();
    }
    
    expect(startDrinkingSpy).toHaveBeenCalled();
  });

  it('should stop drinking after debounce period without overlap', () => {
    mockDetectDrinking
      .mockReturnValueOnce({ isDrinking: true, drinkingObject: null })
      .mockReturnValue({ isDrinking: false, drinkingObject: null });
    
    const { result: storeResult } = renderHook(() => useHydrationStore());
    const stopDrinkingSpy = jest.spyOn(storeResult.current, 'stopDrinking');
    
    // Set up initial state with drinking
    act(() => {
      storeResult.current.setFaceDetected(true, null, [{ x: 100, y: 100 }]);
      storeResult.current.setObjectDetected(true, 'cup', [{ class: 'cup', confidence: 0.8, x: 100, y: 100, width: 50, height: 50 }]);
      storeResult.current.setIsDrinking(true);
    });

    const { rerender } = renderHook(() => useDrinkingDetection());
    
    // Simulate no overlap
    act(() => {
      jest.advanceTimersByTime(600); // Advance past debounce period
    });
    rerender();
    
    expect(stopDrinkingSpy).toHaveBeenCalled();
  });

  it('should rate limit detection checks', () => {
    mockDetectDrinking.mockReturnValue({ isDrinking: false, drinkingObject: null });
    
    const { result: storeResult } = renderHook(() => useHydrationStore());
    
    act(() => {
      storeResult.current.setFaceDetected(true, null, [{ x: 100, y: 100 }]);
    });

    const { rerender } = renderHook(() => useDrinkingDetection());
    
    // Multiple rapid calls should be rate limited
    for (let i = 0; i < 5; i++) {
      rerender();
      act(() => {
        jest.advanceTimersByTime(50); // Less than 100ms rate limit
      });
    }
    
    // Should only call detectDrinking once due to rate limiting
    expect(mockDetectDrinking).toHaveBeenCalledTimes(1);
  });

  it('should handle null face keypoints gracefully', () => {
    mockDetectDrinking.mockReturnValue({ isDrinking: false, drinkingObject: null });
    
    const { result: storeResult } = renderHook(() => useHydrationStore());
    
    act(() => {
      storeResult.current.setFaceDetected(false, null, null);
      storeResult.current.setObjectDetected(true, 'cup', [{ class: 'cup', confidence: 0.8, x: 100, y: 100, width: 50, height: 50 }]);
    });

    renderHook(() => useDrinkingDetection());
    
    expect(mockDetectDrinking).toHaveBeenCalledWith(
      null,
      expect.any(Array),
      0.02
    );
  });

  it('should handle null object detections gracefully', () => {
    mockDetectDrinking.mockReturnValue({ isDrinking: false, drinkingObject: null });
    
    const { result: storeResult } = renderHook(() => useHydrationStore());
    
    act(() => {
      storeResult.current.setFaceDetected(true, null, [{ x: 100, y: 100 }]);
      storeResult.current.setObjectDetected(false, null, null);
    });

    renderHook(() => useDrinkingDetection());
    
    expect(mockDetectDrinking).toHaveBeenCalledWith(
      expect.any(Array),
      null,
      0.02
    );
  });

  it('should not stop drinking during continuous overlap', () => {
    mockDetectDrinking.mockReturnValue({ isDrinking: true, drinkingObject: null });
    
    const { result: storeResult } = renderHook(() => useHydrationStore());
    const stopDrinkingSpy = jest.spyOn(storeResult.current, 'stopDrinking');
    
    act(() => {
      storeResult.current.setFaceDetected(true, null, [{ x: 100, y: 100 }]);
      storeResult.current.setObjectDetected(true, 'cup', [{ class: 'cup', confidence: 0.8, x: 100, y: 100, width: 50, height: 50 }]);
      storeResult.current.setIsDrinking(true);
    });

    const { rerender } = renderHook(() => useDrinkingDetection());
    
    // Continuous overlap
    for (let i = 0; i < 10; i++) {
      act(() => {
        jest.advanceTimersByTime(150);
      });
      rerender();
    }
    
    expect(stopDrinkingSpy).not.toHaveBeenCalled();
  });

  it('should reset frame count when stopping drinking', () => {
    mockDetectDrinking
      .mockReturnValueOnce({ isDrinking: true, drinkingObject: null })
      .mockReturnValue({ isDrinking: false, drinkingObject: null });
    
    const { result: storeResult } = renderHook(() => useHydrationStore());
    
    act(() => {
      storeResult.current.setFaceDetected(true, null, [{ x: 100, y: 100 }]);
      storeResult.current.setObjectDetected(true, 'cup', [{ class: 'cup', confidence: 0.8, x: 100, y: 100, width: 50, height: 50 }]);
      storeResult.current.setIsDrinking(true);
    });

    const { rerender } = renderHook(() => useDrinkingDetection());
    
    // Stop drinking
    act(() => {
      jest.advanceTimersByTime(600);
    });
    rerender();
    
    // Verify frame count is reset by checking that drinking doesn't start immediately on next overlap
    mockDetectDrinking.mockReturnValue({ isDrinking: true, drinkingObject: null });
    const startDrinkingSpy = jest.spyOn(storeResult.current, 'startDrinking');
    
    act(() => {
      jest.advanceTimersByTime(150);
    });
    rerender();
    
    expect(startDrinkingSpy).not.toHaveBeenCalled(); // Should need minimum frames again
  });
});