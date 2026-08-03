import type { AxiosInstance } from 'axios';

import { ANALYZE_ENDPOINT } from '../constants/api';
import { AnalyzeResponseError, analyzeImage } from '../services/analyzeService';
import { getApiClient } from '../services/apiClient';
import type { PickedImage } from '../types/image';
import { logDevelopmentEvent } from '../utils/developmentLogger';

jest.mock('../services/apiClient', () => ({
  getApiClient: jest.fn(),
}));

jest.mock('../utils/developmentLogger', () => ({
  logDevelopmentEvent: jest.fn(),
}));

const mockGetApiClient = jest.mocked(getApiClient);
const mockPost = jest.fn();
const mockLogDevelopmentEvent = jest.mocked(logDevelopmentEvent);
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
  mockLogDevelopmentEvent.mockReset();
  mockGetApiClient.mockReturnValue({ post: mockPost } as unknown as AxiosInstance);
});

describe('analiz servisi', () => {
  it('görseli ve modeli multipart form ile gönderir', async () => {
    mockPost.mockResolvedValue({
      status: 200,
      headers: { 'x-request-id': 'server-request-id' },
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
    expect(mockLogDevelopmentEvent).toHaveBeenNthCalledWith(1, 'info', 'analysis_started', {
      model_type: 'detection',
    });
    expect(mockLogDevelopmentEvent).toHaveBeenNthCalledWith(2, 'info', 'analysis_completed', {
      model_type: 'detection',
      duration_ms: expect.any(Number),
      detection_count: 1,
      request_id: 'server-request-id',
      status: 200,
    });
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
    mockPost.mockResolvedValue({
      data: errorResponse,
      status: 400,
      headers: { 'x-request-id': 'failed-request-id' },
    });

    await expect(analyzeImage(image, 'detection')).rejects.toMatchObject({
      name: 'AnalyzeResponseError',
      message: errorResponse.error.message,
      response: errorResponse,
    } satisfies Partial<AnalyzeResponseError>);
    expect(mockLogDevelopmentEvent).toHaveBeenLastCalledWith('error', 'analysis_failed', {
      model_type: 'detection',
      duration_ms: expect.any(Number),
      error_code: 'INVALID_IMAGE',
      request_id: 'failed-request-id',
      status: 400,
    });
  });

  it.each(['ECONNABORTED', 'ETIMEDOUT'])('%s hatasını timeout olarak loglar', async (code) => {
    mockPost.mockRejectedValue({ isAxiosError: true, code });

    await expect(analyzeImage(image, 'detection')).rejects.toMatchObject({ code });

    expect(mockLogDevelopmentEvent).toHaveBeenLastCalledWith('warn', 'analysis_timeout', {
      model_type: 'detection',
      duration_ms: expect.any(Number),
      error_code: code,
      request_id: undefined,
      status: undefined,
    });
  });

  it('iptal edilen isteği hata yerine iptal olayı olarak loglar', async () => {
    mockPost.mockRejectedValue({ isAxiosError: true, code: 'ERR_CANCELED' });

    await expect(analyzeImage(image, 'detection')).rejects.toMatchObject({
      code: 'ERR_CANCELED',
    });

    expect(mockLogDevelopmentEvent).toHaveBeenLastCalledWith('info', 'analysis_cancelled', {
      model_type: 'detection',
      duration_ms: expect.any(Number),
      error_code: 'ERR_CANCELED',
      request_id: undefined,
      status: undefined,
    });
  });

  it('development loglarına görsel URI veya dosya adı taşımaz', async () => {
    mockPost.mockRejectedValue({ isAxiosError: true, code: 'ERR_NETWORK' });

    await expect(analyzeImage(image, 'detection')).rejects.toBeDefined();

    const serializedLogs = JSON.stringify(mockLogDevelopmentEvent.mock.calls);
    expect(serializedLogs).not.toContain(image.uri);
    expect(serializedLogs).not.toContain(image.fileName);
  });
});
