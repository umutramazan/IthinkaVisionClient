import { ANALYZE_ENDPOINT } from '../constants/api';
import type {
  AnalyzeErrorResponse,
  AnalyzeResponse,
  AnalyzeSuccessResponse,
  ModelType,
} from '../types/api';
import type { PickedImage } from '../types/image';
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
  constructor(readonly response: AnalyzeErrorResponse) {
    super(response.error.message);
    this.name = 'AnalyzeResponseError';
  }
}

export async function analyzeImage(
  image: PickedImage,
  modelType: ModelType,
  options: AnalyzeRequestOptions = {},
): Promise<AnalyzeSuccessResponse> {
  const formData = new FormData();
  const imageFile: ReactNativeFormFile = {
    uri: image.uri,
    name: image.fileName ?? 'ithinka-analysis.jpg',
    type: image.mimeType ?? 'image/jpeg',
  };

  formData.append('image', imageFile as unknown as Blob);
  formData.append('modelType', modelType);

  const response = await getApiClient().post<AnalyzeResponse>(ANALYZE_ENDPOINT, formData, {
    signal: options.signal,
  });

  if (!response.data.success) {
    throw new AnalyzeResponseError(response.data);
  }

  return response.data;
}
