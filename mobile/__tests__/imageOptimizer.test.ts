import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { IMAGE_JPEG_QUALITY } from '../constants/image';
import { ImageOptimizationError, optimizeImage } from '../utils/imageOptimizer';

jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: {
    manipulate: jest.fn(),
  },
  SaveFormat: {
    JPEG: 'jpeg',
  },
}));

const manipulateMock = jest.mocked(ImageManipulator.manipulate);
const resizeMock = jest.fn();
const renderMock = jest.fn();
const saveMock = jest.fn();

function arrangeManipulatorResult(width: number, height: number) {
  saveMock.mockResolvedValue({
    uri: 'file:///cache/optimized.jpg',
    width,
    height,
  });
  renderMock.mockResolvedValue({ saveAsync: saveMock });
  manipulateMock.mockReturnValue({
    resize: resizeMock,
    renderAsync: renderMock,
  } as unknown as ReturnType<typeof ImageManipulator.manipulate>);
}

describe('görsel optimizasyonu', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('büyük yatay görseli 1280 genişliğe indirip JPEG 0.85 kaydeder', async () => {
    arrangeManipulatorResult(1280, 960);

    await expect(
      optimizeImage({
        uri: 'file:///original.jpg',
        width: 4000,
        height: 3000,
        fileName: 'original.jpg',
        mimeType: 'image/jpeg',
      }),
    ).resolves.toEqual({
      uri: 'file:///cache/optimized.jpg',
      width: 1280,
      height: 960,
      fileName: 'ithinka-analysis.jpg',
      mimeType: 'image/jpeg',
    });

    expect(manipulateMock).toHaveBeenCalledWith('file:///original.jpg');
    expect(resizeMock).toHaveBeenCalledWith({ width: 1280, height: null });
    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledWith({
      format: SaveFormat.JPEG,
      compress: IMAGE_JPEG_QUALITY,
    });
  });

  it('büyük portre görseli 1280 yüksekliğe indirir', async () => {
    arrangeManipulatorResult(960, 1280);

    await optimizeImage({
      uri: 'file:///portrait.jpg',
      width: 3000,
      height: 4000,
      fileName: null,
      mimeType: null,
    });

    expect(resizeMock).toHaveBeenCalledWith({ width: null, height: 1280 });
  });

  it('küçük görseli büyütmeden JPEG olarak normalize eder', async () => {
    arrangeManipulatorResult(800, 600);

    const result = await optimizeImage({
      uri: 'file:///small.png',
      width: 800,
      height: 600,
      fileName: 'small.png',
      mimeType: 'image/png',
    });

    expect(resizeMock).not.toHaveBeenCalled();
    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(result.mimeType).toBe('image/jpeg');
  });

  it('native işlem hatasını kullanıcı katmanının ayırt edebileceği hataya dönüştürür', async () => {
    manipulateMock.mockImplementation(() => {
      throw new Error('Native image decode failed.');
    });

    await expect(
      optimizeImage({
        uri: 'file:///broken.jpg',
        width: 1280,
        height: 720,
        fileName: null,
        mimeType: null,
      }),
    ).rejects.toBeInstanceOf(ImageOptimizationError);
  });
});
