import {
  requestNotificationPermission,
  sendNotification,
  checkNotificationSupport,
  getNotificationPermissionStatus,
  type NotificationOptions,
} from '../notifications';

// Mock window.Notification for each test
const mockNotification = jest.fn();
const mockRequestPermission = jest.fn();

describe('notifications utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset Notification mock
    Object.defineProperty(window, 'Notification', {
      writable: true,
      value: mockNotification,
    });
    
    Object.defineProperty(Notification, 'requestPermission', {
      writable: true,
      value: mockRequestPermission,
    });
    
    // Default permission state
    Object.defineProperty(Notification, 'permission', {
      writable: true,
      value: 'default',
    });
  });

  describe('checkNotificationSupport', () => {
    it('should return true when Notification is supported', () => {
      expect(checkNotificationSupport()).toBe(true);
    });

    it('should return false when Notification is not supported', () => {
      // @ts-ignore - intentionally delete for testing
      delete window.Notification;
      expect(checkNotificationSupport()).toBe(false);
    });
  });

  describe('getNotificationPermissionStatus', () => {
    it('should return current permission status', () => {
      Object.defineProperty(Notification, 'permission', {
        writable: true,
        value: 'granted',
      });
      
      expect(getNotificationPermissionStatus()).toBe('granted');
    });

    it('should return null when notifications not supported', () => {
      // @ts-ignore - intentionally delete for testing
      delete window.Notification;
      expect(getNotificationPermissionStatus()).toBeNull();
    });
  });

  describe('requestNotificationPermission', () => {
    it('should return granted when permission is already granted', async () => {
      Object.defineProperty(Notification, 'permission', {
        writable: true,
        value: 'granted',
      });

      const result = await requestNotificationPermission();
      expect(result).toBe('granted');
      expect(mockRequestPermission).not.toHaveBeenCalled();
    });

    it('should request permission when permission is default', async () => {
      Object.defineProperty(Notification, 'permission', {
        writable: true,
        value: 'default',
      });
      
      mockRequestPermission.mockResolvedValue('granted');

      const result = await requestNotificationPermission();
      expect(result).toBe('granted');
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    it('should return denied when permission is denied', async () => {
      Object.defineProperty(Notification, 'permission', {
        writable: true,
        value: 'denied',
      });

      const result = await requestNotificationPermission();
      expect(result).toBe('denied');
      expect(mockRequestPermission).not.toHaveBeenCalled();
    });

    it('should return denied when notifications not supported', async () => {
      // @ts-ignore - intentionally delete for testing
      delete window.Notification;

      const result = await requestNotificationPermission();
      expect(result).toBe('denied');
    });
  });

  describe('sendNotification', () => {
    const notificationOptions: NotificationOptions = {
      title: 'Test Title',
      body: 'Test Body',
      icon: '/test-icon.png',
    };

    it('should create notification when permission is granted', () => {
      Object.defineProperty(Notification, 'permission', {
        writable: true,
        value: 'granted',
      });

      const mockNotificationInstance = {
        close: jest.fn(),
        onclick: null,
      };
      mockNotification.mockReturnValue(mockNotificationInstance);

      sendNotification(notificationOptions);

      expect(mockNotification).toHaveBeenCalledWith('Test Title', {
        body: 'Test Body',
        icon: '/test-icon.png',
        badge: '/logo.png',
        tag: 'hydration-reminder',
        requireInteraction: false,
      });
    });

    it('should use default icon when none provided', () => {
      Object.defineProperty(Notification, 'permission', {
        writable: true,
        value: 'granted',
      });

      const mockNotificationInstance = {
        close: jest.fn(),
        onclick: null,
      };
      mockNotification.mockReturnValue(mockNotificationInstance);

      sendNotification({
        title: 'Test Title',
        body: 'Test Body',
      });

      expect(mockNotification).toHaveBeenCalledWith('Test Title', {
        body: 'Test Body',
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'hydration-reminder',
        requireInteraction: false,
      });
    });

    it('should not create notification when permission not granted', () => {
      Object.defineProperty(Notification, 'permission', {
        writable: true,
        value: 'denied',
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      sendNotification(notificationOptions);

      expect(mockNotification).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Notification permission not granted');
      
      consoleSpy.mockRestore();
    });

    it('should not create notification when not supported', () => {
      // @ts-ignore - intentionally delete for testing
      delete window.Notification;

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      sendNotification(notificationOptions);

      expect(consoleSpy).toHaveBeenCalledWith('This browser does not support desktop notifications');
      
      consoleSpy.mockRestore();
    });

    it('should set onclick handler and auto-close timer', () => {
      Object.defineProperty(Notification, 'permission', {
        writable: true,
        value: 'granted',
      });

      const mockNotificationInstance = {
        close: jest.fn(),
        onclick: null,
      };
      mockNotification.mockReturnValue(mockNotificationInstance);

      jest.useFakeTimers();
      const focusSpy = jest.spyOn(window, 'focus').mockImplementation();

      sendNotification(notificationOptions);

      // Test onclick handler
      expect(mockNotificationInstance.onclick).toBeDefined();
      mockNotificationInstance.onclick!();
      expect(focusSpy).toHaveBeenCalled();
      expect(mockNotificationInstance.close).toHaveBeenCalled();

      // Test auto-close timer
      jest.advanceTimersByTime(10000);
      expect(mockNotificationInstance.close).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
      focusSpy.mockRestore();
    });
  });
});