import piexif from 'piexifjs';
import type { CameraMetadata } from '../types';

export async function writeExifToBlob(blob: Blob, metadata: CameraMetadata): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dataUrl = reader.result as string;
        const zeroth: Record<number, any> = {};
        const exif: Record<number, any> = {};
        
        if (metadata.make) zeroth[piexif.ImageIFD.Make] = metadata.make;
        if (metadata.model) zeroth[piexif.ImageIFD.Model] = metadata.model;
        if (metadata.software) zeroth[piexif.ImageIFD.Software] = metadata.software;
        else zeroth[piexif.ImageIFD.Software] = 'Pixavo';

        if (metadata.dateTime) {
          try {
            // EXIF date format is YYYY:MM:DD HH:MM:SS
            const dateObj = new Date(metadata.dateTime);
            if (!isNaN(dateObj.getTime())) {
              const pad = (n: number) => String(n).padStart(2, '0');
              const dateStr = `${dateObj.getFullYear()}:${pad(dateObj.getMonth() + 1)}:${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;
              zeroth[piexif.ImageIFD.DateTime] = dateStr;
              exif[piexif.ExifIFD.DateTimeOriginal] = dateStr;
              exif[piexif.ExifIFD.DateTimeDigitized] = dateStr;
            }
          } catch (dateErr) {
            console.warn('Failed to parse metadata date:', metadata.dateTime, dateErr);
          }
        }

        if (metadata.exposureTime) {
          // Shutter speed needs to be a rational number: [numerator, denominator]
          let val = parseFloat(metadata.exposureTime);
          if (metadata.exposureTime.includes('/')) {
            const [num, den] = metadata.exposureTime.split('/').map(Number);
            if (num && den) {
              exif[piexif.ExifIFD.ExposureTime] = [num, den];
            }
          } else if (!isNaN(val) && val > 0) {
            if (val < 1) {
              const denominator = Math.round(1 / val);
              exif[piexif.ExifIFD.ExposureTime] = [1, denominator];
            } else {
              exif[piexif.ExifIFD.ExposureTime] = [Math.round(val * 100), 100];
            }
          }
        }

        if (metadata.fNumber) {
          // FNumber is a rational number
          exif[piexif.ExifIFD.FNumber] = [Math.round(metadata.fNumber * 100), 100];
        }

        if (metadata.iso) {
          exif[piexif.ExifIFD.ISOSpeedRatings] = [metadata.iso];
        }

        if (metadata.lens) {
          exif[piexif.ExifIFD.LensModel] = metadata.lens;
        }

        const exifObj = { '0th': zeroth, 'Exif': exif, 'GPS': {} };
        const exifBytes = piexif.dump(exifObj);
        const insertedDataUrl = piexif.insert(exifBytes, dataUrl);
        
        // Convert insertedDataUrl back to Blob
        const binary = atob(insertedDataUrl.split(',')[1]);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i);
        }
        resolve(new Blob([array], { type: 'image/jpeg' }));
      } catch (e) {
        console.error('Failed to write EXIF:', e);
        resolve(blob); // Fallback to original blob if EXIF write fails
      }
    };
    reader.onerror = () => {
      reject(reader.error);
    };
    reader.readAsDataURL(blob);
  });
}
