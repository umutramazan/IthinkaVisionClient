export interface Detection {
  class: string;
  confidence: number;
}

export interface DetectionGroup {
  className: string;
  count: number;
  confidence: number;
}
