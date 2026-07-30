import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { IMAGE_JPEG_QUALITY } from '../constants/image';
import type { PickedImage } from '../types/image';
import { getImageResizeTarget } from './imageResize';

export class ImageOptimizationError extends Error {
  constructor() {
    super('Image optimization failed.');
    this.name = 'ImageOptimizationError';
  }
}

export async function optimizeImage(image: PickedImage): Promise<PickedImage> {
  try {
    const context = ImageManipulator.manipulate(image.uri);
    const resizeTarget = getImageResizeTarget(image);

    if (resizeTarget) {
      context.resize(resizeTarget);
    }

    const renderedImage = await context.renderAsync();
    const result = await renderedImage.saveAsync({
      format: SaveFormat.JPEG,
      compress: IMAGE_JPEG_QUALITY,
    });

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      fileName: 'ithinka-analysis.jpg',
      mimeType: 'image/jpeg',
    };
  } catch {
    throw new ImageOptimizationError();
  }
}
