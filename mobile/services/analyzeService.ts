import { isAxiosError } from 'axios';

import { ANALYZE_ENDPOINT } from '../constants/api';
import type {
  AnalyzeErrorResponse,
  AnalyzeResponse,
  AnalyzeSuccessResponse,
  ModelType,
} from '../types/api';
import type { PickedImage } from '../types/image';
import { logDevelopmentEvent, type DevelopmentLogLevel } from '../utils/developmentLogger';
import { getApiClient } from './apiClient';

interface AnalyzeRequestOptions {
  signal?: AbortSignal;
}

interface ReactNativeFormFile {
  uri: string;
  name: string;
  type: string;
}

export class AnalyzeResponseError extends Error {
  constructor(
    readonly response: AnalyzeErrorResponse,
    readonly status?: number,
    readonly requestId?: string,
  ) {
    super(response.error.message);
    this.name = 'AnalyzeResponseError';
  }
}

interface ResponseHeaders {
  get?: (name: string) => unknown;
  [name: string]: unknown;
}

function getRequestId(headers: unknown): string | undefined {
  if (!headers || typeof headers !== 'object') {
    return undefined;
  }

  const responseHeaders = headers as ResponseHeaders;
  const value = responseHeaders.get?.('x-request-id') ?? responseHeaders['x-request-id'];
  return typeof value === 'string' && value ? value : undefined;
}

function getApiErrorCode(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const error = (data as { error?: unknown }).error;
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : undefined;
}

function logAnalysisFailure(error: unknown, durationMs: number, modelType: ModelType): void {
  let event = 'analysis_failed';
  let level: DevelopmentLogLevel = 'error';
  let errorCode = 'UNKNOWN_ERROR';
  let requestId: string | undefined;
  let status: number | undefined;

  if (error instanceof AnalyzeResponseError) {
    errorCode = error.response.error.code;
    requestId = error.requestId;
    status = error.status;
  } else if (isAxiosError(error)) {
    requestId = getRequestId(error.response?.headers);
    status = error.response?.status;
    errorCode = getApiErrorCode(error.response?.data) ?? error.code ?? 'HTTP_ERROR';

    if (error.code === 'ERR_CANCELED') {
      event = 'analysis_cancelled';
      level = 'info';
    } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      event = 'analysis_timeout';
      level = 'warn';
    }
  }

  logDevelopmentEvent(level, event, {
    model_type: modelType,
    duration_ms: durationMs,
    error_code: errorCode,
    request_id: requestId,
    status,
  });
}

export async function analyzeImage(
  image: PickedImage,
  modelType: ModelType,
  options: AnalyzeRequestOptions = {},
): Promise<AnalyzeSuccessResponse> {
  const startedAt = Date.now();
  logDevelopmentEvent('info', 'analysis_started', { model_type: modelType });

  const formData = new FormData();
  const imageFile: ReactNativeFormFile = {
    uri: image.uri,
    name: image.fileName ?? 'ithinka-analysis.jpg',
    type: image.mimeType ?? 'image/jpeg',
  };

  formData.append('image', imageFile as unknown as Blob);
  formData.append('modelType', modelType);

  try {
    const response = await getApiClient().post<AnalyzeResponse>(ANALYZE_ENDPOINT, formData, {
      signal: options.signal,
    });
    const durationMs = Date.now() - startedAt;
    const requestId = getRequestId(response.headers);

    if (!response.data.success) {
      throw new AnalyzeResponseError(response.data, response.status, requestId);
    }

    logDevelopmentEvent('info', 'analysis_completed', {
      model_type: modelType,
      duration_ms: durationMs,
      detection_count: response.data.detections.length,
      request_id: requestId,
      status: response.status,
    });

    return response.data;
  } catch (error) {
    logAnalysisFailure(error, Date.now() - startedAt, modelType);
    throw error;
  }
}
