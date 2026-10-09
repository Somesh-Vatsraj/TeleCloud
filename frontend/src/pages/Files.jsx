import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/index.js';
import { useToast } from '../hooks/useToast.js';
import FileUpload from '../components/files/FileUpload.jsx';
import FileList from '../components/files/FileList.jsx';
import FilePreview from '../components/files/FilePreview.jsx';
import ShareModal from '../components/files/ShareModal.jsx';
import { FILE_FILTERS } from '../utils/constants.js';

export default function Files() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [folderId, setFolderId] = useState('');
  const [folders, setFolders] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [shareFile, setShareFile] = useState(null);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listFiles({ filter, search, folder: folderId });
      setFiles(data.files || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter, search, folderId, toast]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    api.listFolders().then((d) => setFolders(d.folders || [])).catch(() => {});
  }, []);

  const onStar = async (file) => {
    try {
      const data = await api.updateFile(file.id, { starred: !file.starred });
      setFiles((fs) => fs.map((f) => (f.id === file.id ? data.file : f)));
    } catch (e) {
      toast.error(e.message);
    }
  };

  const onDelete = async (file) => {
    if (!confirm(`Delete "${file.name}"?`)) return;
    try {
      await api.deleteFile(file.id);
      setFiles((fs) => fs.filter((f) => f.id !== file.id));
      toast.success('File deleted');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Files</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Upload and manage your Telegram-backed storage.
        </p>
      </div>

      <FileUpload folderId={folderId} onUploaded={() => load()} />

      <div className="flex flex-wrap items-center gap-2">
        {FILE_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs border transition ${
              filter === f.key
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent'
                : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500/50'
            }`}
          >
            {f.emoji} {f.label}
          </button>
        ))}
        <div className="flex-1" />
        <select
          className="input max-w-[180px] py-1.5 text-xs"
          value={folderId}
          onChange={(e) => setFolderId(e.target.value)}
        >
          <option value="">All folders</option>
          <option value="null">Unfiled</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <input
          className="input max-w-[200px] py-1.5 text-xs"
          placeholder="Search files…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <FileList
        files={files}
        loading={loading}
        onStar={onStar}
        onDelete={onDelete}
        onShare={setShareFile}
        onPreview={setPreviewFile}
        emptyText={search ? 'No files match your search.' : 'No files yet — upload something!'}
      />

      <FilePreview file={previewFile} open={Boolean(previewFile)} onClose={() => setPreviewFile(null)} />
      <ShareModal file={shareFile} open={Boolean(shareFile)} onClose={() => setShareFile(null)} />
    </div>
  );
}
