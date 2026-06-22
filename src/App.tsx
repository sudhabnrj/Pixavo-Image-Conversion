import { useState, useEffect, useRef } from 'react';
import exifr from 'exifr';
import heic2any from 'heic2any';
import JSZip from 'jszip';
import LibRaw from 'libraw-wasm';
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

const rawDecoder = new LibRaw();

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
          // Render image onto canvas
          ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
          updateProgress(85);

          canvas.toBlob(
            (blob) => {
              releaseCanvas(canvas);
              if (!blob) {
                rejectOnce(new Error('Canvas compression returned empty output.'));
                return;
              }
              if (isSettled) return;
              isSettled = true;
              updateProgress(100);
              releaseTemporaryResources();
              resolve({
                blob,
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
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center space-x-2.5 rounded-full border border-brand-violet/20 bg-brand-violet/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-brand-violet">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Local Browser Image Processing</span>
              </div>
              <h1 id="converter-title" className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
                Raw to JPEG Converter
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-zinc-400 sm:text-base">
                Convert proprietary RAW digital photos, HEIC, PNGs, and WebPs into optimized JPGs. Fully secure, client-side conversion means files never leave your computer.
              </p>
            </div>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <Dropzone onFilesAdded={handleFilesAdded} />

                {files.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/20 px-4 py-3 backdrop-blur-md">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-300 sm:text-sm">
                        <Layers className="h-4 w-4 text-zinc-400" />
                        <span>Queue List ({files.length} {files.length === 1 ? 'file' : 'files'})</span>
                      </div>
                      <button
                        onClick={handleClearAll}
                        disabled={isProcessing}
                        className="flex items-center space-x-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-400 transition-all duration-200 hover:bg-zinc-800 hover:text-rose-400 disabled:pointer-events-none disabled:opacity-30"
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
                  <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md">
                    <h2 className="text-sm font-semibold text-zinc-300">Conversion Dashboard</h2>
                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between font-mono text-xs">
                          <span className="font-semibold text-brand-violet">Converting Queue...</span>
                          <span>{globalProgress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-brand-violet transition-all duration-300"
                            style={{ width: `${globalProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Converted</span>
                        <span className="text-xl font-bold text-brand-emerald">{successCount}</span>
                      </div>
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Remaining</span>
                        <span className="text-xl font-bold text-zinc-300">{pendingCount}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                      {pendingCount > 0 && (
                        <button
                          onClick={handleStartConversion}
                          disabled={isProcessing}
                          className="flex w-full items-center justify-center space-x-2.5 rounded-xl bg-brand-violet py-3 text-sm font-semibold text-white shadow-md shadow-brand-violet/25 transition-all duration-200 hover:scale-[1.01] hover:bg-brand-violet/90 hover:shadow-brand-violet/30 disabled:pointer-events-none disabled:opacity-40"
                        >
                          <Play className="h-4 w-4 fill-current" />
                          <span>{isProcessing ? 'Processing...' : `Convert ${pendingCount} ${pendingCount === 1 ? 'Image' : 'Images'}`}</span>
                        </button>
                      )}

                      {successCount > 0 && (
                        <button
                          onClick={handleDownloadAll}
                          disabled={isProcessing}
                          className="flex w-full items-center justify-center space-x-2.5 rounded-xl bg-zinc-200 py-3 text-sm font-bold text-zinc-900 transition-all duration-200 hover:scale-[1.01]"
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

            {files.length === 0 && (
              <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 pt-4 md:grid-cols-3">
                <div className="flex flex-col items-center space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 text-center">
                  <FileImage className="h-6 w-6 text-brand-violet" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">RAW Decoding</h2>
                  <p className="text-[11px] text-zinc-400">Develops supported camera RAW files locally with embedded previews as a compatibility fallback.</p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 text-center">
                  <Layers className="h-6 w-6 text-brand-emerald" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Apple HEIC Support</h2>
                  <p className="text-[11px] text-zinc-400">Encodes HEIC / HEIF image files from modern iPhones into standard JPEGs locally.</p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 text-center">
                  <AlertCircle className="h-6 w-6 text-zinc-400" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">100% Client-Side</h2>
                  <p className="text-[11px] text-zinc-400">No server uploads. Fast, private, and secure processing for your photos.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="features" className="scroll-mt-20 border-t border-zinc-900 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="section-heading">
              <span>Built for a better workflow</span>
              <h2>Everything you need to convert with confidence</h2>
              <p>Powerful image conversion without the usual uploads, accounts, or desktop software.</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ title, description, icon: Icon }) => (
                <article key={title} className="group rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/55">
                  <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-violet/20 bg-brand-violet/10 text-brand-violet transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-zinc-100">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="supported-formats" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-3xl border border-zinc-800 bg-zinc-900/30 px-6 py-12 sm:px-10">
            <div className="section-heading">
              <span>Broad camera compatibility</span>
              <h2>Supported RAW formats</h2>
              <p>Convert the formats used by popular Canon, Nikon, Sony, Panasonic, Fujifilm, Olympus, Pentax, and Adobe workflows.</p>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-5" aria-label="Supported image formats">
              {formats.map((format) => (
                <li key={format} className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-4 text-center font-mono text-sm font-bold tracking-wider text-zinc-300 transition-colors hover:border-brand-violet/40 hover:text-brand-violet">
                  .{format}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="why-pixavo" className="scroll-mt-20 border-y border-zinc-900 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="section-heading">
              <span>Local by design</span>
              <h2>Why photographers choose Pixavo</h2>
              <p>Your browser is the processing engine, giving you a faster and more private path from RAW to JPG.</p>
            </div>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map(({ title, description, icon: Icon }) => (
                <article key={title} className="bg-zinc-950 p-6">
                  <Icon className="mb-5 h-5 w-5 text-brand-emerald" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
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
          <div className="mx-auto grid max-w-6xl gap-8 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-violet">From the Pixavo blog</span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">Better files, smarter workflows</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Practical guides to RAW formats, JPEG quality, image metadata, and privacy-first creative tools.</p>
            </div>
            <a href="#features" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-200 transition-colors hover:text-brand-violet">
              Explore Pixavo <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section id="contact" className="scroll-mt-20 px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-brand-violet/20 bg-brand-violet/10 p-8 text-center sm:p-12">
            <Mail className="mx-auto h-6 w-6 text-brand-violet" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Need help with Pixavo?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">Have a format question or feedback about your conversion workflow? We’d love to hear from you.</p>
            <a href="mailto:hello@pixavo.app" className="mt-6 inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition-transform hover:-translate-y-0.5">
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
