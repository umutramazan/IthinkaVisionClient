import { isAxiosError } from 'axios';

import { messages } from '../constants/messages';
import type { AnalyzeErrorCode } from '../types/api';
import { AnalyzeResponseError } from '../services/analyzeService';

const invalidImageCodes: readonly AnalyzeErrorCode[] = [
  'INVALID_IMAGE',
  'INVALID_MODEL_TYPE',
  'UNSUPPORTED_IMAGE_TYPE',
  'IMAGE_TOO_LARGE',
  'VALIDATION_ERROR',
];

function mapApiErrorCode(code: AnalyzeErrorCode): string {
  return invalidImageCodes.includes(code) ? messages.invalidOrLargeImage : messages.serverError;
}

export function mapAnalyzeErrorToMessage(error: unknown): string | null {
  if (error instanceof AnalyzeResponseError) {
    return mapApiErrorCode(error.response.error.code);
  }

  if (!isAxiosError(error)) {
    return messages.serverError;
  }

  if (error.code === 'ERR_CANCELED') {
    return null;
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return messages.requestTimeout;
  }

  const status = error.response?.status;

  if (status === 400 || status === 413 || status === 415 || status === 422) {
    return messages.invalidOrLargeImage;
  }

  if (status !== undefined && status >= 500) {
    return messages.serverError;
  }

  if (!error.response) {
    return messages.serverUnavailable;
  }

  return messages.serverError;
}
