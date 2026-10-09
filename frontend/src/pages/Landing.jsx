import { Link } from 'react-router-dom';
import { APP_NAME, APP_TAGLINE } from '../utils/constants.js';

const features = [
  { icon: '☁️', title: 'Unlimited Cloud Storage', desc: 'Files stored on Telegram — no more paying for storage.' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Chat with Pollinations AI about your files or anything.' },
  { icon: '🔐', title: 'Secure by Default', desc: 'PBKDF2 hashed passwords + HttpOnly JWT cookies.' },
  { icon: '🔗', title: 'Share Links', desc: 'Password-protected, expiring public links.' },
  { icon: '📁', title: 'Colored Folders', desc: 'Organize your files with customizable folders.' },
  { icon: '⚡', title: 'Lightning Fast', desc: 'Deployed on Cloudflare Workers, globally distributed.' },
  { icon: '🌗', title: 'Dark / Light', desc: 'Beautiful theme that remembers your preference.' },
  { icon: '📱', title: 'PWA-Ready', desc: 'Installable on mobile, offline-aware.' },
];

const steps = [
  { n: 1, t: 'Create account', d: 'Sign up with email + Telegram username.' },
  { n: 2, t: 'Link your bot', d: 'Admin adds the bot token, you click Detect Chat ID.' },
  { n: 3, t: 'Upload files', d: 'Drag & drop — they go to your Telegram chat.' },
  { n: 4, t: 'Share & manage', d: 'Organize, star, share with expiry + password.' },
];

const faqs = [
  { q: 'Where are my files stored?', a: 'Every file is sent to your Telegram chat via a Bot. Cloudflare only stores metadata.' },
  { q: 'Is it free?', a: 'Yes — Telegram is free and so is this app. No hidden costs.' },
  { q: 'What is the size limit?', a: 'Each file can be up to 50MB in the browser uploader. Telegram itself supports 2GB.' },
  { q: 'Can I use multiple devices?', a: 'Absolutely. Sign in with the same account.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#eef2f9] dark:bg-[#060912]">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-white">☁️</div>
            <span className="font-bold text-lg">{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost px-4 py-2 text-sm">Sign in</Link>
            <Link to="/register" className="btn-primary px-4 py-2 text-sm">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 text-xs font-medium mb-5">
            🚀 Powered by Cloudflare Workers + Telegram
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Your files, <span className="gradient-text">free forever</span> on Telegram.
          </h1>
          <p className="mt-5 text-slate-600 dark:text-slate-400 text-lg">
            {APP_TAGLINE}. Upload, organize, share, and let AI help — all in one beautiful dashboard.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary px-6 py-3 text-base">
              Create free account →
            </Link>
            <Link to="/login" className="btn-ghost px-6 py-3 text-base">
              I already have one
            </Link>
          </div>
          <div className="mt-6 text-xs text-slate-500 dark:text-slate-400">
            No credit card · No storage fees · Ready in 60 seconds
          </div>
        </div>

        <div className="relative">
          <div className="card-static p-6 rotate-[-2deg] animate-float">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-amber-500/70" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
            </div>
            <div className="space-y-3">
              {[
                { i: '🖼️', n: 'vacation.jpg', s: '2.4 MB' },
                { i: '🎬', n: 'demo.mp4', s: '18 MB' },
                { i: '📕', n: 'report.pdf', s: '512 KB' },
                { i: '🎵', n: 'track.mp3', s: '4.1 MB' },
              ].map((f) => (
                <div key={f.n} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                  <div className="text-2xl">{f.i}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{f.n}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{f.s}</div>
                  </div>
                  <div className="text-xs text-blue-500">✓ stored</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Everything you need</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            A full-featured cloud drive that costs nothing.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="card p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-semibold text-slate-900 dark:text-white">{f.title}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div key={s.n} className="card-static p-6">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-white font-bold">
                {s.n}
              </div>
              <div className="mt-3 font-semibold">{s.t}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold">FAQ</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="card-static p-5 group">
              <summary className="cursor-pointer font-medium flex items-center justify-between list-none">
                <span>{f.q}</span>
                <span className="text-slate-400 group-open:rotate-180 transition">▾</span>
              </summary>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 p-10 text-center text-white shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold">Start storing on Telegram today</h2>
          <p className="mt-3 opacity-90">Free forever. No credit card. No storage fees.</p>
          <Link
            to="/register"
            className="mt-6 inline-block rounded-xl bg-white text-blue-600 font-semibold px-6 py-3 hover:scale-[1.02] transition"
          >
            Get started for free →
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200/70 dark:border-slate-800/70 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} {APP_NAME}. Built with Cloudflare Workers, D1, React and Telegram.
      </footer>
    </div>
  );
}
