import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { analyzeImage } from '../services/analyzeService';
import type { AnalyzeSuccessResponse } from '../types/api';
import { optimizeImage } from '../utils/imageOptimizer';
import { pickImageFromLibrary } from '../utils/imagePicker';

jest.mock('../utils/imagePicker', () => ({
  pickImageFromCamera: jest.fn(),
  pickImageFromLibrary: jest.fn(),
  recoverPendingImagePick: jest.fn(),
}));

jest.mock('../utils/imageOptimizer', () => ({
  ImageOptimizationError: class ImageOptimizationError extends Error {},
  optimizeImage: jest.fn(),
}));

jest.mock('../services/analyzeService', () => ({
  ...jest.requireActual('../services/analyzeService'),
  analyzeImage: jest.fn(),
}));

const pickImageFromLibraryMock = jest.mocked(pickImageFromLibrary);
const optimizeImageMock = jest.mocked(optimizeImage);
const analyzeImageMock = jest.mocked(analyzeImage);

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

async function selectGallery(getByText: ReturnType<typeof render>['getByText']) {
  fireEvent.press(getByText('Galeri'));
  await waitFor(() => expect(getByText('Görsel analiz için hazır')).toBeTruthy());
}

describe('HomeScreen', () => {
  beforeEach(() => {
    analyzeImageMock.mockReset();
    analyzeImageMock.mockResolvedValue({
      success: true,
      detections: [
        { class: 'Person', confidence: 0.96 },
        { class: 'Helmet', confidence: 0.91 },
        { class: 'Person', confidence: 0.89 },
      ],
    });
    pickImageFromLibraryMock.mockResolvedValue({
      status: 'selected',
      image: {
        uri: 'file:///library/test.jpg',
        width: 1600,
        height: 900,
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
      },
    });
    optimizeImageMock.mockImplementation(async (image) => ({
      ...image,
      uri: 'file:///cache/optimized.jpg',
      width: 1280,
      height: 720,
      fileName: 'ithinka-analysis.jpg',
      mimeType: 'image/jpeg',
    }));
  });

  it('yalnızca Detection modelini gösterir ve statik demo seçeneklerini kaldırır', () => {
    const { getByText, queryByText } = render(<HomeScreen />);
    expect(getByText('Detection')).toBeTruthy();
    expect(queryByText('Classification')).toBeNull();
    expect(queryByText('Statik demo sonucu')).toBeNull();
    expect(queryByText('Başarılı')).toBeNull();
    expect(queryByText('Boş')).toBeNull();
    expect(queryByText('Hata')).toBeNull();
  });

  it('görsel seçilmeden değerlendirmeyi engeller', () => {
    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('Değerlendir'));
    expect(getByText('Devam etmek için kamera veya galeriden bir görsel seçin.')).toBeTruthy();
  });

  it('model seçilmeden değerlendirmeyi engeller', async () => {
    const { getByText } = render(<HomeScreen />);
    await selectGallery(getByText);
    fireEvent.press(getByText('Değerlendir'));
    expect(getByText('Devam etmek için Detection modelini seçin.')).toBeTruthy();
  });

  it('loading sırasında kontrolleri pasifleştirir ve gerçek API sonucunu gruplar', async () => {
    const request = deferred<AnalyzeSuccessResponse>();
    analyzeImageMock.mockReturnValue(request.promise);
    const { getByRole, getByText } = render(<HomeScreen />);
    await selectGallery(getByText);
    fireEvent.press(getByText('Detection'));
    fireEvent.press(getByText('Değerlendir'));

    expect(getByText('Görsel değerlendiriliyor…')).toBeTruthy();
    expect(getByRole('button', { name: 'Değerlendir' }).props.accessibilityState).toEqual({
      disabled: true,
    });
    expect(getByRole('button', { name: 'Kamera' }).props.accessibilityState).toEqual({
      disabled: true,
    });

    await act(async () => {
      request.resolve({
        success: true,
        detections: [
          { class: 'Person', confidence: 0.96 },
          { class: 'Helmet', confidence: 0.91 },
          { class: 'Person', confidence: 0.89 },
        ],
      });
      await request.promise;
    });

    await waitFor(() => expect(getByText('Person')).toBeTruthy());
    expect(getByText('2 adet')).toBeTruthy();
    expect(getByText('%96')).toBeTruthy();
    expect(analyzeImageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        uri: 'file:///cache/optimized.jpg',
        width: 1280,
        height: 720,
      }),
      'detection',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('boş sonucu hata yerine bilgi görünümü olarak gösterir', async () => {
    analyzeImageMock.mockResolvedValue({ success: true, detections: [] });
    const { getByText } = render(<HomeScreen />);
    await selectGallery(getByText);
    fireEvent.press(getByText('Detection'));
    fireEvent.press(getByText('Değerlendir'));
    await waitFor(() => expect(getByText('Nesne tespit edilemedi')).toBeTruthy());
  });

  it('API bağlantı hatasını kullanıcı dostu diyalogda gösterir', async () => {
    analyzeImageMock.mockRejectedValue({ isAxiosError: true, code: 'ERR_NETWORK' });
    const { getByText } = render(<HomeScreen />);
    await selectGallery(getByText);
    fireEvent.press(getByText('Detection'));
    fireEvent.press(getByText('Değerlendir'));
    await waitFor(() => expect(getByText('Sunucuya bağlanılamadı.')).toBeTruthy());
  });
});
