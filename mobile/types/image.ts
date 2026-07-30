export interface ImageDimensions {
  width: number;
  height: number;
}

export type ImageResizeTarget = { width: number; height: null } | { width: null; height: number };

export interface PickedImage extends ImageDimensions {
  uri: string;
  fileName: string | null;
  mimeType: string | null;
}

export type ImagePickOutcome =
  | { status: 'selected'; image: PickedImage }
  | { status: 'canceled' }
  | { status: 'permission-denied'; canAskAgain: boolean };
