import React from 'react';
import { render, screen } from '@testing-library/react';
import { HydrationStats } from '../HydrationStats';
import { useHydrationStore } from '../../store/hydrationStore';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock the store
jest.mock('../../store/hydrationStore');
const mockUseHydrationStore = useHydrationStore as jest.MockedFunction<typeof useHydrationStore>;

describe('HydrationStats', () => {
  const defaultStoreState = {
    hydrationEvents: [],
    getTimeSinceLastHydration: jest.fn().mockReturnValue(null),
    isOverdue: jest.fn().mockReturnValue(false),
    getTodayHydrationCount: jest.fn().mockReturnValue(0),
    hydrationIntervalMinutes: 60,
    isDrinking: false,
    objectDetected: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with no hydration events', () => {
    mockUseHydrationStore.mockReturnValue(defaultStoreState);

    render(<HydrationStats />);

    expect(screen.getByText('Next drink in')).toBeInTheDocument();
    expect(screen.getByText('60:00')).toBeInTheDocument(); // 60 minutes default
    expect(screen.getByText("Today's Hydration")).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Today's count
    expect(screen.getByText('Start drinking to track your hydration')).toBeInTheDocument();
  });

  it('should show overdue status when overdue', () => {
    mockUseHydrationStore.mockReturnValue({
      ...defaultStoreState,
      getTimeSinceLastHydration: jest.fn().mockReturnValue(3900), // 65 minutes
      isOverdue: jest.fn().mockReturnValue(true),
    });

    render(<HydrationStats />);

    expect(screen.getByText('Overdue! Time to hydrate')).toBeInTheDocument();
    expect(screen.getByText('Drink Now!')).toBeInTheDocument();
  });

  it('should display countdown timer correctly', () => {
    mockUseHydrationStore.mockReturnValue({
      ...defaultStoreState,
      getTimeSinceLastHydration: jest.fn().mockReturnValue(1800), // 30 minutes
      hydrationIntervalMinutes: 60,
    });

    render(<HydrationStats />);

    expect(screen.getByText('Next drink in')).toBeInTheDocument();
    expect(screen.getByText('30:00')).toBeInTheDocument(); // 30 minutes remaining
  });

  it('should show object detection status', () => {
    mockUseHydrationStore.mockReturnValue({
      ...defaultStoreState,
      objectDetected: true,
    });

    render(<HydrationStats />);

    expect(screen.getByText('Cup Detected')).toBeInTheDocument();
  });

  it('should show no cup status when object not detected', () => {
    mockUseHydrationStore.mockReturnValue({
      ...defaultStoreState,
      objectDetected: false,
    });

    render(<HydrationStats />);

    expect(screen.getByText('No Cup')).toBeInTheDocument();
  });

  it('should show drinking status when drinking', () => {
    mockUseHydrationStore.mockReturnValue({
      ...defaultStoreState,
      isDrinking: true,
    });

    render(<HydrationStats />);

    expect(screen.getByText('Drinking')).toBeInTheDocument();
  });

  it('should display today\'s hydration count', () => {
    mockUseHydrationStore.mockReturnValue({
      ...defaultStoreState,
      getTodayHydrationCount: jest.fn().mockReturnValue(5),
    });

    render(<HydrationStats />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should display hydration event times', () => {
    const mockEvents = [
      { timestamp: new Date('2024-01-01T10:30:00'), detectedObject: 'cup' as const },
      { timestamp: new Date('2024-01-01T14:15:00'), detectedObject: 'bottle' as const },
    ];

    mockUseHydrationStore.mockReturnValue({
      ...defaultStoreState,
      hydrationEvents: mockEvents,
      getTodayHydrationCount: jest.fn().mockReturnValue(2),
    });

    render(<HydrationStats />);

    expect(screen.getByText('10:30')).toBeInTheDocument();
    expect(screen.getByText('14:15')).toBeInTheDocument();
    expect(screen.queryByText('Start drinking to track your hydration')).not.toBeInTheDocument();
  });

  it('should calculate progress percentage correctly', () => {
    mockUseHydrationStore.mockReturnValue({
      ...defaultStoreState,
      getTimeSinceLastHydration: jest.fn().mockReturnValue(1800), // 30 minutes
      hydrationIntervalMinutes: 60, // 60 minute interval
    });

    render(<HydrationStats />);

    // Progress should be 50% (30/60 minutes elapsed)
    // The progress bar shows remaining time, so it should be 50% filled
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('should handle zero time remaining correctly', () => {
    mockUseHydrationStore.mockReturnValue({
      ...defaultStoreState,
      getTimeSinceLastHydration: jest.fn().mockReturnValue(3600), // 60 minutes
      hydrationIntervalMinutes: 60,
      isOverdue: jest.fn().mockReturnValue(true),
    });

    render(<HydrationStats />);

    expect(screen.getByText('Drink Now!')).toBeInTheDocument();
  });

  it('should format seconds correctly with leading zero', () => {
    mockUseHydrationStore.mockReturnValue({
      ...defaultStoreState,
      getTimeSinceLastHydration: jest.fn().mockReturnValue(1797), // 29 minutes 57 seconds elapsed
      hydrationIntervalMinutes: 30, // 30 minute interval
    });

    render(<HydrationStats />);

    expect(screen.getByText('0:03')).toBeInTheDocument(); // 3 seconds remaining
  });

  it('should handle multiple hydration events in correct order', () => {
    const mockEvents = [
      { timestamp: new Date('2024-01-01T08:00:00'), detectedObject: 'cup' as const },
      { timestamp: new Date('2024-01-01T12:30:00'), detectedObject: 'bottle' as const },
      { timestamp: new Date('2024-01-01T16:45:00'), detectedObject: 'cup' as const },
    ];

    mockUseHydrationStore.mockReturnValue({
      ...defaultStoreState,
      hydrationEvents: mockEvents,
      getTodayHydrationCount: jest.fn().mockReturnValue(3),
    });

    render(<HydrationStats />);

    expect(screen.getByText('08:00')).toBeInTheDocument();
    expect(screen.getByText('12:30')).toBeInTheDocument();
    expect(screen.getByText('16:45')).toBeInTheDocument();
  });
});