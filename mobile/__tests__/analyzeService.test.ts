import type { AxiosInstance } from 'axios';

import { ANALYZE_ENDPOINT } from '../constants/api';
import { AnalyzeResponseError, analyzeImage } from '../services/analyzeService';
import { getApiClient } from '../services/apiClient';
import type { PickedImage } from '../types/image';

jest.mock('../services/apiClient', () => ({
  getApiClient: jest.fn(),
}));

const mockGetApiClient = jest.mocked(getApiClient);
const mockPost = jest.fn();
const originalFormData = globalThis.FormData;

class TestFormData {
  readonly parts: [string, unknown][] = [];

  append(name: string, value: unknown) {
    this.parts.push([name, value]);
  }
}

const image: PickedImage = {
  uri: 'file:///cache/ithinka-analysis.jpg',
  width: 1280,
  height: 720,
  fileName: 'ithinka-analysis.jpg',
  mimeType: 'image/jpeg',
};

beforeAll(() => {
  Object.defineProperty(globalThis, 'FormData', {
    configurable: true,
    value: TestFormData,
  });
});

afterAll(() => {
  Object.defineProperty(globalThis, 'FormData', {
    configurable: true,
    value: originalFormData,
  });
});

beforeEach(() => {
  mockPost.mockReset();
  mockGetApiClient.mockReturnValue({ post: mockPost } as unknown as AxiosInstance);
});

describe('analiz servisi', () => {
  it('görseli ve modeli multipart form ile gönderir', async () => {
    mockPost.mockResolvedValue({
      data: {
        success: true,
        detections: [{ class: 'Person', confidence: 0.96 }],
      },
    });
    const controller = new AbortController();

    const result = await analyzeImage(image, 'detection', { signal: controller.signal });

    expect(result.detections).toEqual([{ class: 'Person', confidence: 0.96 }]);
    expect(mockPost).toHaveBeenCalledTimes(1);

    const [endpoint, body, config] = mockPost.mock.calls[0] as [
      string,
      FormData,
      { signal?: AbortSignal; headers?: unknown },
    ];
    const parts = (body as unknown as TestFormData).parts;

    expect(endpoint).toBe(ANALYZE_ENDPOINT);
    expect(parts).toEqual([
      [
        'image',
        {
          uri: image.uri,
          name: image.fileName,
          type: image.mimeType,
        },
      ],
      ['modelType', 'detection'],
    ]);
    expect(config.signal).toBe(controller.signal);
    expect(config.headers).toBeUndefined();
  });

  it('dosya adı ve MIME türü yoksa JPEG varsayılanlarını kullanır', async () => {
    mockPost.mockResolvedValue({ data: { success: true, detections: [] } });

    await analyzeImage({ ...image, fileName: null, mimeType: null }, 'detection');

    const body = mockPost.mock.calls[0]?.[1] as FormData;
    const parts = (body as unknown as TestFormData).parts;

    expect(parts[0]).toEqual([
      'image',
      {
        uri: image.uri,
        name: 'ithinka-analysis.jpg',
        type: 'image/jpeg',
      },
    ]);
  });

  it('success false cevabını kontrollü servis hatasına dönüştürür', async () => {
    const errorResponse = {
      success: false as const,
      error: {
        code: 'INVALID_IMAGE' as const,
        message: 'Geçersiz veya desteklenmeyen görsel.',
      },
    };
    mockPost.mockResolvedValue({ data: errorResponse });

    await expect(analyzeImage(image, 'detection')).rejects.toMatchObject({
      name: 'AnalyzeResponseError',
      message: errorResponse.error.message,
      response: errorResponse,
    } satisfies Partial<AnalyzeResponseError>);
  });
});
