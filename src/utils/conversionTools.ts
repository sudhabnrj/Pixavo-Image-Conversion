import React from 'react';
import {
  FileImage,
  Layers,
  Images,
  Files,
  MonitorCheck,
  Gem,
  DownloadCloud,
  Sparkles,
  RefreshCw,
  FileType
} from 'lucide-react';

export interface ConversionTool {
  id: string;
  title: string;
  desc: string;
  from: string;
  to: string;
  targetMime: string;
  targetExt: string;
  acceptedExtensions: string[];
  color: 'violet' | 'emerald' | 'rose' | 'blue' | 'amber' | 'indigo' | 'teal' | 'orange' | 'cyan' | 'purple';
  isFunctional: boolean;
  icon: React.ComponentType<{ className?: string }>;
  guideInfo: {
    about: string;
    useCases: string[];
  };
}

export const conversionTools: ConversionTool[] = [
  {
    id: 'raw-jpg',
    title: 'RAW to JPG',
    desc: 'Develop camera RAW files (DNG, CR2, NEF, ARW) into optimized JPEG format.',
    from: 'RAW',
    to: 'JPG',
    targetMime: 'image/jpeg',
    targetExt: 'jpg',
    acceptedExtensions: ['.cr2', '.cr3', '.nef', '.arw', '.rw2', '.raf', '.orf', '.pef', '.dng', '.raw'],
    color: 'violet',
    isFunctional: true,
    icon: FileImage,
    guideInfo: {
      about: 'Convert uncompressed DSLR & mirrorless camera RAW formats into standard JPEG images while maintaining rich color accurate tones.',
      useCases: ['Sharing photos on social media & messaging', 'Reducing massive RAW photo sizes for storage', 'Web publishing & quick email attachments']
    }
  },
  {
    id: 'heic-jpg',
    title: 'HEIC to JPG',
    desc: 'Convert Apple HEIC photos to standard JPEG formats locally.',
    from: 'HEIC',
    to: 'JPG',
    targetMime: 'image/jpeg',
    targetExt: 'jpg',
    acceptedExtensions: ['.heic', '.heif'],
    color: 'emerald',
    isFunctional: true,
    icon: Layers,
    guideInfo: {
      about: 'Transform iPhone HEIC and HEIF photos into universally compatible JPEG files readable by any device or operating system.',
      useCases: ['Opening iPhone photos on Windows PCs', 'Uploading photos to platforms that do not accept HEIC', 'Printing and editing in legacy photo software']
    }
  },
  {
    id: 'png-jpg',
    title: 'PNG to JPG',
    desc: 'Convert transparent or standard PNG images to compressed JPEG files.',
    from: 'PNG',
    to: 'JPG',
    targetMime: 'image/jpeg',
    targetExt: 'jpg',
    acceptedExtensions: ['.png'],
    color: 'rose',
    isFunctional: true,
    icon: Images,
    guideInfo: {
      about: 'Compress heavy PNG images into lightweight JPEG files with custom quality controls and solid white background handling.',
      useCases: ['Shrinking website asset sizes', 'Converting screenshot graphics for email', 'Reducing storage footprint']
    }
  },
  {
    id: 'jpg-png',
    title: 'JPG to PNG',
    desc: 'Convert JPG images to PNG format with alpha channel support.',
    from: 'JPG',
    to: 'PNG',
    targetMime: 'image/png',
    targetExt: 'png',
    acceptedExtensions: ['.jpg', '.jpeg'],
    color: 'blue',
    isFunctional: true,
    icon: Files,
    guideInfo: {
      about: 'Export JPEG photos to lossless PNG format, perfect for adding transparency or preparing graphics for graphic design.',
      useCases: ['Lossless image editing & layer work', 'Digital art asset preparation', 'Preventing generational compression degradation']
    }
  },
  {
    id: 'raw-png',
    title: 'RAW to PNG',
    desc: 'Convert camera RAW files directly to high quality PNG format.',
    from: 'RAW',
    to: 'PNG',
    targetMime: 'image/png',
    targetExt: 'png',
    acceptedExtensions: ['.cr2', '.cr3', '.nef', '.arw', '.rw2', '.raf', '.orf', '.pef', '.dng', '.raw'],
    color: 'amber',
    isFunctional: true,
    icon: MonitorCheck,
    guideInfo: {
      about: 'Extract high-detail sensor data directly into lossless PNG images without JPEG compression artifacts.',
      useCases: ['High-precision editing pipelines', 'Publishing uncompressed camera samples', 'Graphic design & composite work']
    }
  },
  {
    id: 'png-raw',
    title: 'PNG to RAW',
    desc: 'Pack PNG graphics back into uncompressed DNG camera RAW stubs.',
    from: 'PNG',
    to: 'RAW',
    targetMime: 'image/x-adobe-dng',
    targetExt: 'dng',
    acceptedExtensions: ['.png'],
    color: 'indigo',
    isFunctional: true,
    icon: Gem,
    guideInfo: {
      about: 'Encapsulate pixel graphics into raw Adobe DNG format container stubs for photography software integration.',
      useCases: ['Importing raster graphics into RAW photo tools', 'RAW workflow simulation', 'Archival sensor container encapsulation']
    }
  },
  {
    id: 'webp-jpg',
    title: 'WebP to JPG',
    desc: 'Decompress modern WebP image formats into standard JPEGs.',
    from: 'WebP',
    to: 'JPG',
    targetMime: 'image/jpeg',
    targetExt: 'jpg',
    acceptedExtensions: ['.webp'],
    color: 'teal',
    isFunctional: true,
    icon: DownloadCloud,
    guideInfo: {
      about: 'Convert downloaded WebP graphics back to classic JPG images compatible with legacy tools and documents.',
      useCases: ['Using web photos in Word or PowerPoint', 'Editing in older image viewers', 'Printing downloaded web images']
    }
  },
  {
    id: 'jpg-webp',
    title: 'JPG to WebP',
    desc: 'Encode regular JPEGs into modern, highly compressed WebP files.',
    from: 'JPG',
    to: 'WebP',
    targetMime: 'image/webp',
    targetExt: 'webp',
    acceptedExtensions: ['.jpg', '.jpeg'],
    color: 'orange',
    isFunctional: true,
    icon: Sparkles,
    guideInfo: {
      about: 'Supercharge site performance by converting bulky JPEGs into next-gen WebP format with up to 30-50% file size reduction.',
      useCases: ['Optimizing website loading speed & SEO', 'Saving mobile data and server storage', 'Modern web app asset optimization']
    }
  },
  {
    id: 'webp-png',
    title: 'WebP to PNG',
    desc: 'Convert WebP images to lossless PNG format with transparent alpha.',
    from: 'WebP',
    to: 'PNG',
    targetMime: 'image/png',
    targetExt: 'png',
    acceptedExtensions: ['.webp'],
    color: 'cyan',
    isFunctional: true,
    icon: RefreshCw,
    guideInfo: {
      about: 'Convert WebP graphics and transparent icons into lossless PNG format without losing fine details or transparency.',
      useCases: ['Extracting transparent web stickers & logos', 'Editing web assets in Photoshop', 'Design system icon conversions']
    }
  },
  {
    id: 'png-webp',
    title: 'PNG to WebP',
    desc: 'Compress PNG files into modern WebP with full transparency support.',
    from: 'PNG',
    to: 'WebP',
    targetMime: 'image/webp',
    targetExt: 'webp',
    acceptedExtensions: ['.png'],
    color: 'purple',
    isFunctional: true,
    icon: FileType,
    guideInfo: {
      about: 'Dramatically reduce PNG file sizes while keeping 100% transparent backgrounds intact using modern WebP compression.',
      useCases: ['Web transparent hero graphics', 'UI icon & illustration web optimization', 'Faster page speed scores']
    }
  }
];

export const getToolById = (id: string): ConversionTool => {
  return conversionTools.find(t => t.id === id) || conversionTools[0];
};
