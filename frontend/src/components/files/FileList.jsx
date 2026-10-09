import FileItem from './FileItem.jsx';
import { Skeleton } from '../common/Loader.jsx';

export default function FileList({ files, loading, onStar, onDelete, onShare, onPreview, emptyText = 'No files yet.' }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }
  if (!files?.length) {
    return (
      <div className="card-static p-10 text-center">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-slate-500 dark:text-slate-400">{emptyText}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((f) => (
        <FileItem
          key={f.id}
          file={f}
          onStar={onStar}
          onDelete={onDelete}
          onShare={onShare}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
}
