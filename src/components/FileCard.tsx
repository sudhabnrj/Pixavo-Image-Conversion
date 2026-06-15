import React, { useState } from 'react';
import { 
  Trash2, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Info, 
  Eye 
} from 'lucide-react';
import type { ImageFile } from '../types';

interface FileCardProps {
  item: ImageFile;
  onRemove: (id: string) => void;
  onDownload: (item: ImageFile) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ item, onRemove, onDownload }) => {
  const [showMetadata, setShowMetadata] = useState(false);
  const [previewMode, setPreviewMode] = useState<'original' | 'converted'>('converted');

  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return '';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSavings = () => {
    if (item.convertedSize && item.originalSize) {
      const savings = ((item.originalSize - item.convertedSize) / item.originalSize) * 100;
      const savedBytes = item.originalSize - item.convertedSize;
      return {
        percent: Math.round(savings),
        saved: formatSize(savedBytes),
        isPositive: savings > 0
      };
    }
    return null;
  };

  const hasMetadata = item.metadata && Object.values(item.metadata).some(val => val !== undefined);
  const savingsInfo = getSavings();

  return (
    <div className={`w-full bg-zinc-900/40 border rounded-2xl transition-all duration-300 backdrop-blur-md overflow-hidden ${
      item.status === 'error'
        ? 'border-rose-950 bg-rose-950/5'
        : item.status === 'success'
          ? 'border-zinc-800 hover:border-zinc-700'
          : 'border-zinc-800'
    }`}>
      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left section: Image Preview & Name */}
        <div className="flex items-center space-x-4 w-full sm:w-auto min-w-0">
          {/* Thumbnail preview */}
          <div className="relative w-16 h-16 rounded-xl bg-zinc-850 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0 group">
            {item.status === 'success' && item.resultUrl && item.previewUrl ? (
              <>
                <img
                  src={previewMode === 'converted' ? item.resultUrl : item.previewUrl}
                  alt={item.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                {/* Preview type label */}
                <span className="absolute bottom-0 inset-x-0 text-[8px] font-bold text-center py-0.5 bg-black/60 text-zinc-300 tracking-wider uppercase">
                  {previewMode}
                </span>
                {/* Swap preview mode overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewMode(prev => prev === 'converted' ? 'original' : 'converted');
                  }}
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200"
                  title="Toggle Original/Converted preview"
                >
                  <Eye className="w-4 h-4 text-white" />
                </button>
              </>
            ) : item.previewUrl ? (
              <img
                src={item.previewUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-zinc-500">
                {item.status === 'processing' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-brand-violet" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-zinc-200 truncate" title={item.name}>
              {item.name}
            </h4>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-xs text-zinc-400">
              <span>{formatSize(item.originalSize)}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className="font-mono uppercase text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                {item.originalType.split('/')[1] || item.name.split('.').pop() || 'raw'}
              </span>
              
              {item.status === 'success' && item.width && item.height && (
                <>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span>{item.width} × {item.height}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center section: Progress / Savings / Error */}
        <div className="flex-1 w-full sm:w-auto max-w-md">
          {item.status === 'processing' && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-brand-violet">Converting...</span>
                <span>{item.progress}%</span>
              </div>
              <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-violet h-full rounded-full transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          )}

          {item.status === 'success' && savingsInfo && (
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
              <div className="text-xs">
                <span className="text-zinc-300 font-medium">JPEG size: {formatSize(item.convertedSize)}</span>
                {savingsInfo.isPositive ? (
                  <span className="text-brand-emerald font-semibold ml-2">
                    (Saved {savingsInfo.percent}% / {savingsInfo.saved})
                  </span>
                ) : (
                  <span className="text-amber-500 font-semibold ml-2">
                    (+{Math.abs(savingsInfo.percent)}% file size)
                  </span>
                )}
              </div>
            </div>
          )}

          {item.status === 'error' && (
            <div className="flex items-start space-x-2 text-rose-400">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="text-xs font-medium leading-normal">
                {item.errorMsg || 'Failed to convert file.'}
              </span>
            </div>
          )}

          {item.status === 'pending' && (
            <span className="text-xs text-zinc-500 italic">Queued for conversion</span>
          )}
        </div>

        {/* Right section: Action Buttons */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end sm:justify-start">
          {hasMetadata && (
            <button
              onClick={() => setShowMetadata(prev => !prev)}
              className={`p-2 rounded-xl border transition-all duration-200 ${
                showMetadata 
                  ? 'border-brand-violet/30 bg-brand-violet/10 text-brand-violet' 
                  : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Camera Metadata Info"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}

          {item.status === 'success' && (
            <button
              onClick={() => onDownload(item)}
              className="p-2 bg-brand-emerald/10 hover:bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30 rounded-xl transition-all duration-200"
              title="Download JPEG"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onRemove(item.id)}
            disabled={item.status === 'processing'}
            className="p-2 border border-zinc-850 hover:border-zinc-800 hover:bg-rose-950/20 text-zinc-500 hover:text-rose-400 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Remove from list"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Metadata Panel */}
      {showMetadata && item.metadata && (
        <div className="px-4 pb-4 pt-1 border-t border-zinc-850/80 bg-zinc-900/20 animate-fadeIn">
          <div className="flex items-center space-x-1.5 mb-3 text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-brand-violet" />
            <span>EXIF Camera Parameters</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-950/30 border border-zinc-850 p-3 rounded-xl">
            {item.metadata.model && (
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Camera</span>
                <p className="text-xs text-zinc-300 font-medium truncate" title={`${item.metadata.make || ''} ${item.metadata.model}`}>
                  {item.metadata.model}
                </p>
              </div>
            )}
            
            {item.metadata.lens && (
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Lens</span>
                <p className="text-xs text-zinc-300 font-medium truncate" title={item.metadata.lens}>
                  {item.metadata.lens}
                </p>
              </div>
            )}

            {(item.metadata.exposureTime || item.metadata.fNumber || item.metadata.iso) && (
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Settings</span>
                <p className="text-xs text-zinc-300 font-mono font-medium">
                  {item.metadata.exposureTime && `1/${Math.round(1 / parseFloat(item.metadata.exposureTime)) || item.metadata.exposureTime}s `}
                  {item.metadata.fNumber && `f/${item.metadata.fNumber} `}
                  {item.metadata.iso && `ISO ${item.metadata.iso}`}
                </p>
              </div>
            )}

            {item.metadata.dateTime && (
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Captured</span>
                <p className="text-xs text-zinc-300 font-medium">
                  {new Date(item.metadata.dateTime).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
