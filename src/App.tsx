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
  Layers
} from 'lucide-react';

import { Dropzone } from './components/Dropzone';
import { SettingsPanel } from './components/SettingsPanel';
import { FileCard } from './components/FileCard';
import type { ImageFile, ConversionSettings, CameraMetadata } from './types';

const rawDecoder = new LibRaw();

function App() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const filesRef = useRef<ImageFile[]>([]);
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

  // Clean up object URLs on unmount.
  useEffect(() => {
    return () => {
      filesRef.current.forEach(file => {
        if (file.previewUrl && file.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(file.previewUrl);
        }
        if (file.resultUrl) {
          URL.revokeObjectURL(file.resultUrl);
        }
      });
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

    setFiles(prev => [...prev, ...newQueueItems]);
  };

  // Remove individual file from list
  const handleRemoveFile = (id: string) => {
    const target = files.find(f => f.id === id);
    if (target) {
      if (target.previewUrl && target.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      if (target.resultUrl) {
        URL.revokeObjectURL(target.resultUrl);
      }
    }
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // Clear all files
  const handleClearAll = () => {
    files.forEach(file => {
      if (file.previewUrl && file.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(file.previewUrl);
      }
      if (file.resultUrl) {
        URL.revokeObjectURL(file.resultUrl);
      }
    });
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
          throw new Error('Failed to create a canvas for the decoded RAW image.');
        }
        rawContext.putImageData(new ImageData(rgba, decoded.width, decoded.height), 0, 0);
        updateProgress(55);
      } catch (rawError) {
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

      const renderImage = (source: CanvasImageSource, sourceWidth: number, sourceHeight: number) => {
        if (url) URL.revokeObjectURL(url);
        updateProgress(70);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to retrieve canvas context.'));
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
        
        // Render image onto canvas
        ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
        updateProgress(85);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas compression returned empty output.'));
              return;
            }
            updateProgress(100);
            resolve({
              blob,
              width: targetWidth,
              height: targetHeight
            });
          },
          'image/jpeg',
          currentSettings.quality
        );
      };

      img.onload = () => renderImage(img, img.width, img.height);

      img.onerror = () => {
        if (url) URL.revokeObjectURL(url);
        reject(new Error('Failed to load image buffer. The file format may be unsupported or corrupted.'));
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

        const resultUrl = URL.createObjectURL(blob);

        setFiles(prev => prev.map(f => 
          f.id === item.id 
            ? { 
                ...f, 
                status: 'success', 
                progress: 100, 
                convertedSize: blob.size, 
                resultBlob: blob, 
                resultUrl,
                width,
                height
              } 
            : f
        ));
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
    a.click();
    document.body.removeChild(a);
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
      a.href = zipUrl;
      a.download = `converted_images_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(zipUrl);
    } catch (e) {
      console.error('ZIP packaging failed:', e);
      alert('Failed to generate ZIP file.');
    }
  };

  const successCount = files.filter(f => f.status === 'success').length;
  const pendingCount = files.filter(f => f.status === 'pending' || f.status === 'error').length;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col justify-between">
      {/* Main Content Area */}
      <main className="flex-1 w-full space-y-8 pb-10">
        
        {/* Header Section */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2.5 bg-brand-violet/10 border border-brand-violet/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-violet tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Local Browser Image Processing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Raw to JPEG Converter
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400">
            Convert proprietary RAW digital photos, HEIC, PNGs, and WebPs into optimized JPGs. Fully secure, client-side conversion means files never leave your computer.
          </p>
        </header>

        {/* Dynamic Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left / Main Section: Dropzone & File queue list */}
          <div className="lg:col-span-2 space-y-6">
            <Dropzone onFilesAdded={handleFilesAdded} />

            {/* Queue header & actions */}
            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-zinc-900/20 border border-zinc-800/80 px-4 py-3 rounded-xl backdrop-blur-md">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-zinc-300">
                    <Layers className="w-4 h-4 text-zinc-400" />
                    <span>Queue List ({files.length} {files.length === 1 ? 'file' : 'files'})</span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleClearAll}
                      disabled={isProcessing}
                      className="px-3 py-1.5 border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 hover:text-rose-400 text-zinc-400 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  </div>
                </div>

                {/* File list cards */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {files.map(item => (
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

          {/* Right Section: Settings & Summary actions */}
          <div className="space-y-6">
            <SettingsPanel settings={settings} onChange={setSettings} />

            {/* Actions Dashboard */}
            {files.length > 0 && (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
                <h3 className="text-sm font-semibold text-zinc-300">Conversion Dashboard</h3>

                {/* Progress bar */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-brand-violet font-semibold">Converting Queue...</span>
                      <span>{globalProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-brand-violet h-full rounded-full transition-all duration-300"
                        style={{ width: `${globalProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Queue status metrics */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-zinc-950/40 border border-zinc-850 p-3 rounded-xl">
                    <span className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Converted</span>
                    <span className="text-xl font-bold text-brand-emerald">{successCount}</span>
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-850 p-3 rounded-xl">
                    <span className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Remaining</span>
                    <span className="text-xl font-bold text-zinc-300">{pendingCount}</span>
                  </div>
                </div>

                {/* Primary operations */}
                <div className="flex flex-col gap-3 pt-2">
                  {pendingCount > 0 && (
                    <button
                      onClick={handleStartConversion}
                      disabled={isProcessing}
                      className="w-full py-3 bg-brand-violet hover:bg-brand-violet/90 text-white rounded-xl font-semibold text-sm flex items-center justify-center space-x-2.5 shadow-md shadow-brand-violet/25 hover:shadow-brand-violet/30 hover:scale-[1.01] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{isProcessing ? 'Processing...' : `Convert ${pendingCount} ${pendingCount === 1 ? 'Image' : 'Images'}`}</span>
                    </button>
                  )}

                  {successCount > 0 && (
                    <button
                      onClick={handleDownloadAll}
                      disabled={isProcessing}
                      className="w-full py-3 bg-zinc-150 bg-zinc-200 text-zinc-900 rounded-xl font-bold text-sm flex items-center justify-center space-x-2.5 transition-all duration-200 hover:scale-[1.01]"
                    >
                      {successCount > 1 ? (
                        <>
                          <FolderArchive className="w-4 h-4" />
                          <span>Download All as ZIP</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
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

        {/* Explanatory Info Section if no files uploaded */}
        {files.length === 0 && (
          <section className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-zinc-900/20 border border-zinc-850 rounded-xl p-4 flex flex-col items-center text-center space-y-2">
              <FileImage className="w-6 h-6 text-brand-violet" />
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">RAW Decoding</h4>
              <p className="text-xxs text-zinc-400">
                Develops supported camera RAW files locally with LibRaw, with embedded previews as a compatibility fallback.
              </p>
            </div>
            <div className="bg-zinc-900/20 border border-zinc-850 rounded-xl p-4 flex flex-col items-center text-center space-y-2">
              <Layers className="w-6 h-6 text-brand-emerald" />
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Apple HEIC Support</h4>
              <p className="text-xxs text-zinc-400">
                Encodes HEIC / HEIF high-efficiency image container files from modern iPhones into standard Web JPEGs locally.
              </p>
            </div>
            <div className="bg-zinc-900/20 border border-zinc-850 rounded-xl p-4 flex flex-col items-center text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-zinc-400" />
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">100% Client-Side</h4>
              <p className="text-xxs text-zinc-400">
                Processed fully in your web browser. No server uploads. Unmatched speed, privacy, and security for your photos.
              </p>
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-zinc-900 text-xxs text-zinc-500 font-mono tracking-wide">
        &copy; {new Date().getFullYear()} RAW TO JPEG CONVERTER. POWERED BY REACT & TAILWIND CSS.
      </footer>
    </div>
  );
}

export default App;
