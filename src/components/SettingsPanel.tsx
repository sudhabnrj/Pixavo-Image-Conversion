import React from 'react';
import { Sliders, Maximize2, FileText } from 'lucide-react';
import type { ConversionSettings, ResizeOption } from '../types';

interface SettingsPanelProps {
  settings: ConversionSettings;
  onChange: (settings: ConversionSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange }) => {
  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quality = parseFloat(e.target.value);
    onChange({ ...settings, quality });
  };

  const handleResizeModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const resizeMode = e.target.value as ResizeOption;
    onChange({ ...settings, resizeMode });
  };

  const handleCustomWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const customWidth = e.target.value ? parseInt(e.target.value, 10) : undefined;
    onChange({ ...settings, customWidth });
  };

  const handleCustomHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const customHeight = e.target.value ? parseInt(e.target.value, 10) : undefined;
    onChange({ ...settings, customHeight });
  };

  const handleKeepMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keepMetadata = e.target.checked;
    onChange({ ...settings, keepMetadata });
  };

  return (
    <div className="w-full bg-white/90 border border-slate-100/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden shadow-sm shadow-slate-100/50">
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-violet/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
        <Sliders className="w-5 h-5 text-brand-violet" />
        <h2 className="text-sm font-bold text-slate-800">Conversion Settings</h2>
      </div>

      <div className="space-y-6">
        {/* Quality Slider */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-700 flex items-center space-x-1.5">
              <span>Output JPEG Quality</span>
            </label>
            <span className="text-xs font-mono font-bold bg-brand-violet/10 border border-brand-violet/20 text-brand-violet px-2.5 py-0.5 rounded-md">
              {Math.round(settings.quality * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={settings.quality}
            onChange={handleQualityChange}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-violet focus:outline-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Smaller File (10%)</span>
            <span>Balanced (90%)</span>
            <span>Maximum (100%)</span>
          </div>
        </div>

        {/* Resizing Options */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 flex items-center space-x-1.5">
            <Maximize2 className="w-4 h-4 text-slate-400" />
            <span>Resize Dimension Limit</span>
          </label>
          <div className="relative">
            <select
              value={settings.resizeMode}
              onChange={handleResizeModeChange}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/10 focus:border-brand-violet cursor-pointer appearance-none transition-all duration-200"
            >
              <option value="original">Keep Original Dimensions</option>
              <option value="4k">Limit to 4K (3840px max side)</option>
              <option value="1080p">Limit to Full HD (1920px max side)</option>
              <option value="720p">Limit to HD (1280px max side)</option>
              <option value="custom">Custom Width / Height</option>
            </select>
            {/* Custom dropdown arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>

          {/* Custom Size Fields */}
          {settings.resizeMode === 'custom' && (
            <div className="grid grid-cols-2 gap-4 pt-1 animate-fadeIn">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500">Max Width (px)</span>
                <input
                  type="number"
                  placeholder="e.g. 1920"
                  value={settings.customWidth || ''}
                  onChange={handleCustomWidthChange}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 text-slate-700 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/10 focus:border-brand-violet font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500">Max Height (px)</span>
                <input
                  type="number"
                  placeholder="e.g. 1080"
                  value={settings.customHeight || ''}
                  onChange={handleCustomHeightChange}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 text-slate-700 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/10 focus:border-brand-violet font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Metadata retention */}
        <div className="pt-2">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.keepMetadata}
                onChange={handleKeepMetadataChange}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-emerald peer-checked:after:bg-white shadow-sm" />
            </div>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-800 transition-colors flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-slate-400 group-hover:text-brand-emerald transition-colors" />
              <span>Preserve EXIF camera metadata</span>
            </span>
          </label>
          <p className="text-[10px] text-slate-400 mt-2.5 ml-12 leading-relaxed">
            Keep camera details (shutter speed, ISO, aperture, etc.) embedded in the final JPEG image. Note that standard canvas conversions strip metadata by default; we will re-insert EXIF blocks for supported standard files.
          </p>
        </div>
      </div>
    </div>
  );
};
