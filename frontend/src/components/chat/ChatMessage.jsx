import { relativeTime } from '../../utils/format.js';

export default function ChatMessage({ message }) {
  const isUser = message.direction === 'out';
  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'} animate-pop`}>
      {!isUser && (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-white flex-shrink-0 text-sm">
          🤖
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-md'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.text}</div>
        <div className={`mt-1 text-[10px] ${isUser ? 'text-white/70' : 'text-slate-400'}`}>
          {relativeTime(message.created_at)}
        </div>
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center text-white flex-shrink-0 text-sm">
          🙋
        </div>
      )}
    </div>
  );
}
