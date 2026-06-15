import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Camera } from 'lucide-react';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesAdded(filesArray);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesAdded(filesArray);
      // Reset input value so the same file can be uploaded again if removed
      e.target.value = '';
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
      className={`relative w-full py-12 px-6 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer overflow-hidden backdrop-blur-md transition-all duration-300 ${
        isDragActive
          ? 'border-brand-emerald bg-brand-emerald/10 scale-[1.01] shadow-lg shadow-brand-emerald/10'
          : 'border-zinc-700 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-900/60 hover:scale-[1.005]'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleChange}
        className="hidden"
        accept="image/*,.heic,.heif,.cr2,.nef,.arw,.dng,.pef,.orf,.rw2"
      />

      {/* Decorative ambient glow */}
      <div className="absolute -inset-10 bg-radial from-brand-violet/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center text-center z-10">
        <div className="mb-4 p-4 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-300 transition-all duration-300 group-hover:scale-110">
          {isDragActive ? (
            <UploadCloud className="w-10 h-10 text-brand-emerald animate-bounce" />
          ) : (
            <div className="flex space-x-1 items-center">
              <Camera className="w-8 h-8 text-brand-violet" />
              <UploadCloud className="w-10 h-10 text-zinc-300" />
              <ImageIcon className="w-8 h-8 text-zinc-400" />
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-zinc-200 mb-1">
          {isDragActive ? 'Drop your images here' : 'Drag & drop your images here'}
        </h3>
        <p className="text-sm text-zinc-400 mb-4 max-w-md">
          Supports RAW camera files (<span className="text-zinc-300">DNG, CR2, NEF, ARW, RW2</span>), Apple live photos (<span className="text-zinc-300">HEIC/HEIF</span>), PNG, WebP, JPEG, GIF, and BMP.
        </p>

        <button
          type="button"
          className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 hover:border-zinc-650 rounded-xl font-medium text-sm transition-all duration-200 shadow-md pointer-events-none"
        >
          Browse Files
        </button>
      </div>
    </div>
  );
};
