import { IMAGE_MAX_LONG_EDGE } from '../constants/image';
import type { ImageDimensions, ImageResizeTarget } from '../types/image';

function assertValidDimension(value: number, name: 'width' | 'height') {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive finite number.`);
  }
}

export function getImageResizeTarget(
  dimensions: ImageDimensions,
  maxLongEdge = IMAGE_MAX_LONG_EDGE,
): ImageResizeTarget | null {
  assertValidDimension(dimensions.width, 'width');
  assertValidDimension(dimensions.height, 'height');
  assertValidDimension(maxLongEdge, 'width');

  const longEdge = Math.max(dimensions.width, dimensions.height);
  if (longEdge <= maxLongEdge) {
    return null;
  }

  return dimensions.width >= dimensions.height
    ? { width: maxLongEdge, height: null }
    : { width: null, height: maxLongEdge };
}

export function calculateOptimizedDimensions(
  dimensions: ImageDimensions,
  maxLongEdge = IMAGE_MAX_LONG_EDGE,
): ImageDimensions {
  const resizeTarget = getImageResizeTarget(dimensions, maxLongEdge);
  if (!resizeTarget) {
    return { ...dimensions };
  }

  const scale = maxLongEdge / Math.max(dimensions.width, dimensions.height);

  return {
    width: Math.round(dimensions.width * scale),
    height: Math.round(dimensions.height * scale),
  };
}
