import type { Detection } from './detection';

export type ModelType = 'detection';

export type AnalyzeErrorCode =
  | 'INVALID_IMAGE'
  | 'INVALID_MODEL_TYPE'
  | 'UNSUPPORTED_IMAGE_TYPE'
  | 'IMAGE_TOO_LARGE'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR';

export interface AnalyzeSuccessResponse {
  success: true;
  detections: readonly Detection[];
}

export interface AnalyzeErrorDetail {
  code: AnalyzeErrorCode;
  message: string;
}

export interface AnalyzeErrorResponse {
  success: false;
  error: AnalyzeErrorDetail;
}

export type AnalyzeResponse = AnalyzeSuccessResponse | AnalyzeErrorResponse;
