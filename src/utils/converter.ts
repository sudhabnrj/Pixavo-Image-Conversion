import exifr from 'exifr';
import type { ImageFile, ConversionSettings } from '../types';
import type { ConversionTool } from './conversionTools';
import { releaseCanvas, revokeObjectUrl } from './memory';

let rawDecoderInstance: any = null;

const getRawDecoder = async () => {
  if (!rawDecoderInstance) {
    const LibRaw = (await import('libraw-wasm')).default;
    rawDecoderInstance = new LibRaw();
  }
  return rawDecoderInstance;
};

/**
 * Creates a valid uncompressed Adobe DNG (TIFF container) Blob from ImageData.
 * Used for PNG to RAW / DNG conversion.
 */
export function createDngBlobFromImageData(imgData: ImageData): Blob {
  const width = imgData.width;
  const height = imgData.height;
  const pixelCount = width * height;
  const rawRgbLength = pixelCount * 3;

  const headerSize = 8;
  const ifdNumEntries = 12;
  const ifdSize = 2 + (ifdNumEntries * 12) + 4;
  const extraValuesOffset = headerSize + ifdSize; // 158
  const extraValuesSize = 6; // BitsPerSample: [8, 8, 8]
  const pixelBufferOffset = extraValuesOffset + extraValuesSize; // 164

  const totalSize = pixelBufferOffset + rawRgbLength;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // TIFF Header (Little Endian "II", magic 42, IFD0 offset 8)
  view.setUint8(0, 0x49); // 'I'
  view.setUint8(1, 0x49); // 'I'
  view.setUint16(2, 42, true);
  view.setUint32(4, 8, true);

  // IFD0 Entries count
  let p = 8;
  view.setUint16(p, ifdNumEntries, true);
  p += 2;

  const writeTag = (tag: number, type: number, count: number, valOrOffset: number) => {
    view.setUint16(p, tag, true);
    view.setUint16(p + 2, type, true);
    view.setUint32(p + 4, count, true);
    view.setUint32(p + 8, valOrOffset, true);
    p += 12;
  };

  // 0x00FE NewSubfileType: LONG (4), count 1, val 0
  writeTag(0x00FE, 4, 1, 0);
  // 0x0100 ImageWidth: LONG (4), count 1, val width
  writeTag(0x0100, 4, 1, width);
  // 0x0101 ImageLength: LONG (4), count 1, val height
  writeTag(0x0101, 4, 1, height);
  // 0x0102 BitsPerSample: SHORT (3), count 3, offset extraValuesOffset
  writeTag(0x0102, 3, 3, extraValuesOffset);
  // 0x0103 Compression: SHORT (3), count 1, val 1 (Uncompressed)
  writeTag(0x0103, 3, 1, 1);
  // 0x0106 PhotometricInterpretation: SHORT (3), count 1, val 2 (RGB)
  writeTag(0x0106, 3, 1, 2);
  // 0x0111 StripOffsets: LONG (4), count 1, offset pixelBufferOffset
  writeTag(0x0111, 4, 1, pixelBufferOffset);
  // 0x0115 SamplesPerPixel: SHORT (3), count 1, val 3
  writeTag(0x0115, 3, 1, 3);
  // 0x0116 RowsPerStrip: LONG (4), count 1, val height
  writeTag(0x0116, 4, 1, height);
  // 0x0117 StripByteCounts: LONG (4), count 1, val rawRgbLength
  writeTag(0x0117, 4, 1, rawRgbLength);
  // 0x011C PlanarConfiguration: SHORT (3), count 1, val 1
  writeTag(0x011C, 3, 1, 1);
  // 0xC612 DNGVersion: BYTE (1), count 4, val [1, 4, 0, 0] packed
  writeTag(0xC612, 1, 4, 0x00000401);

  // Next IFD Offset (0)
  view.setUint32(p, 0, true);

  // BitsPerSample values [8, 8, 8]
  view.setUint16(extraValuesOffset, 8, true);
  view.setUint16(extraValuesOffset + 2, 8, true);
  view.setUint16(extraValuesOffset + 4, 8, true);

  // Copy RGB pixels from ImageData (skipping Alpha)
  const rgba = imgData.data;
  let dst = pixelBufferOffset;
  for (let src = 0; src < rgba.length; src += 4) {
    bytes[dst++] = rgba[src];     // R
    bytes[dst++] = rgba[src + 1]; // G
    bytes[dst++] = rgba[src + 2]; // B
  }

  return new Blob([buffer], { type: 'image/x-adobe-dng' });
}

export const convertSingleImage = async (
  item: ImageFile,
  currentSettings: ConversionSettings,
  tool: ConversionTool,
  updateProgress: (p: number) => void
): Promise<{ blob: Blob; width: number; height: number }> => {
  updateProgress(10);

  let sourceBlob: Blob | undefined;
  let decodedRawCanvas: HTMLCanvasElement | undefined;
  const ext = item.name.split('.').pop()?.toLowerCase() || '';
  const isRaw = ['cr2', 'nef', 'arw', 'dng', 'pef', 'orf', 'rw2', 'raw'].includes(ext);
  const isHeic = ['heic', 'heif'].includes(ext) || item.file.type === 'image/heic' || item.file.type === 'image/heif';

  if (isRaw) {
    updateProgress(20);
    try {
      const rawBytes = new Uint8Array(await item.file.arrayBuffer());
      const rawDecoder = await getRawDecoder();
      await rawDecoder.open(rawBytes, {
        outputBps: 8,
        outputColor: 1,
        useCameraWb: true,
        useCameraMatrix: 1
      });

      updateProgress(40);
      const decoded = await rawDecoder.imageData();
      if (!decoded || decoded.bits !== 8 || decoded.width <= 0 || decoded.height <= 0) {
        throw new Error('The RAW decoder returned no usable image data.');
      }

      const pixels = decoded.data as Uint8Array;
      const pixelCount = decoded.width * decoded.height;
      const channelCount = decoded.colors || Math.floor(pixels.length / pixelCount);
      if (channelCount < 3 || pixels.length < pixelCount * channelCount) {
        throw new Error('The RAW decoder returned an unsupported pixel layout.');
      }

      const rgba = new Uint8ClampedArray(pixelCount * 4);
      for (let sourceIndex = 0, targetIndex = 0; targetIndex < rgba.length; sourceIndex += channelCount, targetIndex += 4) {
        rgba[targetIndex] = pixels[sourceIndex];
        rgba[targetIndex + 1] = pixels[sourceIndex + 1];
        rgba[targetIndex + 2] = pixels[sourceIndex + 2];
        rgba[targetIndex + 3] = 255;
      }

      decodedRawCanvas = document.createElement('canvas');
      decodedRawCanvas.width = decoded.width;
      decodedRawCanvas.height = decoded.height;
      const rawContext = decodedRawCanvas.getContext('2d');
      if (!rawContext) {
        releaseCanvas(decodedRawCanvas);
        decodedRawCanvas = undefined;
        throw new Error('Failed to create a canvas for the decoded RAW image.');
      }
      rawContext.putImageData(new ImageData(rgba, decoded.width, decoded.height), 0, 0);
      updateProgress(55);
    } catch (rawError) {
      releaseCanvas(decodedRawCanvas);
      decodedRawCanvas = undefined;
      console.warn('Full RAW decoding failed, trying the embedded thumbnail:', rawError);
      const thumbnail = await exifr.thumbnail(item.file);
      if (!thumbnail) {
        throw new Error(
          `Unable to decode this ${ext.toUpperCase()} file in the browser. The camera model or RAW variant may not be supported.`,
          { cause: rawError }
        );
      }

      sourceBlob = new Blob([new Uint8Array(thumbnail)], { type: 'image/jpeg' });
      updateProgress(45);
    }
  } else if (isHeic) {
    updateProgress(20);
    const heic2any = (await import('heic2any')).default;
    const result = await heic2any({
      blob: item.file,
      toType: 'image/jpeg',
      quality: currentSettings.quality
    });
    sourceBlob = (Array.isArray(result) ? result[0] : result) as Blob;
    updateProgress(50);
  } else {
    sourceBlob = item.file;
    updateProgress(30);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = sourceBlob ? URL.createObjectURL(sourceBlob) : '';
    let isSettled = false;
    let isSourceUrlReleased = false;

    const releaseSourceUrl = () => {
      if (isSourceUrlReleased) return;
      isSourceUrlReleased = true;
      revokeObjectUrl(url);
    };

    const releaseTemporaryResources = () => {
      releaseSourceUrl();
      img.onload = null;
      img.onerror = null;
      img.src = '';
      releaseCanvas(decodedRawCanvas);
      decodedRawCanvas = undefined;
    };

    const rejectOnce = (error: Error) => {
      if (isSettled) return;
      isSettled = true;
      releaseTemporaryResources();
      reject(error);
    };

    const renderImage = (source: CanvasImageSource, sourceWidth: number, sourceHeight: number) => {
      updateProgress(70);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        releaseCanvas(canvas);
        rejectOnce(new Error('Failed to retrieve canvas context.'));
        return;
      }

      // Calculate target dimensions
      let targetWidth = sourceWidth;
      let targetHeight = sourceHeight;
      let maxDim = 0;

      if (currentSettings.resizeMode === '4k') maxDim = 3840;
      else if (currentSettings.resizeMode === '1080p') maxDim = 1920;
      else if (currentSettings.resizeMode === '720p') maxDim = 1280;
      else if (currentSettings.resizeMode === 'custom') {
        const customW = currentSettings.customWidth || sourceWidth;
        const customH = currentSettings.customHeight || sourceHeight;
        const ratio = Math.min(customW / sourceWidth, customH / sourceHeight);
        targetWidth = Math.round(sourceWidth * ratio);
        targetHeight = Math.round(sourceHeight * ratio);
      }

      if (maxDim > 0 && (sourceWidth > maxDim || sourceHeight > maxDim)) {
        if (sourceWidth > sourceHeight) {
          targetWidth = maxDim;
          targetHeight = Math.round((sourceHeight * maxDim) / sourceWidth);
        } else {
          targetHeight = maxDim;
          targetWidth = Math.round((sourceWidth * maxDim) / sourceHeight);
        }
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      try {
        // If target output is JPG, draw white background first to avoid black background for transparent PNG/WebP images
        if (tool.targetExt === 'jpg' || tool.targetExt === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
        updateProgress(85);

        // Special handling for PNG -> RAW / DNG output
        if (tool.id === 'png-raw' || tool.targetExt === 'dng' || tool.targetExt === 'raw') {
          const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
          const dngBlob = createDngBlobFromImageData(imgData);
          releaseCanvas(canvas);
          isSettled = true;
          updateProgress(100);
          releaseTemporaryResources();
          resolve({
            blob: dngBlob,
            width: targetWidth,
            height: targetHeight
          });
          return;
        }

        const mimeType = tool.targetMime || 'image/jpeg';
        const quality = (mimeType === 'image/jpeg' || mimeType === 'image/webp') ? currentSettings.quality : undefined;

        canvas.toBlob(
          async (blob) => {
            releaseCanvas(canvas);
            if (!blob) {
              rejectOnce(new Error('Canvas conversion returned empty output.'));
              return;
            }
            if (isSettled) return;

            let finalBlob = blob;
            if (currentSettings.keepMetadata && item.metadata && mimeType === 'image/jpeg') {
              try {
                const { writeExifToBlob } = await import('./exif');
                finalBlob = await writeExifToBlob(blob, item.metadata);
              } catch (exifErr) {
                console.warn('Failed to insert EXIF metadata:', exifErr);
              }
            }

            isSettled = true;
            updateProgress(100);
            releaseTemporaryResources();
            resolve({
              blob: finalBlob,
              width: targetWidth,
              height: targetHeight
            });
          },
          mimeType,
          quality
        );
      } catch (error) {
        releaseCanvas(canvas);
        rejectOnce(error instanceof Error ? error : new Error('Failed to render the image.'));
      }
    };

    img.onload = () => {
      releaseSourceUrl();
      renderImage(img, img.width, img.height);
    };

    img.onerror = () => {
      rejectOnce(new Error('Failed to load image buffer. The file format may be unsupported or corrupted.'));
    };

    if (decodedRawCanvas) {
      renderImage(decodedRawCanvas, decodedRawCanvas.width, decodedRawCanvas.height);
    } else {
      img.src = url;
    }
  });
};
