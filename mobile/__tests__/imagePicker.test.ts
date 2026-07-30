import * as ImagePicker from 'expo-image-picker';

import {
  pickImageFromCamera,
  pickImageFromLibrary,
  recoverPendingImagePick,
} from '../utils/imagePicker';

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  getPendingResultAsync: jest.fn(),
}));

const requestCameraPermissionsMock = jest.mocked(ImagePicker.requestCameraPermissionsAsync);
const launchCameraMock = jest.mocked(ImagePicker.launchCameraAsync);
const launchLibraryMock = jest.mocked(ImagePicker.launchImageLibraryAsync);
const getPendingResultMock = jest.mocked(ImagePicker.getPendingResultAsync);

function permissionResult(granted: boolean, canAskAgain: boolean) {
  return {
    granted,
    canAskAgain,
    status: granted ? 'granted' : 'denied',
    expires: 'never',
  } as Awaited<ReturnType<typeof ImagePicker.requestCameraPermissionsAsync>>;
}

describe('kamera görsel seçimi', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('geçici izin reddini kamera açmadan döndürür', async () => {
    requestCameraPermissionsMock.mockResolvedValue(permissionResult(false, true));

    await expect(pickImageFromCamera()).resolves.toEqual({
      status: 'permission-denied',
      canAskAgain: true,
    });
    expect(launchCameraMock).not.toHaveBeenCalled();
  });

  it('kalıcı izin reddini ayırt eder', async () => {
    requestCameraPermissionsMock.mockResolvedValue(permissionResult(false, false));

    await expect(pickImageFromCamera()).resolves.toEqual({
      status: 'permission-denied',
      canAskAgain: false,
    });
  });

  it('kullanıcı kamera akışını iptal ettiğinde hata üretmez', async () => {
    requestCameraPermissionsMock.mockResolvedValue(permissionResult(true, true));
    launchCameraMock.mockResolvedValue({ canceled: true, assets: null });

    await expect(pickImageFromCamera()).resolves.toEqual({ status: 'canceled' });
  });

  it('çekilen tek görseli uygulama tipine dönüştürür', async () => {
    requestCameraPermissionsMock.mockResolvedValue(permissionResult(true, true));
    launchCameraMock.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file:///camera/photo.jpg',
          width: 4032,
          height: 3024,
          fileName: 'photo.jpg',
          mimeType: 'image/jpeg',
          type: 'image',
        },
      ],
    });

    await expect(pickImageFromCamera()).resolves.toEqual({
      status: 'selected',
      image: {
        uri: 'file:///camera/photo.jpg',
        width: 4032,
        height: 3024,
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
      },
    });
    expect(launchCameraMock).toHaveBeenCalledWith({
      mediaTypes: ['images'],
      allowsEditing: false,
      allowsMultipleSelection: false,
      quality: 1,
      base64: false,
      exif: false,
    });
  });
});

describe('galeri görsel seçimi', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('tek görseli ön izin istemeden seçer', async () => {
    launchLibraryMock.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file:///library/image.png',
          width: 1600,
          height: 900,
          fileName: 'image.png',
          mimeType: 'image/png',
          type: 'image',
        },
      ],
    });

    await expect(pickImageFromLibrary()).resolves.toEqual({
      status: 'selected',
      image: {
        uri: 'file:///library/image.png',
        width: 1600,
        height: 900,
        fileName: 'image.png',
        mimeType: 'image/png',
      },
    });
    expect(requestCameraPermissionsMock).not.toHaveBeenCalled();
    expect(launchLibraryMock).toHaveBeenCalledWith({
      mediaTypes: ['images'],
      allowsEditing: false,
      allowsMultipleSelection: false,
      quality: 1,
      base64: false,
      exif: false,
    });
  });

  it('galeri seçimi iptal edildiğinde hata üretmez', async () => {
    launchLibraryMock.mockResolvedValue({ canceled: true, assets: null });
    await expect(pickImageFromLibrary()).resolves.toEqual({ status: 'canceled' });
  });

  it('Android bekleyen seçimini geri yükler', async () => {
    getPendingResultMock.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file:///recovered/image.jpg',
          width: 1280,
          height: 720,
          fileName: null,
          mimeType: 'image/jpeg',
          type: 'image',
        },
      ],
    });

    await expect(recoverPendingImagePick()).resolves.toEqual({
      status: 'selected',
      image: {
        uri: 'file:///recovered/image.jpg',
        width: 1280,
        height: 720,
        fileName: null,
        mimeType: 'image/jpeg',
      },
    });
  });

  it('bekleyen seçim yoksa null döndürür', async () => {
    getPendingResultMock.mockResolvedValue(null);
    await expect(recoverPendingImagePick()).resolves.toBeNull();
  });

  it('Android bekleyen seçim hatasını reddeder', async () => {
    getPendingResultMock.mockResolvedValue({
      code: 'ERR_PICKER',
      message: 'Picker activity failed.',
    });

    await expect(recoverPendingImagePick()).rejects.toThrow('Picker activity failed.');
  });
});
