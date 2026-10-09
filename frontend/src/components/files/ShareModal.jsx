import { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import { api } from '../../api/index.js';
import { useToast } from '../../hooks/useToast.jsx';
import { EXPIRY_OPTIONS } from '../../utils/constants.js';

export default function ShareModal({ file, open, onClose }) {
  const [password, setPassword] = useState('');
  const [expiry, setExpiry] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const toast = useToast();

  const create = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await api.createShare({
        file_id: file.id,
        password: password || undefined,
        expiry: expiry || undefined,
      });
      const url = `${window.location.origin}/s/${data.share.token}`;
      setShareUrl(url);
      toast.success('Share link created');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Copy failed');
    }
  };

  const close = () => {
    setPassword('');
    setExpiry('');
    setShareUrl('');
    onClose?.();
  };

  return (
    <Modal open={open} onClose={close} title={`Share “${file?.name || ''}”`}>
      {!shareUrl ? (
        <div className="space-y-4">
          <Input
            label="Password (optional)"
            placeholder="Leave blank for public link"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div>
            <label className="label">Expires in</label>
            <select
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="input"
            >
              {EXPIRY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button onClick={create} loading={loading}>
              🔗 Create link
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 text-xs break-all font-mono">
            {shareUrl}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={close}>
              Done
            </Button>
            <Button onClick={copy}>📋 Copy link</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
