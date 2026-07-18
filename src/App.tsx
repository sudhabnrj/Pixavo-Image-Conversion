import { useState, useEffect, useRef } from 'react';
import exifr from 'exifr';
import {
  Sparkles,
  Trash2,
  Download,
  FolderArchive,
  Play,
  AlertCircle,
  FileImage,
  Layers,
  LockKeyhole,
  Gauge,
  WifiOff,
  MonitorCheck,
  Images,
  ShieldCheck,
  Gem,
  DownloadCloud,
  Files,
  ArrowRight,
  Mail
} from 'lucide-react';

import { Dropzone } from './components/Dropzone';
import { SettingsPanel } from './components/SettingsPanel';
import { FileCard } from './components/FileCard';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FAQ } from './components/FAQ';
import {
  disposeImageCollection,
  disposeImageResources,
  releaseCanvas,
  revokeObjectUrl,
} from './utils/memory';
import type { ImageFile, ConversionSettings, CameraMetadata } from './types';

let rawDecoderInstance: any = null;
const getRawDecoder = async () => {
  if (!rawDecoderInstance) {
    const LibRaw = (await import('libraw-wasm')).default;
    rawDecoderInstance = new LibRaw();
  }
  return rawDecoderInstance;
};

const features = [
  { title: '100% Browser Based', description: 'Everything runs directly in your browser—no remote processing.', icon: MonitorCheck },
  { title: 'Batch Conversion', description: 'Queue and convert multiple images in one streamlined workflow.', icon: Images },
  { title: 'Privacy First', description: 'Your private photos stay on your device from start to finish.', icon: ShieldCheck },
  { title: 'High Quality Output', description: 'Fine-tune JPEG quality and dimensions for polished results.', icon: Gem },
  { title: 'No Installation', description: 'Open Pixavo and start converting without downloading software.', icon: DownloadCloud },
  { title: 'Multiple RAW Formats', description: 'Work with popular RAW files from leading camera manufacturers.', icon: Files },
];

const formats = ['CR2', 'CR3', 'NEF', 'ARW', 'RW2', 'RAF', 'ORF', 'PEF', 'DNG', 'RAW'];

const benefits = [
  { title: 'No Upload Required', description: 'Skip slow transfers and keep every original file on your device.', icon: LockKeyhole },
  { title: 'Faster Than Cloud Converters', description: 'Start processing immediately without waiting for uploads or downloads.', icon: Gauge },
  { title: 'Works Offline', description: 'Once loaded, core conversion happens locally without a server round trip.', icon: WifiOff },
  { title: 'Secure Local Processing', description: 'Browser-native processing keeps sensitive photography under your control.', icon: ShieldCheck },
];

interface ConversionTool {
  id: string;
  title: string;
  desc: string;
  from: string;
  to: string;
  color: 'violet' | 'emerald' | 'rose' | 'blue' | 'amber' | 'indigo' | 'teal' | 'orange';
  isFunctional: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

const conversionTools: ConversionTool[] = [
  { id: 'raw-jpg', title: 'RAW to JPG', desc: 'Develop camera RAW files (DNG, CR2, NEF, ARW) into optimized JPEG format.', from: 'RAW', to: 'JPG', color: 'violet', isFunctional: true, icon: FileImage },
  { id: 'heic-jpg', title: 'HEIC to JPG', desc: 'Convert Apple HEIC photos to standard JPEG formats locally.', from: 'HEIC', to: 'JPG', color: 'emerald', isFunctional: true, icon: Layers },
  { id: 'png-jpg', title: 'PNG to JPG', desc: 'Convert transparent or standard PNG images to compressed JPEG files.', from: 'PNG', to: 'JPG', color: 'rose', isFunctional: false, icon: Images },
  { id: 'jpg-png', title: 'JPG to PNG', desc: 'Convert JPG images to PNG format with alpha channel support.', from: 'JPG', to: 'PNG', color: 'blue', isFunctional: false, icon: Files },
  { id: 'raw-png', title: 'RAW to PNG', desc: 'Convert camera RAW files directly to high quality PNG format.', from: 'RAW', to: 'PNG', color: 'amber', isFunctional: false, icon: MonitorCheck },
  { id: 'png-raw', title: 'PNG to RAW', desc: 'Pack PNG graphics back into uncompressed sensor container stubs.', from: 'PNG', to: 'RAW', color: 'indigo', isFunctional: false, icon: Gem },
  { id: 'webp-jpg', title: 'WebP to JPG', desc: 'Decompress modern WebP image formats into standard JPEGs.', from: 'WebP', to: 'JPG', color: 'teal', isFunctional: false, icon: DownloadCloud },
  { id: 'jpg-webp', title: 'JPG to WebP', desc: 'Encode regular JPEGs into modern, highly compressed WebP files.', from: 'JPG', to: 'WebP', color: 'orange', isFunctional: false, icon: Sparkles }
];

function App() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const filesRef = useRef<ImageFile[]>([]);
  const isMountedRef = useRef(true);
  const [settings, setSettings] = useState<ConversionSettings>({
    quality: 0.9,
    resizeMode: 'original',
    keepMetadata: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTool, setActiveTool] = useState<string>('raw-jpg');
  const [globalProgress, setGlobalProgress] = useState(0);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Release every object URL still owned by the queue on unmount.
  useEffect(() => {
    // React Strict Mode runs an extra setup/cleanup cycle in development.
    // Restore the mounted state during each setup so async uploads are retained.
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      disposeImageCollection(filesRef.current);
    };
  }, []);

  // Extract EXIF camera metadata
  const getMetadata = async (file: File): Promise<CameraMetadata | undefined> => {
    try {
      const tags = await exifr.parse(file, {
        pick: ['Make', 'Model', 'LensModel', 'ExposureTime', 'FNumber', 'ISO', 'DateTimeOriginal', 'Software']
      });
      if (!tags) return undefined;
      return {
        make: tags.Make,
        model: tags.Model,
        lens: tags.LensModel || tags.Lens,
        exposureTime: tags.ExposureTime ? String(tags.ExposureTime) : undefined,
        fNumber: tags.FNumber,
        iso: tags.ISO,
        dateTime: tags.DateTimeOriginal ? new Date(tags.DateTimeOriginal).toISOString() : undefined,
        software: tags.Software
      };
    } catch (e) {
      console.warn('Metadata extraction failed for:', file.name, e);
      return undefined;
    }
  };

  // Generate a preview URL for files (including RAW/HEIC fallbacks)
  const getPreviewUrl = async (file: File, ext: string): Promise<string> => {
    const isRaw = ['cr2', 'nef', 'arw', 'dng', 'pef', 'orf', 'rw2'].includes(ext);
    const isHeic = ['heic', 'heif'].includes(ext);

    if (isRaw) {
      try {
        // exifr.thumbnailUrl returns a blob URL of the embedded thumbnail
        const url = await exifr.thumbnailUrl(file);
        return url || '';
      } catch (e) {
        console.warn('Failed to extract RAW thumbnail preview:', e);
        return '';
      }
    } else if (isHeic) {
      try {
        const heic2any = (await import('heic2any')).default;
        // heic2any can decode a lower-quality preview blob
        const converted = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.2
        });
        const blob = Array.isArray(converted) ? converted[0] : converted;
        return URL.createObjectURL(blob);
      } catch (e) {
        console.warn('Failed to extract HEIC preview:', e);
        return '';
      }
    } else {
      // Standard image files
      return URL.createObjectURL(file);
    }
  };

  // Handle files added to dropzone
  const handleFilesAdded = async (newFiles: File[]) => {
    const newQueueItems: ImageFile[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const id = `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`;
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      // Skip duplicate names in current queue
      if (files.some(f => f.name === file.name)) {
        continue;
      }

      // Add placeholder item first to show loading state
      const metadata = await getMetadata(file);
      const previewUrl = await getPreviewUrl(file, ext);

      newQueueItems.push({
        id,
        file,
        name: file.name,
        originalSize: file.size,
        originalType: file.type || `image/${ext}`,
        status: 'pending',
        progress: 0,
        previewUrl,
        metadata
      });
    }

    if (!isMountedRef.current) {
      disposeImageCollection(newQueueItems);
      return;
    }

    setFiles(prev => [...prev, ...newQueueItems]);
  };

  // Remove individual file from list
  const handleRemoveFile = (id: string) => {
    const target = files.find(f => f.id === id);
    if (target) disposeImageResources(target);
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // Clear all files
  const handleClearAll = () => {
    disposeImageCollection(files);
    setFiles([]);
  };

  // Convert a single image task
  const convertSingleImage = async (
    item: ImageFile,
    currentSettings: ConversionSettings,
    updateProgress: (p: number) => void
  ): Promise<{ blob: Blob; width: number; height: number }> => {
    updateProgress(10);

    let sourceBlob: Blob | undefined;
    let decodedRawCanvas: HTMLCanvasElement | undefined;
    const ext = item.name.split('.').pop()?.toLowerCase() || '';
    const isRaw = ['cr2', 'nef', 'arw', 'dng', 'pef', 'orf', 'rw2'].includes(ext);
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
          // Fill canvas with white background to handle transparency gracefully (prevent black background in JPEG)
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          // Render image onto canvas
          ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
          updateProgress(85);

          canvas.toBlob(
            async (blob) => {
              releaseCanvas(canvas);
              if (!blob) {
                rejectOnce(new Error('Canvas compression returned empty output.'));
                return;
              }
              if (isSettled) return;

              let finalBlob = blob;
              if (currentSettings.keepMetadata && item.metadata) {
                try {
                  const { writeExifToBlob } = await import('./utils/exif');
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
            'image/jpeg',
            currentSettings.quality
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

  // Run the conversion for all files in the queue
  const handleStartConversion = async () => {
    const pendingItems = files.filter(f => f.status === 'pending' || f.status === 'error');
    if (pendingItems.length === 0) return;

    setIsProcessing(true);
    setGlobalProgress(0);

    let completedCount = 0;
    const totalCount = pendingItems.length;

    // Convert items sequentially to prevent browser threads freezing
    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];

      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processing', progress: 5 } : f));

      try {
        const { blob, width, height } = await convertSingleImage(
          item,
          settings,
          (prog) => {
            setFiles(prev => prev.map(f => f.id === item.id ? { ...f, progress: prog } : f));
          }
        );

        if (!isMountedRef.current) return;
        const resultUrl = URL.createObjectURL(blob);

        setFiles(prev => prev.map(f => {
          if (f.id !== item.id) return f;
          revokeObjectUrl(f.resultUrl);
          return {
            ...f,
            status: 'success',
            progress: 100,
            convertedSize: blob.size,
            resultBlob: blob,
            resultUrl,
            width,
            height
          };
        }));
      } catch (err: unknown) {
        console.error('Error during image conversion:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error occurred during processing.';
        setFiles(prev => prev.map(f =>
          f.id === item.id
            ? { ...f, status: 'error', errorMsg: errorMessage, progress: 0 }
            : f
        ));
      }

      completedCount++;
      setGlobalProgress(Math.round((completedCount / totalCount) * 100));
    }

    setIsProcessing(false);
  };

  // Download individual file
  const handleDownloadFile = (item: ImageFile) => {
    if (!item.resultUrl || !item.resultBlob) return;
    const originalName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    const downloadName = `${originalName}.jpg`;

    const a = document.createElement('a');
    a.href = item.resultUrl;
    a.download = downloadName;
    document.body.appendChild(a);
    try {
      a.click();
    } finally {
      a.remove();
    }
  };

  // Download all files (ZIP creation if multiple, otherwise individual)
  const handleDownloadAll = async () => {
    const successFiles = files.filter(f => f.status === 'success' && f.resultBlob && f.resultUrl);
    if (successFiles.length === 0) return;

    if (successFiles.length === 1) {
      handleDownloadFile(successFiles[0]);
      return;
    }

    // Multiple files: package into ZIP
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    successFiles.forEach((file) => {
      if (file.resultBlob) {
        const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        zip.file(`${originalName}.jpg`, file.resultBlob);
      }
    });

    try {
      const zipContent = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipContent);
      const a = document.createElement('a');
      try {
        a.href = zipUrl;
        a.download = `converted_images_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
      } finally {
        a.remove();
        revokeObjectUrl(zipUrl);
      }
    } catch (e) {
      console.error('ZIP packaging failed:', e);
      alert('Failed to generate ZIP file.');
    }
  };

  const successCount = files.filter(f => f.status === 'success').length;
  const pendingCount = files.filter(f => f.status === 'pending' || f.status === 'error').length;

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <section
          id="converter"
          className="scroll-mt-24 px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8"
          aria-labelledby="converter-title"
        >
          <div className="mx-auto max-w-6xl space-y-10">
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center space-x-2 rounded-full border border-brand-violet/10 bg-brand-violet/5 px-4 py-1.5 text-xs font-bold tracking-wide text-brand-violet shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Local Browser Image Development</span>
              </div>
              <h1 id="converter-title" className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent">
                Develop RAW Photos Instantly
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-slate-500 sm:text-base leading-relaxed">
                Convert proprietary RAW formats, HEIC, PNGs, and WebPs into optimized JPGs. Fully secure, client-side conversion means your photos never leave your device.
              </p>
            </div>

            {/* iLoveIMG Style tools selection grid */}
            <div className="space-y-6 pt-4 animate-fadeIn">
              <h2 className="text-center text-sm font-bold uppercase tracking-wider text-slate-400">Select Image Tool</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                {conversionTools.map((tool) => {
                  const isActive = activeTool === tool.id;
                  const Icon = tool.icon;

                  // Map color classes
                  const colorMap = {
                    violet: { bgClass: 'bg-brand-violet text-white', iconBg: 'bg-white/15 text-white', text: 'text-white', desc: 'text-white/85', shadow: 'hover:shadow-brand-violet/25 hover:shadow-xl' },
                    emerald: { bgClass: 'bg-brand-emerald text-white', iconBg: 'bg-white/15 text-white', text: 'text-white', desc: 'text-white/85', shadow: 'hover:shadow-brand-emerald/25 hover:shadow-xl' },
                    rose: { bgClass: 'bg-rose-600 text-white', iconBg: 'bg-white/15 text-white', text: 'text-white', desc: 'text-white/85', shadow: 'hover:shadow-rose-600/25 hover:shadow-xl' },
                    blue: { bgClass: 'bg-blue-600 text-white', iconBg: 'bg-white/15 text-white', text: 'text-white', desc: 'text-white/85', shadow: 'hover:shadow-blue-600/25 hover:shadow-xl' },
                    amber: { bgClass: 'bg-amber-600 text-white', iconBg: 'bg-white/15 text-white', text: 'text-white', desc: 'text-white/85', shadow: 'hover:shadow-amber-600/25 hover:shadow-xl' },
                    indigo: { bgClass: 'bg-indigo-600 text-white', iconBg: 'bg-white/15 text-white', text: 'text-white', desc: 'text-white/85', shadow: 'hover:shadow-indigo-600/25 hover:shadow-xl' },
                    teal: { bgClass: 'bg-teal-600 text-white', iconBg: 'bg-white/15 text-white', text: 'text-white', desc: 'text-white/85', shadow: 'hover:shadow-teal-600/25 hover:shadow-xl' },
                    orange: { bgClass: 'bg-orange-600 text-white', iconBg: 'bg-white/15 text-white', text: 'text-white', desc: 'text-white/85', shadow: 'hover:shadow-orange-600/25 hover:shadow-xl' }
                  };

                  const colors = colorMap[tool.color];

                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setActiveTool(tool.id);
                        setTimeout(() => {
                          document.getElementById('converter-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 50);
                      }}
                      className={`group flex flex-col items-start p-6 text-left rounded-3xl border border-transparent transition-all duration-300 cursor-pointer ${colors.bgClass} ${
                        isActive 
                          ? `ring-4 ring-offset-2 ring-slate-800 scale-[1.02] shadow-xl` 
                          : `${colors.shadow} hover:-translate-y-1`
                      }`}
                    >
                      <div className={`p-3 rounded-xl mb-4 ${colors.iconBg} shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className={`text-[17px] font-extrabold ${colors.text} mb-2 w-full`}>
                        {tool.title}
                      </h3>
                      <p className={`text-[13.5px] ${colors.desc} leading-relaxed`}>{tool.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Converter Workspace container */}
            <div
              id="converter-workspace"
              className="scroll-mt-24 rounded-[2rem] border border-slate-100/80 bg-white/70 p-6 md:p-8 shadow-sm backdrop-blur-md space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div>
                  <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-brand-violet/10 text-brand-violet">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <span>Workspace: {conversionTools.find(t => t.id === activeTool)?.title} Converter</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Configure options and develop your files locally.</p>
                </div>
                {!conversionTools.find(t => t.id === activeTool)?.isFunctional && (
                  <div className="inline-flex items-center space-x-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                    <span>⚠️ Mode Preview Only (Demo)</span>
                  </div>
                )}
              </div>

              {!conversionTools.find(t => t.id === activeTool)?.isFunctional && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs text-amber-800 leading-relaxed animate-fadeIn">
                  <strong>Notice:</strong> This conversion path is a UI design option. The local image compiler currently defaults standard, RAW, and HEIC files to the developed JPEG compression pipeline.
                </div>
              )}

              <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <Dropzone onFilesAdded={handleFilesAdded} />

                  {files.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 sm:text-sm">
                          <Layers className="h-4 w-4 text-slate-400" />
                          <span>Queue List ({files.length} {files.length === 1 ? 'file' : 'files'})</span>
                        </div>
                        <button
                          onClick={handleClearAll}
                          disabled={isProcessing}
                          className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-rose-600 shadow-sm disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Clear All</span>
                        </button>
                      </div>

                      <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
                        {files.map((item) => (
                          <FileCard
                            key={item.id}
                            item={item}
                            onRemove={handleRemoveFile}
                            onDownload={handleDownloadFile}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <SettingsPanel settings={settings} onChange={setSettings} />

                  {files.length > 0 && (
                    <div className="space-y-4 rounded-3xl border border-slate-100 bg-white/80 p-6 backdrop-blur-md shadow-sm">
                      <h2 className="text-sm font-bold text-slate-800">Conversion Dashboard</h2>
                      {isProcessing && (
                        <div className="space-y-2">
                          <div className="flex justify-between font-mono text-xs">
                            <span className="font-semibold text-brand-violet">Converting Queue...</span>
                            <span className="font-bold text-slate-600">{globalProgress}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-brand-violet transition-all duration-300"
                              style={{ width: `${globalProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 shadow-inner">
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Converted</span>
                          <span className="text-xl font-extrabold text-brand-emerald">{successCount}</span>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 shadow-inner">
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Remaining</span>
                          <span className="text-xl font-extrabold text-slate-700">{pendingCount}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 pt-2">
                        {pendingCount > 0 && (
                          <button
                            onClick={handleStartConversion}
                            disabled={isProcessing}
                            className="flex w-full items-center justify-center space-x-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-violet-500 py-3 text-sm font-bold text-white shadow-lg shadow-brand-violet/20 hover:shadow-brand-violet/30 hover:scale-[1.01] transition-all duration-250 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
                          >
                            <Play className="h-4 w-4 fill-current" />
                            <span>{isProcessing ? 'Processing...' : `Convert ${pendingCount} ${pendingCount === 1 ? 'Image' : 'Images'}`}</span>
                          </button>
                        )}

                        {successCount > 0 && (
                          <button
                            onClick={handleDownloadAll}
                            disabled={isProcessing}
                            className="flex w-full items-center justify-center space-x-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                          >
                            {successCount > 1 ? (
                              <>
                                <FolderArchive className="h-4 w-4" />
                                <span>Download All as ZIP</span>
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4" />
                                <span>Download Converted JPG</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {files.length === 0 && (
              <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 pt-4 md:grid-cols-3 animate-fadeIn">
                <div className="flex flex-col items-center space-y-2 rounded-2xl border border-slate-100 bg-white/70 p-5 text-center shadow-sm backdrop-blur-md hover:shadow-md transition-shadow duration-200">
                  <div className="p-2.5 rounded-xl bg-brand-violet/10 text-brand-violet mb-1 shadow-sm">
                    <FileImage className="h-5 w-5" />
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">RAW Decoding</h2>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Develops supported camera RAW files locally with embedded previews as a compatibility fallback.</p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-2xl border border-slate-100 bg-white/70 p-5 text-center shadow-sm backdrop-blur-md hover:shadow-md transition-shadow duration-200">
                  <div className="p-2.5 rounded-xl bg-brand-emerald/10 text-brand-emerald mb-1 shadow-sm">
                    <Layers className="h-5 w-5" />
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Apple HEIC Support</h2>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Encodes HEIC / HEIF image files from modern iPhones into standard JPEGs locally.</p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-2xl border border-slate-100 bg-white/70 p-5 text-center shadow-sm backdrop-blur-md hover:shadow-md transition-shadow duration-200">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 mb-1 shadow-sm">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">100% Client-Side</h2>
                  <p className="text-[11px] text-slate-500 leading-relaxed">No server uploads. Fast, private, and secure processing for your photos.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="features" className="scroll-mt-20 border-t border-slate-100 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="section-heading">
              <span>Built for a better workflow</span>
              <h2>Everything you need to convert with confidence</h2>
              <p>Powerful image conversion without the usual uploads, accounts, or desktop software.</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ title, description, icon: Icon }) => (
                <article key={title} className="group rounded-3xl border border-slate-100 bg-white/75 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:bg-white hover:shadow-lg hover:shadow-slate-100/50">
                  <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-violet/10 bg-brand-violet/5 text-brand-violet transition-transform duration-300 group-hover:scale-110 shadow-sm">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-slate-800">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="supported-formats" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-100 bg-white/80 px-6 py-12 sm:px-10 shadow-sm backdrop-blur-md">
            <div className="section-heading">
              <span>Broad camera compatibility</span>
              <h2>Supported RAW formats</h2>
              <p>Convert the formats used by popular Canon, Nikon, Sony, Panasonic, Fujifilm, Olympus, Pentax, and Adobe workflows.</p>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-5" aria-label="Supported image formats">
              {formats.map((format) => (
                <li key={format} className="rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-4 text-center font-mono text-sm font-bold tracking-wider text-slate-600 transition-all hover:border-brand-violet/30 hover:bg-white hover:text-brand-violet hover:shadow-md hover:shadow-slate-100/50 cursor-pointer">
                  .{format}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="why-pixavo" className="scroll-mt-20 border-y border-slate-100 bg-slate-50/20 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="section-heading">
              <span>Local by design</span>
              <h2>Why photographers choose Pixavo</h2>
              <p>Your browser is the processing engine, giving you a faster and more private path from RAW to JPG.</p>
            </div>
            <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-slate-100 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4 shadow-sm">
              {benefits.map(({ title, description, icon: Icon }) => (
                <article key={title} className="bg-white p-6 hover:bg-slate-50/50 transition-colors duration-200">
                  <Icon className="mb-5 h-5 w-5 text-brand-emerald" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="section-heading">
              <span>Questions, answered</span>
              <h2>Frequently asked questions</h2>
              <p>The essentials about local processing, supported files, quality, and privacy.</p>
            </div>
            <div className="mt-10">
              <FAQ />
            </div>
          </div>
        </section>

        <section id="blog" className="scroll-mt-20 px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 rounded-[2rem] border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center shadow-sm">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-violet">From the Pixavo blog</span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">Better files, smarter workflows</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Practical guides to RAW formats, JPEG quality, image metadata, and privacy-first creative tools.</p>
            </div>
            <a href="#features" className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 transition-colors hover:text-brand-violet">
              Explore Pixavo <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section id="contact" className="scroll-mt-20 px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-brand-violet/10 bg-brand-violet/5 p-8 text-center sm:p-12 shadow-sm">
            <Mail className="mx-auto h-6 w-6 text-brand-violet" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">Need help with Pixavo?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">Have a format question or feedback about your conversion workflow? We’d love to hear from you.</p>
            <a href="mailto:hello@pixavo.app" className="mt-6 inline-flex items-center rounded-xl bg-slate-900 hover:bg-slate-950 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 shadow-md shadow-slate-900/10 cursor-pointer">
              Contact Pixavo
            </a>
          </div>
        </section>

        <div id="about" className="sr-only">Pixavo is a privacy-first browser image converter.</div>
        <div id="privacy-policy" className="sr-only">Pixavo processes images locally and does not upload image data.</div>
        <div id="terms-of-service" className="sr-only">Use Pixavo responsibly with files you are authorized to process.</div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
