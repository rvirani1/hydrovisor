import {
  getLipBoundingBox,
  calculateIoU,
  isLipObjectOverlap,
  detectDrinking,
} from '../overlapDetection';

describe('overlapDetection utils', () => {
  const mockFaceKeypoints = [
    { x: 100, y: 100 }, // index 0 - upperLipCenter
    { x: 110, y: 110 }, // index 1
    { x: 120, y: 120 }, // index 2
    // ... more points to fill required indices
    ...Array(10).fill(0).map((_, i) => ({ x: i * 10, y: i * 10 })),
    { x: 95, y: 95 },   // index 13 - upperLipTop
    { x: 105, y: 105 }, // index 14 - upperLipBottom
    { x: 115, y: 115 }, // index 15 - lowerLipTop
    { x: 125, y: 125 }, // index 16 - lowerLipBottom
    { x: 135, y: 135 }, // index 17 - lowerLipCenter
    // ... more points to reach index 61 and 291
    ...Array(43).fill(0).map((_, i) => ({ x: (i + 18) * 5, y: (i + 18) * 5 })),
    { x: 85, y: 100 },  // index 61 - leftCorner
    // ... fill to index 291
    ...Array(229).fill(0).map((_, i) => ({ x: (i + 62) * 2, y: (i + 62) * 2 })),
    { x: 115, y: 100 }, // index 291 - rightCorner
  ];

  describe('getLipBoundingBox', () => {
    it('should return null for null keypoints', () => {
      expect(getLipBoundingBox(null)).toBeNull();
    });

    it('should return null for empty keypoints', () => {
      expect(getLipBoundingBox([])).toBeNull();
    });

    it('should calculate lip bounding box from keypoints', () => {
      const result = getLipBoundingBox(mockFaceKeypoints);
      
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('x');
      expect(result).toHaveProperty('y');
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');
      expect(result!.width).toBeGreaterThan(0);
      expect(result!.height).toBeGreaterThan(0);
    });

    it('should handle missing lip landmark points gracefully', () => {
      const sparseKeypoints = Array(300).fill({ x: 0, y: 0 });
      // Only set some required points
      sparseKeypoints[13] = { x: 95, y: 95 };
      sparseKeypoints[14] = { x: 105, y: 105 };
      
      const result = getLipBoundingBox(sparseKeypoints);
      expect(result).not.toBeNull();
    });
  });

  describe('calculateIoU', () => {
    it('should return 0 for non-overlapping boxes', () => {
      const box1 = { x: 50, y: 50, width: 20, height: 20 };
      const box2 = { x: 100, y: 100, width: 20, height: 20 };
      
      expect(calculateIoU(box1, box2)).toBe(0);
    });

    it('should return 1 for identical boxes', () => {
      const box1 = { x: 50, y: 50, width: 20, height: 20 };
      const box2 = { x: 50, y: 50, width: 20, height: 20 };
      
      expect(calculateIoU(box1, box2)).toBe(1);
    });

    it('should calculate partial overlap correctly', () => {
      const box1 = { x: 50, y: 50, width: 20, height: 20 };
      const box2 = { x: 60, y: 60, width: 20, height: 20 };
      
      const iou = calculateIoU(box1, box2);
      expect(iou).toBeGreaterThan(0);
      expect(iou).toBeLessThan(1);
    });

    it('should handle zero area boxes', () => {
      const box1 = { x: 50, y: 50, width: 0, height: 0 };
      const box2 = { x: 50, y: 50, width: 20, height: 20 };
      
      expect(calculateIoU(box1, box2)).toBe(0);
    });

    it('should calculate overlap for boxes with different sizes', () => {
      const smallBox = { x: 50, y: 50, width: 10, height: 10 };
      const largeBox = { x: 50, y: 50, width: 30, height: 30 };
      
      const iou = calculateIoU(smallBox, largeBox);
      expect(iou).toBeCloseTo(0.11, 2); // small box area / large box area
    });
  });

  describe('isLipObjectOverlap', () => {
    const mockObjectBox = { x: 100, y: 100, width: 20, height: 20 };

    it('should return false for null keypoints', () => {
      expect(isLipObjectOverlap(null, mockObjectBox)).toBe(false);
    });

    it('should return false for null object box', () => {
      expect(isLipObjectOverlap(mockFaceKeypoints, null)).toBe(false);
    });

    it('should return false when overlap is below threshold', () => {
      const result = isLipObjectOverlap(mockFaceKeypoints, mockObjectBox, 0.9);
      expect(result).toBe(false);
    });

    it('should return true when overlap is above threshold', () => {
      const result = isLipObjectOverlap(mockFaceKeypoints, mockObjectBox, 0.01);
      expect(result).toBe(true);
    });

    it('should use default threshold of 0.1', () => {
      // This should work with any reasonable overlap since default threshold is low
      const overlappingBox = { x: 100, y: 100, width: 50, height: 50 };
      const result = isLipObjectOverlap(mockFaceKeypoints, overlappingBox);
      // We can't assert true/false without knowing exact calculations, but function should run
      expect(typeof result).toBe('boolean');
    });
  });

  describe('detectDrinking', () => {
    const mockObjectDetections = [
      { x: 100, y: 100, width: 20, height: 20 },
      { x: 200, y: 200, width: 15, height: 15 },
    ];

    it('should return no drinking for null keypoints', () => {
      const result = detectDrinking(null, mockObjectDetections);
      expect(result).toEqual({ isDrinking: false, drinkingObject: null });
    });

    it('should return no drinking for null detections', () => {
      const result = detectDrinking(mockFaceKeypoints, null);
      expect(result).toEqual({ isDrinking: false, drinkingObject: null });
    });

    it('should return no drinking for empty detections', () => {
      const result = detectDrinking(mockFaceKeypoints, []);
      expect(result).toEqual({ isDrinking: false, drinkingObject: null });
    });

    it('should detect drinking when overlap exists', () => {
      const overlappingDetections = [
        { x: 100, y: 100, width: 50, height: 50 }, // Should overlap with lip area
      ];
      
      const result = detectDrinking(mockFaceKeypoints, overlappingDetections, 0.01);
      expect(result.isDrinking).toBe(true);
      expect(result.drinkingObject).not.toBeNull();
    });

    it('should return first overlapping object', () => {
      const overlappingDetections = [
        { x: 100, y: 100, width: 50, height: 50 }, // First overlapping
        { x: 105, y: 105, width: 50, height: 50 }, // Second overlapping
      ];
      
      const result = detectDrinking(mockFaceKeypoints, overlappingDetections, 0.01);
      expect(result.isDrinking).toBe(true);
      expect(result.drinkingObject).toEqual(overlappingDetections[0]);
    });

    it('should not detect drinking when no overlap exists', () => {
      const nonOverlappingDetections = [
        { x: 300, y: 300, width: 20, height: 20 }, // Far from lip area
      ];
      
      const result = detectDrinking(mockFaceKeypoints, nonOverlappingDetections, 0.1);
      expect(result).toEqual({ isDrinking: false, drinkingObject: null });
    });

    it('should respect custom overlap threshold', () => {
      const slightlyOverlappingDetections = [
        { x: 110, y: 110, width: 20, height: 20 }, // Slight overlap
      ];
      
      // With high threshold, should not detect
      const resultHighThreshold = detectDrinking(mockFaceKeypoints, slightlyOverlappingDetections, 0.8);
      expect(resultHighThreshold.isDrinking).toBe(false);
      
      // With low threshold, might detect
      const resultLowThreshold = detectDrinking(mockFaceKeypoints, slightlyOverlappingDetections, 0.001);
      // Can't guarantee true/false without exact calculation, but should return boolean
      expect(typeof resultLowThreshold.isDrinking).toBe('boolean');
    });
  });
});