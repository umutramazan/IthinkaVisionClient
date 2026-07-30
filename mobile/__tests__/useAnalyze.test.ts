import { act, renderHook } from '@testing-library/react-native';

import { messages } from '../constants/messages';
import { useAnalyze } from '../hooks/useAnalyze';
import { analyzeImage } from '../services/analyzeService';
import type { AnalyzeSuccessResponse } from '../types/api';
import type { PickedImage } from '../types/image';
import { mapAnalyzeErrorToMessage } from '../utils/analyzeError';

jest.mock('../services/analyzeService', () => ({
  analyzeImage: jest.fn(),
}));

jest.mock('../utils/analyzeError', () => ({
  mapAnalyzeErrorToMessage: jest.fn(),
}));

const mockAnalyzeImage = jest.mocked(analyzeImage);
const mockMapAnalyzeErrorToMessage = jest.mocked(mapAnalyzeErrorToMessage);
const image: PickedImage = {
  uri: 'file:///cache/ithinka-analysis.jpg',
  width: 1280,
  height: 720,
  fileName: 'ithinka-analysis.jpg',
  mimeType: 'image/jpeg',
};
const successResponse: AnalyzeSuccessResponse = {
  success: true,
  detections: [{ class: 'Person', confidence: 0.96 }],
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}

beforeEach(() => {
  mockAnalyzeImage.mockReset();
  mockMapAnalyzeErrorToMessage.mockReset();
  mockMapAnalyzeErrorToMessage.mockReturnValue(messages.serverError);
});

describe('useAnalyze', () => {
  it('başlangıçta boş ve yükleme dışında başlar', () => {
    const { result } = renderHook(() => useAnalyze());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.detections).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('istek boyunca loading yönetir ve başarılı sonucu saklar', async () => {
    const request = deferred<AnalyzeSuccessResponse>();
    mockAnalyzeImage.mockReturnValue(request.promise);
    const { result } = renderHook(() => useAnalyze());

    let analyzePromise!: Promise<void>;
    act(() => {
      analyzePromise = result.current.analyze(image, 'detection');
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.detections).toBeNull();

    await act(async () => {
      request.resolve(successResponse);
      await analyzePromise;
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.detections).toEqual(successResponse.detections);
    expect(result.current.error).toBeNull();
  });

  it('servis hatasını kullanıcı mesajına dönüştürür', async () => {
    const serviceError = new Error('technical detail');
    mockAnalyzeImage.mockRejectedValue(serviceError);
    const { result } = renderHook(() => useAnalyze());

    await act(async () => {
      await result.current.analyze(image, 'detection');
    });

    expect(mockMapAnalyzeErrorToMessage).toHaveBeenCalledWith(serviceError);
    expect(result.current.error).toBe(messages.serverError);
    expect(result.current.isLoading).toBe(false);
  });

  it('analiz sürerken ikinci isteği başlatmaz', async () => {
    const request = deferred<AnalyzeSuccessResponse>();
    mockAnalyzeImage.mockReturnValue(request.promise);
    const { result } = renderHook(() => useAnalyze());

    let firstPromise!: Promise<void>;
    act(() => {
      firstPromise = result.current.analyze(image, 'detection');
      void result.current.analyze(image, 'detection');
    });

    expect(mockAnalyzeImage).toHaveBeenCalledTimes(1);

    await act(async () => {
      request.resolve(successResponse);
      await firstPromise;
    });
  });

  it('clearAnalysis devam eden isteği iptal edip state alanlarını temizler', async () => {
    const request = deferred<AnalyzeSuccessResponse>();
    mockAnalyzeImage.mockReturnValue(request.promise);
    const { result } = renderHook(() => useAnalyze());

    act(() => {
      void result.current.analyze(image, 'detection');
    });
    const signal = mockAnalyzeImage.mock.calls[0]?.[2]?.signal;

    act(() => {
      result.current.clearAnalysis();
    });

    expect(signal?.aborted).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.detections).toBeNull();
    expect(result.current.error).toBeNull();

    await act(async () => {
      request.resolve(successResponse);
      await request.promise;
    });

    expect(result.current.detections).toBeNull();
  });

  it('ekran kapanırken devam eden isteği iptal eder', () => {
    mockAnalyzeImage.mockReturnValue(new Promise(() => undefined));
    const { result, unmount } = renderHook(() => useAnalyze());

    act(() => {
      void result.current.analyze(image, 'detection');
    });
    const signal = mockAnalyzeImage.mock.calls[0]?.[2]?.signal;

    unmount();

    expect(signal?.aborted).toBe(true);
  });
});
