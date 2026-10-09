export default function Footer() {
  return (
    <footer className="hidden md:block px-8 py-4 border-t border-slate-200/70 dark:border-slate-800/70 text-xs text-slate-500 dark:text-slate-400">
      <div className="flex items-center justify-between">
        <span>© {new Date().getFullYear()} TeleCloud · Storage on Telegram</span>
        <span>Built with ☁️ Cloudflare Workers + D1</span>
      </div>
    </footer>
  );
}
