import Modal from '../common/Modal.jsx';
import { api } from '../../api/index.js';
import { fileEmoji, fileType } from '../../utils/fileIcons.js';
import { formatBytes } from '../../utils/format.js';

export default function FilePreview({ file, open, onClose }) {
  if (!file) return null;
  const url = api.downloadUrl(file.id);
  const type = fileType(file.mime || '');

  return (
    <Modal open={open} onClose={onClose} title={file.name} size="lg">
      <div className="space-y-4">
        <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900/60 grid place-items-center min-h-[240px] max-h-[60vh]">
          {type === 'image' ? (
            <img src={url} alt={file.name} className="max-h-[60vh] object-contain" />
          ) : type === 'video' ? (
            <video src={url} controls className="max-h-[60vh] w-full" />
          ) : type === 'audio' ? (
            <audio src={url} controls className="w-full p-4" />
          ) : type === 'pdf' ? (
            <iframe src={url} title={file.name} className="w-full h-[60vh]" />
          ) : (
            <div className="p-10 text-center">
              <div className="text-5xl mb-3">{fileEmoji(file.mime, file.name)}</div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Preview not available for this file type.
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{formatBytes(file.size)}</span>
          <span>{file.mime || 'unknown'}</span>
        </div>
        <div className="flex justify-end gap-2">
          <a
            href={url}
            download={file.name}
            className="btn-primary px-4 py-2.5 text-sm"
          >
            ⬇️ Download
          </a>
        </div>
      </div>
    </Modal>
  );
}
