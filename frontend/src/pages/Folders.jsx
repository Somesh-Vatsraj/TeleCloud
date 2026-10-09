import { useEffect, useState } from 'react';
import { api } from '../api/index.js';
import { useToast } from '../hooks/useToast.js';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
import Loader from '../components/common/Loader.jsx';
import { FOLDER_COLORS } from '../utils/constants.js';

export default function Folders() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(FOLDER_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.listFolders();
      setFolders(data.folders || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async () => {
    if (!name.trim()) return toast.error('Enter a name');
    setSaving(true);
    try {
      await api.createFolder({ name: name.trim(), color });
      toast.success('Folder created');
      setOpen(false);
      setName('');
      setColor(FOLDER_COLORS[0]);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (folder) => {
    if (!confirm(`Delete folder "${folder.name}"? Files will be unfiled.`)) return;
    try {
      await api.deleteFolder(folder.id);
      setFolders((f) => f.filter((x) => x.id !== folder.id));
      toast.success('Folder deleted');
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) return <Loader full />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Folders</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize your files with colored folders.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>📁 New folder</Button>
      </div>

      {!folders.length ? (
        <div className="card-static p-10 text-center">
          <div className="text-4xl mb-3">🗂️</div>
          <p className="text-slate-500 dark:text-slate-400">No folders yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {folders.map((f) => (
            <div key={f.id} className="card p-5 group relative">
              <div
                className="h-12 w-12 rounded-xl grid place-items-center text-2xl mb-3"
                style={{ background: `${f.color}22`, color: f.color }}
              >
                📁
              </div>
              <div className="font-semibold text-sm truncate">{f.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {f.file_count} file{f.file_count === 1 ? '' : 's'}
              </div>
              <button
                onClick={() => remove(f)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-red-500 text-xs transition-opacity"
                title="Delete folder"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create folder"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={create}>Create</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name" placeholder="e.g. Photos" value={name} onChange={(e) => setName(e.target.value)} />
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                  }`}
                  style={{ background: c }}
                  aria-label={`Pick color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
