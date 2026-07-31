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
  targetExt?: string;
  onRemove: (id: string) => void;
  onDownload: (item: ImageFile) => void;
}

const formatExposureTime = (exposureTime?: string) => {
  if (!exposureTime) return '';
  if (exposureTime.includes('/')) return `${exposureTime}s`;
  const num = parseFloat(exposureTime);
  if (isNaN(num)) return `${exposureTime}s`;
  if (num >= 1) return `${num}s`;
  return `1/${Math.round(1 / num)}s`;
};

export const FileCard: React.FC<FileCardProps> = ({ item, targetExt = 'jpg', onRemove, onDownload }) => {
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
  const formatLabel = targetExt.toUpperCase();

  return (
    <div className={`w-full bg-white/70 border rounded-3xl transition-all duration-300 backdrop-blur-md overflow-hidden ${
      item.status === 'error'
        ? 'border-rose-200 bg-rose-50/20'
        : item.status === 'success'
          ? 'border-slate-100 hover:border-slate-200 shadow-sm shadow-slate-100/10 bg-white/80'
          : 'border-slate-100 bg-white/70'
    }`}>
      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left section: Image Preview & Name */}
        <div className="flex items-center space-x-4 w-full sm:w-auto min-w-0">
          {/* Thumbnail preview */}
          <div className="relative w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 group shadow-sm">
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
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 cursor-pointer"
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
              <div className="text-slate-400">
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
            <h4 className="text-sm font-bold text-slate-800 truncate" title={item.name}>
              {item.name}
            </h4>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-xs text-slate-500">
              <span>{formatSize(item.originalSize)}</span>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <span className="font-mono uppercase text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">
                {item.originalType.split('/')[1] || item.name.split('.').pop() || 'raw'}
              </span>
              
              {item.status === 'success' && item.width && item.height && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-200" />
                  <span className="font-medium text-slate-600">{item.width} × {item.height}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center section: Progress / Savings / Error */}
        <div className="flex-1 w-full sm:w-auto max-w-md">
          {item.status === 'processing' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-brand-violet font-semibold">Converting...</span>
                <span className="font-bold text-slate-600">{item.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-violet h-full rounded-full transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          )}

          {item.status === 'success' && savingsInfo && (
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-brand-emerald shrink-0" />
              <div className="text-xs">
                <span className="text-slate-700 font-semibold">{formatLabel} size: {formatSize(item.convertedSize)}</span>
                {savingsInfo.isPositive ? (
                  <span className="text-brand-emerald font-bold ml-2">
                    (Saved {savingsInfo.percent}% / {savingsInfo.saved})
                  </span>
                ) : (
                  <span className="text-amber-600 font-bold ml-2">
                    (+{Math.abs(savingsInfo.percent)}% file size)
                  </span>
                )}
              </div>
            </div>
          )}

          {item.status === 'error' && (
            <div className="flex items-start space-x-2 text-rose-600">
              <AlertTriangle className="w-4.5 h-4.5 mt-0.5 shrink-0" />
              <span className="text-xs font-semibold leading-normal">
                {item.errorMsg || 'Failed to convert file.'}
              </span>
            </div>
          )}

          {item.status === 'pending' && (
            <span className="text-xs text-slate-400 font-medium italic">Queued for conversion</span>
          )}
        </div>

        {/* Right section: Action Buttons */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end sm:justify-start">
          {hasMetadata && (
            <button
              onClick={() => setShowMetadata(prev => !prev)}
              className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                showMetadata 
                  ? 'border-brand-violet/30 bg-brand-violet/10 text-brand-violet' 
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 shadow-sm'
              }`}
              title="Camera Metadata Info"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}

          {item.status === 'success' && (
            <button
              onClick={() => onDownload(item)}
              className="p-2 bg-brand-emerald/10 hover:bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/20 rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
              title={`Download Converted ${formatLabel}`}
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onRemove(item.id)}
            disabled={item.status === 'processing'}
            className="p-2 border border-slate-200 hover:border-rose-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Remove from list"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Metadata Panel */}
      {showMetadata && item.metadata && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 animate-fadeIn">
          <div className="flex items-center space-x-1.5 mb-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-brand-violet" />
            <span>EXIF Camera Parameters</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-slate-100 p-3.5 rounded-2xl shadow-sm">
            {item.metadata.model && (
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Camera</span>
                <p className="text-xs text-slate-700 font-semibold truncate" title={`${item.metadata.make || ''} ${item.metadata.model}`}>
                  {item.metadata.model}
                </p>
              </div>
            )}
            
            {item.metadata.lens && (
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Lens</span>
                <p className="text-xs text-slate-700 font-semibold truncate" title={item.metadata.lens}>
                  {item.metadata.lens}
                </p>
              </div>
            )}

            {(item.metadata.exposureTime || item.metadata.fNumber || item.metadata.iso) && (
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Settings</span>
                <p className="text-xs text-slate-700 font-mono font-semibold">
                  {item.metadata.exposureTime && `${formatExposureTime(item.metadata.exposureTime)} `}
                  {item.metadata.fNumber && `f/${item.metadata.fNumber} `}
                  {item.metadata.iso && `ISO ${item.metadata.iso}`}
                </p>
              </div>
            )}

            {item.metadata.dateTime && (
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Captured</span>
                <p className="text-xs text-slate-700 font-semibold">
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
