import * as ImagePicker from 'expo-image-picker';

import type { ImagePickOutcome, PickedImage } from '../types/image';

const imagePickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: false,
  allowsMultipleSelection: false,
  quality: 1,
  base64: false,
  exif: false,
};

function mapAsset(asset: ImagePicker.ImagePickerAsset): PickedImage {
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    fileName: asset.fileName ?? null,
    mimeType: asset.mimeType ?? null,
  };
}

function mapPickerResult(result: ImagePicker.ImagePickerResult): ImagePickOutcome {
  if (result.canceled) {
    return { status: 'canceled' };
  }

  const asset = result.assets[0];
  if (!asset) {
    throw new Error('Image picker result did not include an image asset.');
  }

  return { status: 'selected', image: mapAsset(asset) };
}

export async function pickImageFromCamera(): Promise<ImagePickOutcome> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    return {
      status: 'permission-denied',
      canAskAgain: permission.canAskAgain,
    };
  }

  const result = await ImagePicker.launchCameraAsync(imagePickerOptions);

  return mapPickerResult(result);
}

export async function pickImageFromLibrary(): Promise<ImagePickOutcome> {
  const result = await ImagePicker.launchImageLibraryAsync(imagePickerOptions);
  return mapPickerResult(result);
}

export async function recoverPendingImagePick(): Promise<ImagePickOutcome | null> {
  const result = await ImagePicker.getPendingResultAsync();

  if (!result) {
    return null;
  }

  if ('code' in result) {
    throw new Error(result.message);
  }

  return mapPickerResult(result);
}
