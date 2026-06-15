export interface CameraMetadata {
  make?: string;
  model?: string;
  lens?: string;
  exposureTime?: string;
  fNumber?: number;
  iso?: number;
  dateTime?: string;
  software?: string;
}

export interface ImageFile {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalType: string;
  convertedSize?: number;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  previewUrl?: string; // Data URL or Object URL for original/preview image
  resultBlob?: Blob; // The final converted JPEG Blob
  resultUrl?: string; // Object URL for final converted image
  errorMsg?: string;
  width?: number;
  height?: number;
  metadata?: CameraMetadata;
}

export type ResizeOption = 'original' | '4k' | '1080p' | '720p' | 'custom';

export interface ConversionSettings {
  quality: number; // 0.1 to 1.0 (defaults to 0.9)
  resizeMode: ResizeOption;
  customWidth?: number;
  customHeight?: number;
  keepMetadata: boolean;
}
