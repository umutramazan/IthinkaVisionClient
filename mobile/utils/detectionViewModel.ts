import type { Detection, DetectionGroup } from '../types/detection';

export function formatConfidence(confidence: number): string {
  const normalized = Math.min(1, Math.max(0, confidence));
  return `%${Math.round(normalized * 100)}`;
}

export function groupDetections(detections: readonly Detection[]): DetectionGroup[] {
  const grouped = new Map<string, DetectionGroup>();

  for (const detection of detections) {
    const existing = grouped.get(detection.class);

    if (existing) {
      existing.count += 1;
      existing.confidence = Math.max(existing.confidence, detection.confidence);
      continue;
    }

    grouped.set(detection.class, {
      className: detection.class,
      count: 1,
      confidence: detection.confidence,
    });
  }

  return [...grouped.values()].sort((left, right) => right.confidence - left.confidence);
}
