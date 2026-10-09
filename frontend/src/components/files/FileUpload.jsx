import { useRef, useState } from 'react';
import { api } from '../../api/index.js';
import { useToast } from '../../hooks/useToast.js';
import { MAX_FILE_SIZE } from '../../utils/constants.js';
import { formatBytes } from '../../utils/format.js';

export default function FileUpload({ folderId, onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);
  const toast = useToast();

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 50MB`);
        continue;
      }
      await upload(file);
    }
  };

  const upload = async (file) => {
    setUploading(true);
    setProgress(0);
    try {
      // simple progress hint
      const tick = setInterval(() => setProgress((p) => Math.min(p + 8, 90)), 120);
      const data = await api.uploadFile(file, folderId);
      clearInterval(tick);
      setProgress(100);
      toast.success(`Uploaded ${file.name}`);
      onUploaded?.(data.file);
    } catch (e) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 400);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`card-static cursor-pointer p-6 md:p-8 text-center transition-all ${
        dragging ? 'border-blue-500 ring-2 ring-blue-500/40 -translate-y-0.5' : ''
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="text-4xl mb-3">{uploading ? '⏳' : '📤'}</div>
      <div className="font-medium text-slate-900 dark:text-white">
        {uploading ? 'Uploading…' : 'Drop files here or click to upload'}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Max {formatBytes(MAX_FILE_SIZE)} per file · Sent to your Telegram
      </div>
      {uploading && (
        <div className="mt-4 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
