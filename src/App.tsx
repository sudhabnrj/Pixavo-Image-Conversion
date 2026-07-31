import { useState, useEffect, useRef } from 'react';
import exifr from 'exifr';
import {
  Layers,
  Gauge,
  WifiOff,
  MonitorCheck,
  Images,
  ShieldCheck,
  Gem,
  DownloadCloud,
  Files,
  ArrowRight,
  Mail,
  LockKeyhole
} from 'lucide-react';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FAQ } from './components/FAQ';
import { ConverterWorkspace } from './components/ConverterWorkspace';
import { Hero3DGallery } from './components/Hero3DGallery';

import {
  disposeImageCollection,
  disposeImageResources,
  revokeObjectUrl,
} from './utils/memory';
import type { ImageFile, ConversionSettings, CameraMetadata } from './types';
import { conversionTools, getToolById } from './utils/conversionTools';
import { convertSingleImage } from './utils/converter';

const features = [
  { title: '100% Browser Based', description: 'Everything runs directly in your browser—no remote processing.', icon: MonitorCheck },
  { title: 'Batch Conversion', description: 'Queue and convert multiple images in one streamlined workflow.', icon: Images },
  { title: 'Privacy First', description: 'Your private photos stay on your device from start to finish.', icon: ShieldCheck },
  { title: 'High Quality Output', description: 'Fine-tune quality, dimensions, and metadata for polished results.', icon: Gem },
  { title: 'No Installation', description: 'Open Pixavo and start converting without downloading software.', icon: DownloadCloud },
  { title: 'Multiple RAW & Web Formats', description: 'Work with popular RAW files, Apple HEIC, PNG, JPG, and WebP.', icon: Files },
];

const formats = ['CR2', 'CR3', 'NEF', 'ARW', 'RW2', 'RAF', 'ORF', 'PEF', 'DNG', 'RAW'];

const benefits = [
  { title: 'No Upload Required', description: 'Skip slow transfers and keep every original file on your device.', icon: LockKeyhole },
  { title: 'Faster Than Cloud Converters', description: 'Start processing immediately without waiting for uploads or downloads.', icon: Gauge },
  { title: 'Works Offline', description: 'Once loaded, core conversion happens locally without a server round trip.', icon: WifiOff },
  { title: 'Secure Local Processing', description: 'Browser-native processing keeps sensitive photography under your control.', icon: ShieldCheck },
];

function App() {
  const [page, setPage] = useState<'home' | 'converter'>('home');
  const [activeToolId, setActiveToolId] = useState<string>('raw-jpg');
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

  // Sync hash routing
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#convert/')) {
        const toolId = hash.replace('#convert/', '');
        if (conversionTools.some(t => t.id === toolId)) {
          setActiveToolId(toolId);
          setPage('converter');
          return;
        }
      }
      setPage('home');
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      disposeImageCollection(filesRef.current);
    };
  }, []);

  const handleSelectTool = (toolId: string) => {
    setActiveToolId(toolId);
    setPage('converter');
    window.location.hash = `convert/${toolId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setPage('home');
    window.location.hash = 'home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // Generate preview URL
  const getPreviewUrl = async (file: File, ext: string): Promise<string> => {
    const isRaw = ['cr2', 'nef', 'arw', 'dng', 'pef', 'orf', 'rw2', 'raw'].includes(ext);
    const isHeic = ['heic', 'heif'].includes(ext);

    if (isRaw) {
      try {
        const url = await exifr.thumbnailUrl(file);
        return url || '';
      } catch (e) {
        console.warn('Failed to extract RAW thumbnail preview:', e);
        return '';
      }
    } else if (isHeic) {
      try {
        const heic2any = (await import('heic2any')).default;
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
      return URL.createObjectURL(file);
    }
  };

  const handleFilesAdded = async (newFiles: File[]) => {
    const newQueueItems: ImageFile[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const id = `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`;
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (files.some(f => f.name === file.name)) {
        continue;
      }

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

  const handleRemoveFile = (id: string) => {
    const target = files.find(f => f.id === id);
    if (target) disposeImageResources(target);
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleClearAll = () => {
    disposeImageCollection(files);
    setFiles([]);
  };

  const handleStartConversion = async () => {
    const pendingItems = files.filter(f => f.status === 'pending' || f.status === 'error');
    if (pendingItems.length === 0) return;

    const currentTool = getToolById(activeToolId);
    setIsProcessing(true);
    setGlobalProgress(0);

    let completedCount = 0;
    const totalCount = pendingItems.length;

    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];

      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processing', progress: 5 } : f));

      try {
        const { blob, width, height } = await convertSingleImage(
          item,
          settings,
          currentTool,
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

  const handleDownloadFile = (item: ImageFile) => {
    if (!item.resultUrl || !item.resultBlob) return;
    const currentTool = getToolById(activeToolId);
    const originalName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    const downloadName = `${originalName}.${currentTool.targetExt}`;

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

  const handleDownloadAll = async () => {
    const successFiles = files.filter(f => f.status === 'success' && f.resultBlob && f.resultUrl);
    if (successFiles.length === 0) return;

    const currentTool = getToolById(activeToolId);

    if (successFiles.length === 1) {
      handleDownloadFile(successFiles[0]);
      return;
    }

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    successFiles.forEach((file) => {
      if (file.resultBlob) {
        const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        zip.file(`${originalName}.${currentTool.targetExt}`, file.resultBlob);
      }
    });

    try {
      const zipContent = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipContent);
      const a = document.createElement('a');
      try {
        a.href = zipUrl;
        a.download = `${currentTool.id}_converted_images_${Date.now()}.zip`;
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

  const activeTool = getToolById(activeToolId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 text-slate-800">
      <Header
        currentPage={page}
        activeToolId={activeToolId}
        onNavigateHome={handleNavigateHome}
        onNavigateTool={handleSelectTool}
      />

      <main>
        {page === 'converter' ? (
          <ConverterWorkspace
            tool={activeTool}
            onSelectTool={handleSelectTool}
            onNavigateHome={handleNavigateHome}
            files={files}
            settings={settings}
            onSettingsChange={setSettings}
            onFilesAdded={handleFilesAdded}
            onRemoveFile={handleRemoveFile}
            onClearAll={handleClearAll}
            onStartConversion={handleStartConversion}
            onDownloadFile={handleDownloadFile}
            onDownloadAll={handleDownloadAll}
            isProcessing={isProcessing}
            globalProgress={globalProgress}
          />
        ) : (
          /* Landing / Home Page */
          <>
            {/* Full screen 3D Perspective Rotating Gallery Hero */}
            <div id="home">
              <Hero3DGallery onSelectTool={handleSelectTool} />
            </div>

            {/* Select Image Tool Section */}
            <section id="select-tools" className="scroll-mt-24 space-y-6 pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn">
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Conversion Tools Collection</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Select Image Tool
                </h2>
                <p className="text-sm text-slate-500">
                  Click any tool to enter its dedicated conversion workspace.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {conversionTools.map((tool) => {
                  const Icon = tool.icon;

                  const colorMap = {
                    violet: { bgClass: 'bg-brand-violet text-white', iconBg: 'bg-white/15 text-white', text: 'text-white', desc: 'text-white/85', shadow: 'hover:shadow-brand-violet/25 hover:shadow-xl' },
                    emerald: { bgClass: 'bg-brand-emerald text-white', iconBg: 'bg-white/15 text-white', text: 'text-white', desc: 'text-white/85', shadow: 'hover:shadow-brand-emerald/25 hover:shadow-xl' },
                    rose: { bgClass: 'bg-rose-600 text-white', iconBg: 'bg-white/15 text-white', text: 'text-white', desc: 'text-white/85', shadow: 'hover:shadow-rose-600/25 hover:shadow-xl' },
                    blue: { bgClass: 'bg-blue-600 text-white', iconBg: 'bg-white/15 text-white', text: 'text-white', desc: 'text-white/85', shadow: 'hover:shadow-blue-600/25 hover:shadow-xl' },
                    amber: { bgClass: 'bg-amber-600 text-white', iconBg: 'bg-white/15 text-white', text: 'text-white', desc: 'text-white/85', shadow: 'hover:shadow-amber-600/25 hover:shadow-xl' },
                    indigo: { bgClass: 'bg-indigo-600 text-white', iconBg: 'bg-white/15 text-white', text: 'text-white', desc: 'text-white/85', shadow: 'hover:shadow-indigo-600/25 hover:shadow-xl' },
                    teal: { bgClass: 'bg-teal-600 text-white', iconBg: 'bg-white/15 text-white', text: 'text-white', desc: 'text-white/85', shadow: 'hover:shadow-teal-600/25 hover:shadow-xl' },
                    orange: { bgClass: 'bg-orange-600 text-white', iconBg: 'bg-white/15 text-white', text: 'text-white', desc: 'text-white/85', shadow: 'hover:shadow-orange-600/25 hover:shadow-xl' },
                    cyan: { bgClass: 'bg-cyan-600 text-white', iconBg: 'bg-white/15 text-white', text: 'text-white', desc: 'text-white/85', shadow: 'hover:shadow-cyan-600/25 hover:shadow-xl' },
                    purple: { bgClass: 'bg-purple-600 text-white', iconBg: 'bg-white/15 text-white', text: 'text-white', desc: 'text-white/85', shadow: 'hover:shadow-purple-600/25 hover:shadow-xl' }
                  };

                  const colors = colorMap[tool.color];

                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleSelectTool(tool.id)}
                      className={`group flex flex-col justify-between p-6 text-left rounded-3xl border border-transparent transition-all duration-300 cursor-pointer min-h-[220px] ${colors.bgClass} ${colors.shadow} hover:-translate-y-1`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-xl ${colors.iconBg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white tracking-wider">
                            {tool.from} &rarr; {tool.to}
                          </span>
                        </div>
                        <h3 className={`text-lg font-extrabold ${colors.text} mb-2`}>
                          {tool.title}
                        </h3>
                        <p className={`text-xs ${colors.desc} leading-relaxed`}>
                          {tool.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold text-white">
                        <span>Convert Now</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Features Section */}
            <section id="features" className="scroll-mt-20 border-t border-slate-100 px-4 py-20 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="mx-auto max-w-6xl">
                <div className="section-heading text-center space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-violet">Built for a better workflow</span>
                  <h2 className="text-3xl font-extrabold text-slate-900">Everything you need to convert with confidence</h2>
                  <p className="text-sm text-slate-500">Powerful image conversion without uploads, accounts, or software installs.</p>
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

            {/* Supported RAW Formats Section */}
            <section id="supported-formats" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-100 bg-white/80 px-6 py-12 sm:px-10 shadow-sm backdrop-blur-md">
                <div className="section-heading text-center space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-violet">Broad camera compatibility</span>
                  <h2 className="text-3xl font-extrabold text-slate-900">Supported RAW & Web formats</h2>
                  <p className="text-sm text-slate-500">Convert files from Canon, Nikon, Sony, Panasonic, Fujifilm, Apple, and web formats.</p>
                </div>
                <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-5" aria-label="Supported image formats">
                  {formats.map((format) => (
                    <li
                      key={format}
                      onClick={() => handleSelectTool('raw-jpg')}
                      className="rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-4 text-center font-mono text-sm font-bold tracking-wider text-slate-600 transition-all hover:border-brand-violet/30 hover:bg-white hover:text-brand-violet hover:shadow-md hover:shadow-slate-100/50 cursor-pointer"
                    >
                      .{format}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Why Pixavo Section */}
            <section id="why-pixavo" className="scroll-mt-20 border-y border-slate-100 bg-slate-50/20 px-4 py-20 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-6xl">
                <div className="section-heading text-center space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-violet">Local by design</span>
                  <h2 className="text-3xl font-extrabold text-slate-900">Why photographers choose Pixavo</h2>
                  <p className="text-sm text-slate-500">Your browser is the processing engine, giving you a faster and more private image converter.</p>
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

            {/* FAQ Section */}
            <section id="faq" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="mx-auto max-w-6xl">
                <div className="section-heading text-center space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-violet">Questions, answered</span>
                  <h2 className="text-3xl font-extrabold text-slate-900">Frequently asked questions</h2>
                  <p className="text-sm text-slate-500">The essentials about local processing, supported files, quality, and privacy.</p>
                </div>
                <div className="mt-10">
                  <FAQ />
                </div>
              </div>
            </section>

            {/* Blog Section */}
            <section id="blog" className="scroll-mt-20 px-4 pb-20 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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

            {/* Contact Section */}
            <section id="contact" className="scroll-mt-20 px-4 pb-24 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-brand-violet/10 bg-brand-violet/5 p-8 text-center sm:p-12 shadow-sm">
                <Mail className="mx-auto h-6 w-6 text-brand-violet" aria-hidden="true" />
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">Need help with Pixavo?</h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">Have a format question or feedback about your conversion workflow? We’d love to hear from you.</p>
                <a href="mailto:hello@pixavo.app" className="mt-6 inline-flex items-center rounded-xl bg-slate-900 hover:bg-slate-950 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 shadow-md shadow-slate-900/10 cursor-pointer">
                  Contact Pixavo
                </a>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
