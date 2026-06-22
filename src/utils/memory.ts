import type { ImageFile } from '../types';

type ObjectUrlRevoker = (url: string) => void;
type CanvasBuffer = Pick<HTMLCanvasElement, 'width' | 'height'>;

export function isObjectUrl(url: string | undefined): url is string {
  return Boolean(url?.startsWith('blob:'));
}

export function revokeObjectUrl(
  url: string | undefined,
  revoke: ObjectUrlRevoker = URL.revokeObjectURL.bind(URL),
): void {
  if (isObjectUrl(url)) revoke(url);
}

export function disposeImageResources(
  image: Pick<ImageFile, 'previewUrl' | 'resultUrl'>,
  revoke: ObjectUrlRevoker = URL.revokeObjectURL.bind(URL),
): void {
  const urls = new Set([image.previewUrl, image.resultUrl].filter(isObjectUrl));
  urls.forEach(revoke);
}

export function disposeImageCollection(
  images: ReadonlyArray<Pick<ImageFile, 'previewUrl' | 'resultUrl'>>,
  revoke: ObjectUrlRevoker = URL.revokeObjectURL.bind(URL),
): void {
  images.forEach((image) => disposeImageResources(image, revoke));
}

export function releaseCanvas(canvas: CanvasBuffer | undefined): void {
  if (!canvas) return;
  canvas.width = 0;
  canvas.height = 0;
}
