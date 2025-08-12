/**
 * Utility functions for detecting overlap between face landmarks and objects
 */

// MediaPipe Face Mesh landmark indices for lip area
// See: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
const LIP_LANDMARKS = {
  upperLipTop: 13,
  upperLipBottom: 14,
  lowerLipTop: 15,
  lowerLipBottom: 16,
  leftCorner: 61,
  rightCorner: 291,
  // Additional points for better lip boundary
  upperLipCenter: 0,
  lowerLipCenter: 17,
};

interface Point {
  x: number;
  y: number;
}

interface BoundingBox {
  x: number;      // center x
  y: number;      // center y
  width: number;
  height: number;
}

interface Rectangle {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Extract lip area bounding box from face keypoints
 */
export function getLipBoundingBox(faceKeypoints: Point[] | null): BoundingBox | null {
  if (!faceKeypoints || faceKeypoints.length === 0) {
    return null;
  }

  // Get key lip points
  const lipPoints = [
    faceKeypoints[LIP_LANDMARKS.upperLipTop],
    faceKeypoints[LIP_LANDMARKS.upperLipBottom],
    faceKeypoints[LIP_LANDMARKS.lowerLipTop],
    faceKeypoints[LIP_LANDMARKS.lowerLipBottom],
    faceKeypoints[LIP_LANDMARKS.leftCorner],
    faceKeypoints[LIP_LANDMARKS.rightCorner],
  ].filter(point => point !== undefined);

  if (lipPoints.length === 0) {
    return null;
  }

  // Find boundaries
  const xs = lipPoints.map(p => p.x);
  const ys = lipPoints.map(p => p.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  // Add some padding to the lip area (20% on each side)
  const padding = 0.2;
  const width = (maxX - minX) * (1 + padding * 2);
  const height = (maxY - minY) * (1 + padding * 2);

  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
    width,
    height,
  };
}

/**
 * Convert center-based bounding box to rectangle
 */
function boundingBoxToRectangle(box: BoundingBox): Rectangle {
  return {
    left: box.x - box.width / 2,
    right: box.x + box.width / 2,
    top: box.y - box.height / 2,
    bottom: box.y + box.height / 2,
  };
}

/**
 * Calculate Intersection over Union (IoU) between two bounding boxes
 */
export function calculateIoU(box1: BoundingBox, box2: BoundingBox): number {
  const rect1 = boundingBoxToRectangle(box1);
  const rect2 = boundingBoxToRectangle(box2);

  // Calculate intersection area
  const xOverlap = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
  const yOverlap = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
  const intersectionArea = xOverlap * yOverlap;

  // Calculate union area
  const area1 = box1.width * box1.height;
  const area2 = box2.width * box2.height;
  const unionArea = area1 + area2 - intersectionArea;

  // Avoid division by zero
  if (unionArea === 0) {
    return 0;
  }

  return intersectionArea / unionArea;
}

/**
 * Check if there's significant overlap between lip area and an object
 * @param faceKeypoints Array of face landmark points
 * @param objectBox Bounding box of the detected object (cup/bottle)
 * @param threshold Minimum IoU to consider as drinking (default 0.1 = 10% overlap)
 */
export function isLipObjectOverlap(
  faceKeypoints: Point[] | null,
  objectBox: BoundingBox | null,
  threshold: number = 0.1
): boolean {
  if (!faceKeypoints || !objectBox) {
    return false;
  }

  const lipBox = getLipBoundingBox(faceKeypoints);
  if (!lipBox) {
    return false;
  }

  const iou = calculateIoU(lipBox, objectBox);
  return iou >= threshold;
}

/**
 * Check if drinking is detected based on face and object detections
 * @param faceKeypoints Face landmark points
 * @param objectDetections Array of detected objects
 * @param overlapThreshold Minimum IoU to consider as drinking
 * @returns The object being drunk from (if any) and whether drinking is detected
 */
export function detectDrinking(
  faceKeypoints: Point[] | null,
  objectDetections: BoundingBox[] | null,
  overlapThreshold: number = 0.1
): { isDrinking: boolean; drinkingObject: BoundingBox | null } {
  if (!faceKeypoints || !objectDetections || objectDetections.length === 0) {
    return { isDrinking: false, drinkingObject: null };
  }

  // Check each detected object for overlap with lip area
  for (const objectBox of objectDetections) {
    if (isLipObjectOverlap(faceKeypoints, objectBox, overlapThreshold)) {
      return { isDrinking: true, drinkingObject: objectBox };
    }
  }

  return { isDrinking: false, drinkingObject: null };
}

/**
 * Track consecutive frames of drinking detection
 */
export class ConsecutiveFrameTracker {
  private count: number = 0;
  private readonly requiredFrames: number;

  constructor(requiredFrames: number = 5) {
    this.requiredFrames = requiredFrames;
  }

  /**
   * Update the tracker with a new frame result
   * @param detected Whether drinking was detected in this frame
   * @returns Whether the required consecutive frames have been met
   */
  update(detected: boolean): boolean {
    if (detected) {
      this.count++;
      return this.count >= this.requiredFrames;
    } else {
      this.count = 0;
      return false;
    }
  }

  reset(): void {
    this.count = 0;
  }

  getCount(): number {
    return this.count;
  }
}