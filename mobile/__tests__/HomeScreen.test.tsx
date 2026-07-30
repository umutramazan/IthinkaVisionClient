import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { HomeScreen } from '../screens/HomeScreen';
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

const pickImageFromLibraryMock = jest.mocked(pickImageFromLibrary);
const optimizeImageMock = jest.mocked(optimizeImage);

async function selectGallery(getByText: ReturnType<typeof render>['getByText']) {
  fireEvent.press(getByText('Galeri'));
  await waitFor(() => expect(getByText('Görsel analiz için hazır')).toBeTruthy());
}

describe('HomeScreen', () => {
  beforeEach(() => {
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

  afterEach(() => jest.useRealTimers());

  it('yalnızca Detection modelini gösterir', () => {
    const { getByText, queryByText } = render(<HomeScreen />);
    expect(getByText('Detection')).toBeTruthy();
    expect(queryByText('Classification')).toBeNull();
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

  it('loading sırasında kontrolleri pasifleştirir ve gruplu sonucu gösterir', async () => {
    const { getByRole, getByText } = render(<HomeScreen />);
    await selectGallery(getByText);
    jest.useFakeTimers();
    fireEvent.press(getByText('Detection'));
    fireEvent.press(getByText('Değerlendir'));

    expect(getByText('Görsel değerlendiriliyor…')).toBeTruthy();
    expect(getByRole('button', { name: 'Değerlendir' }).props.accessibilityState).toEqual({
      disabled: true,
    });
    expect(getByRole('button', { name: 'Kamera' }).props.accessibilityState).toEqual({
      disabled: true,
    });

    act(() => jest.advanceTimersByTime(700));
    expect(getByText('Person')).toBeTruthy();
    expect(getByText('2 adet')).toBeTruthy();
    expect(getByText('%96')).toBeTruthy();
  });

  it('boş sonucu hata yerine bilgi görünümü olarak gösterir', async () => {
    const { getByText } = render(<HomeScreen />);
    await selectGallery(getByText);
    jest.useFakeTimers();
    fireEvent.press(getByText('Detection'));
    fireEvent.press(getByText('Boş'));
    fireEvent.press(getByText('Değerlendir'));
    act(() => jest.advanceTimersByTime(700));
    expect(getByText('Nesne tespit edilemedi')).toBeTruthy();
  });

  it('statik hata senaryosunu kullanıcı dostu diyalogda gösterir', async () => {
    const { getByText } = render(<HomeScreen />);
    await selectGallery(getByText);
    jest.useFakeTimers();
    fireEvent.press(getByText('Detection'));
    fireEvent.press(getByText('Hata'));
    fireEvent.press(getByText('Değerlendir'));
    act(() => jest.advanceTimersByTime(700));
    expect(
      getByText('Görsel değerlendirilirken bir sorun oluştu. Lütfen tekrar deneyin.'),
    ).toBeTruthy();
  });
});
