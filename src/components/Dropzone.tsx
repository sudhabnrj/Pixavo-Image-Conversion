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
      
      const acceptedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.heic', '.heif', '.cr2', '.cr3', '.nef', '.arw', '.rw2', '.raf', '.orf', '.pef', '.dng', '.raw'];
      const validFiles = filesArray.filter(file => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        return acceptedExtensions.includes(ext) || file.type.startsWith('image/');
      });

      if (validFiles.length === 0) {
        alert('None of the dropped files are supported image formats.');
        return;
      }

      if (validFiles.length < filesArray.length) {
        alert('Some files were skipped because they are not supported image formats.');
      }

      onFilesAdded(validFiles);
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
      className={`relative w-full py-14 px-6 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl cursor-pointer overflow-hidden backdrop-blur-md transition-all duration-300 ${
        isDragActive
          ? 'border-brand-violet bg-brand-violet/5 scale-[1.01] shadow-xl shadow-brand-violet/5'
          : 'border-slate-200 bg-white/70 hover:border-brand-violet/45 hover:bg-white hover:scale-[1.005] hover:shadow-md hover:shadow-slate-100/50'
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
        <div className="mb-4 p-4.5 rounded-full bg-slate-50 border border-slate-100 text-slate-600 transition-all duration-300 group-hover:scale-110 shadow-sm">
          {isDragActive ? (
            <UploadCloud className="w-10 h-10 text-brand-violet animate-bounce" />
          ) : (
            <div className="flex space-x-1.5 items-center">
              <Camera className="w-7 h-7 text-brand-violet" />
              <UploadCloud className="w-9 h-9 text-slate-400" />
              <ImageIcon className="w-7 h-7 text-brand-emerald" />
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-1.5">
          {isDragActive ? 'Drop your images here' : 'Drag & drop your images here'}
        </h3>
        <p className="text-sm text-slate-500 mb-5 max-w-lg leading-relaxed">
          Supports RAW camera files (<span className="text-slate-800 font-semibold">DNG, CR2, NEF, ARW, RW2</span>), Apple live photos (<span className="text-slate-800 font-semibold">HEIC/HEIF</span>), PNG, WebP, JPEG, GIF, and BMP.
        </p>

        <button
          type="button"
          className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm pointer-events-none"
        >
          Browse Files
        </button>
      </div>
    </div>
  );
};
