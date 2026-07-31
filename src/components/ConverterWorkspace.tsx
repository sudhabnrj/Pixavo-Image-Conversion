import React from 'react';
import {
  Sparkles,
  Layers,
  Trash2,
  Play,
  FolderArchive,
  Download,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight
} from 'lucide-react';
import { Dropzone } from './Dropzone';
import { FileCard } from './FileCard';
import { SettingsPanel } from './SettingsPanel';
import type { ImageFile, ConversionSettings } from '../types';
import { conversionTools, type ConversionTool } from '../utils/conversionTools';

interface ConverterWorkspaceProps {
  tool: ConversionTool;
  onSelectTool: (toolId: string) => void;
  onNavigateHome: () => void;
  files: ImageFile[];
  settings: ConversionSettings;
  onSettingsChange: (settings: ConversionSettings) => void;
  onFilesAdded: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onClearAll: () => void;
  onStartConversion: () => void;
  onDownloadFile: (item: ImageFile) => void;
  onDownloadAll: () => void;
  isProcessing: boolean;
  globalProgress: number;
}

export const ConverterWorkspace: React.FC<ConverterWorkspaceProps> = ({
  tool,
  onSelectTool,
  onNavigateHome,
  files,
  settings,
  onSettingsChange,
  onFilesAdded,
  onRemoveFile,
  onClearAll,
  onStartConversion,
  onDownloadFile,
  onDownloadAll,
  isProcessing,
  globalProgress
}) => {
  const Icon = tool.icon;
  const successCount = files.filter(f => f.status === 'success').length;
  const pendingCount = files.filter(f => f.status === 'pending' || f.status === 'error').length;

  return (
    <div className="min-h-screen px-4 pb-20 pt-24 sm:px-6 sm:pt-28 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <button
            onClick={onNavigateHome}
            className="hover:text-brand-violet transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Home</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span>Tools</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-800 font-bold">{tool.title}</span>
        </div>

        <button
          onClick={onNavigateHome}
          className="inline-flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Image Tools</span>
        </button>
      </div>

      {/* Tool Header Section */}
      <div className="rounded-[2.5rem] border border-slate-100 bg-gradient-to-br from-white via-slate-50/50 to-white p-6 sm:p-10 shadow-sm backdrop-blur-md space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-4 rounded-2xl bg-brand-violet/10 text-brand-violet shadow-sm shrink-0">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-violet/20 bg-brand-violet/10 px-3 py-1 text-[11px] font-bold text-brand-violet">
                  <Sparkles className="w-3 h-3" />
                  <span>100% Client-Side Engine</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-mono font-bold text-slate-600">
                  {tool.from} &rarr; {tool.to}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {tool.title} Converter
              </h1>
              <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed">
                {tool.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Switcher Tool Bar */}
        <div className="pt-2 border-t border-slate-100">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
            Quick Switch Tool:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {conversionTools.map((t) => {
              const isActive = t.id === tool.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTool(t.id)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-violet/40 hover:text-brand-violet'
                  }`}
                >
                  {t.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div
        id="converter-workspace"
        className="rounded-[2.5rem] border border-slate-100/80 bg-white/70 p-6 md:p-8 shadow-sm backdrop-blur-md space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-brand-violet/10 text-brand-violet">
                <Sparkles className="h-4 w-4" />
              </span>
              <span>Conversion Workspace: {tool.title}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select or drop your {tool.from} files below to start local conversion.
            </p>
          </div>
          <div className="inline-flex items-center space-x-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ready for Local Conversion</span>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Dropzone onFilesAdded={onFilesAdded} />

            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 sm:text-sm">
                    <Layers className="h-4 w-4 text-slate-400" />
                    <span>Queue List ({files.length} {files.length === 1 ? 'file' : 'files'})</span>
                  </div>
                  <button
                    onClick={onClearAll}
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
                      targetExt={tool.targetExt}
                      onRemove={onRemoveFile}
                      onDownload={onDownloadFile}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <SettingsPanel settings={settings} onChange={onSettingsChange} />

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
                      onClick={onStartConversion}
                      disabled={isProcessing}
                      className="flex w-full items-center justify-center space-x-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-violet-500 py-3 text-sm font-bold text-white shadow-lg shadow-brand-violet/20 hover:shadow-brand-violet/30 hover:scale-[1.01] transition-all duration-250 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>{isProcessing ? 'Processing...' : `Convert ${pendingCount} ${pendingCount === 1 ? 'Image' : 'Images'}`}</span>
                    </button>
                  )}

                  {successCount > 0 && (
                    <button
                      onClick={onDownloadAll}
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
                          <span>Download Converted {tool.to}</span>
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

      {/* Guide Information Panel for the Tool */}
      <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-brand-violet" />
          <h3 className="text-lg font-bold text-slate-900">About {tool.title} Conversion</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          {tool.guideInfo.about}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {tool.guideInfo.useCases.map((useCase, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-start gap-3">
              <Zap className="w-4 h-4 text-brand-violet shrink-0 mt-0.5" />
              <span className="text-xs text-slate-700 font-semibold leading-relaxed">{useCase}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-emerald" />
            <span>Files are processed locally and never stored on any external server.</span>
          </span>
        </div>
      </div>
    </div>
  );
};
