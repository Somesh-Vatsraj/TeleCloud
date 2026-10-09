```markdown
# ☁️ TeleCloud

> AI-powered cloud storage that stores your files on Telegram via a Bot — **free forever, no storage fees**.



---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Bot Setup](#-bot-setup)
- [Deployment](#-deployment)
- [Admin Panel](#-admin-panel)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Security Notes](#-security-notes)
- [FAQ](#-faq)
- [License](#-license)

---

## 🌟 Overview

**TeleCloud** turns Telegram into your personal cloud drive. Upload files, organize them in folders, share them with expiring links, and chat with an AI assistant — all from a beautiful web dashboard.

Unlike traditional cloud storage, TeleCloud uses **Telegram's free file hosting** as the storage backend. This means:

- 💰 **₹0 storage cost** — you use your own Telegram chat as storage
- 🔒 **Private by default** — files live in your personal Telegram chat
- ⚡ **Globally fast** — served from Cloudflare's edge network (300+ cities)
- 🤖 **AI built-in** — Pollinations AI for file insights and chat
- 📱 **PWA-ready** — install on mobile like a native app

---

## ✨ Features

### 🔐 Authentication & Security
- JWT (HS256) authentication with HttpOnly cookies
- PBKDF2 password hashing (100,000 iterations, SHA-256)
- CSRF-safe with `SameSite=Lax` cookies
- Per-user data isolation (every query is scoped by `user_id`)

### 📁 File Management
- **Drag & drop upload** with progress indicator (max 50 MB per file)
- **Auto-forwarding** to your Telegram chat via the shared bot
- **File preview modal** — image, video, audio, PDF inline
- **Star files** for quick access
- **Search** across all filenames
- **Filter** by type: images, videos, audio, documents, starred

### 🗂️ Folders
- Create colored folders (8 preset colors)
- Move files between folders
- Per-folder file counts
- Cascade-safe deletion (files move to "Unfiled")

### 🔗 Share Links
- Public download links with unique tokens
- **Optional password protection**
- **Optional expiry** (1 day / 7 days / 30 days / never)
- Download counter
- Revoke anytime

### 🤖 AI Assistant
- Chat with Pollinations AI (free, no API key)
- **Chat history saved to DB**
- Auto file analysis on upload
- 10-message context window

### 📊 Dashboard
- Welcome header with user's name
- 4 stat cards: total files, storage used, active shares, starred
- **Storage breakdown chart** by file type
- **Recent uploads** list
- **Quick actions** grid
- **Bot status** indicator

### 🛡️ Admin Panel
- Configure the shared bot token (with live verification)
- View all users + their stats
- System-wide totals (users, files, storage, shares)

### 🎨 UI/UX
- **Dark mode** (default) + **light mode** toggle
- Smooth animations: float, pop, slide-up, shimmer
- Fully responsive (mobile bottom nav, desktop sidebar)
- Toast notifications
- Keyboard-friendly (Esc closes modals, Enter submits)
- **PWA-installable**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (User)                            │
│  React 18 + Vite + Tailwind CSS + React Router v6                │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              Cloudflare Worker (Single deployment)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  /api/*      │  │  Static      │  │  SPA Fallback        │   │
│  │  Router      │  │  Assets      │  │  (React Router)      │   │
│  └──────┬───────┘  └──────────────┘  └──────────────────────┘   │
└─────────┼───────────────────────────────────────────────────────┘
          │
          ├──────────────► ┌──────────────────────────┐
          │                │  Cloudflare D1 (SQLite)  │
          │                │  users, files, shares,   │
          │                │  folders, messages, etc. │
          │                └──────────────────────────┘
          │
          ├──────────────► ┌──────────────────────────┐
          │                │  Telegram Bot API        │
          │                │  sendDocument, getFile   │
          │                └──────────────────────────┘
          │
          └──────────────► ┌──────────────────────────┐
                           │  Pollinations AI         │
                           │  text.pollinations.ai    │
                           └──────────────────────────┘
```

**Key insight:** Telegram is used as the **blob storage** (files), while D1 stores **metadata** (name, size, mime, tg_file_id). Downloads proxy through the Worker to hide the bot token.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Backend** | Cloudflare Workers (ES modules) | Serverless, global, cheap |
| **Database** | Cloudflare D1 (SQLite) | SQL, zero-config, free tier |
| **Frontend** | React 18 + Vite | Fast HMR, small bundles |
| **Styling** | Tailwind CSS 3 | Utility-first, dark mode |
| **Routing** | React Router v6 | Nested routes, layouts |
| **Auth** | JWT (HS256) + PBKDF2 | No npm deps, Web Crypto |
| **AI** | Pollinations AI | Free, no API key needed |
| **Storage** | Telegram Bot API | Free unlimited file hosting |
| **Deployment** | Single Worker | One URL, one deploy |

---

## 📂 Project Structure

```
telecloud/
├── package.json                  # Root scripts (run both dev servers)
├── wrangler.toml                 # ⚠️ MUST be at root for Cloudflare
├── .gitignore
├── README.md
│
├── worker/
│   ├── package.json
│   ├── schema.sql                # D1 schema
│   └── src/
│       ├── index.js              # Router + all API routes + asset serving
│       ├── auth.js               # JWT + PBKDF2 + cookie helpers
│       ├── telegram.js           # Telegram Bot API wrapper
│       ├── ai.js                 # Pollinations AI wrapper
│       └── db.js                 # D1 query helpers
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── public/
    │   ├── favicon.svg
    │   ├── manifest.webmanifest
    │   └── sw.js                 # Service worker for PWA
    └── src/
        ├── api/index.js          # All API calls
        ├── context/              # AuthContext, ThemeContext
        ├── hooks/                # useAuth, useToast, useFetch, useLocalStorage
        ├── components/
        │   ├── common/           # Button, Input, Modal, Toast, Loader, Card
        │   ├── layout/           # Sidebar, MobileNav, Navbar, Footer, Layout
        │   ├── files/            # FileList, FileItem, FileUpload, FilePreview, ShareModal
        │   ├── chat/             # ChatBox, ChatMessage, ChatInput
        │   ├── dashboard/        # StatCard, StorageChart, QuickActions, BotStatus
        │   └── ProtectedRoute.jsx
        ├── pages/                # Landing, Login, Register, Dashboard, Files,
        │                         # Folders, Shares, Chat, Activity, Profile,
        │                         # Admin, PublicShare, NotFound
        ├── utils/                # format, fileIcons, validators, constants
        ├── App.jsx
        ├── main.jsx
        └── index.css
```

### ⚠️ Important: `wrangler.toml` Location

**The `wrangler.toml` file MUST be at the project root** (next to `package.json`) — **not** inside `worker/`. This is required by Cloudflare's build system.

Correct paths inside `wrangler.toml`:
```toml
main = "worker/src/index.js"
directory = "./frontend/dist"
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (`node -v`)
- **npm** 9+ (`npm -v`)
- **Cloudflare account** (free) — [sign up](https://dash.cloudflare.com/sign-up)
- **Telegram account** — for creating a bot

### One-Command Install

```bash
# 1. Clone the repo
git clone https://github.com/YOUR-USERNAME/TeleCloud.git
cd TeleCloud

# 2. Install everything (root + worker + frontend)
npm install
```

The `postinstall` script automatically installs deps in `worker/` and `frontend/`.

### Setup Cloudflare

```bash
# 3. Login to Cloudflare (opens browser)
npm run login

# 4. Create the D1 database
npm run db:create
```

**Copy the `database_id`** from the output and paste it into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "telecloud"
database_id = "PASTE-YOUR-DATABASE-ID-HERE"   # ← here
```

### Initialize Database

```bash
# 5. Apply schema to production DB
npm run db:init
```

### Run Locally

```bash
# 6. Start both servers (API :8787 + Web :5173)
npm run dev
```

Open **http://localhost:5173** — you should see the landing page.

### Deploy

```bash
# 7. Build frontend + deploy Worker
npm run deploy
```

Your app is live at:
```
https://telecloud.YOUR-SUBDOMAIN.workers.dev
```

### Promote Yourself to Admin

```bash
# 8. First register on the deployed app, then:
npm run admin:make
```

---

## ⚙️ Environment Setup

### `wrangler.toml` (Root)

```toml
name = "telecloud"
main = "worker/src/index.js"
compatibility_date = "2024-11-01"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = "./frontend/dist"
binding = "ASSETS"
not_found_handling = "single-page-application"

[[d1_databases]]
binding = "DB"
database_name = "telecloud"
database_id = "YOUR-D1-DATABASE-ID"

[vars]
JWT_SECRET = "your-random-32-char-secret-here"
AI_ENDPOINT = "https://text.pollinations.ai/openai"

[observability]
enabled = true
```

### 🔑 Generate `JWT_SECRET`

**Chrome DevTools Console:**
```javascript
crypto.getRandomValues(new Uint8Array(16)).reduce((s,b)=>s+b.toString(16).padStart(2,'0'),'')
```

**Terminal:**
```bash
# Linux / macOS
openssl rand -hex 32

# Windows PowerShell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 🔐 Production Secrets (Recommended)

Don't put `JWT_SECRET` in `wrangler.toml` for production. Use Cloudflare Secrets:

```bash
npx wrangler secret put JWT_SECRET
# Paste your secret when prompted
```

Then remove the `JWT_SECRET` line from `wrangler.toml`.

### `frontend/.env`

```env
VITE_API_BASE=/api
```

---

## 🗄️ Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `settings` | Shared config (bot_token, bot_username) |
| `users` | User accounts + Telegram link |
| `folders` | Colored folders per user |
| `files` | File metadata + Telegram file_id |
| `messages` | AI chat history |
| `shares` | Public share tokens + expiry |
| `activities` | Activity log |

### `users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | PK, auto-increment |
| `name` | TEXT | Display name |
| `email` | TEXT | UNIQUE |
| `password_hash` | TEXT | `pbkdf2$100000$salt$hash` |
| `tg_username` | TEXT | Telegram @username |
| `chat_id` | TEXT | Auto-detected Telegram chat ID |
| `is_admin` | INTEGER | 0 or 1 |
| `theme` | TEXT | `dark` / `light` |
| `avatar` | TEXT | URL |
| `bio` | TEXT | Short bio |
| `created_at` | INTEGER | Unix timestamp |

### `files`

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | PK |
| `user_id` | INTEGER | FK → users |
| `folder_id` | INTEGER | FK → folders (nullable) |
| `tg_file_id` | TEXT | Telegram file_id |
| `message_id` | INTEGER | Telegram message_id |
| `name` | TEXT | Original filename |
| `size` | INTEGER | Bytes |
| `mime` | TEXT | MIME type |
| `starred` | INTEGER | 0 or 1 |
| `created_at` | INTEGER | Unix timestamp |

### `shares`

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | PK |
| `user_id` | INTEGER | FK → users |
| `file_id` | INTEGER | FK → files |
| `token` | TEXT | UNIQUE, 24-char random |
| `password` | TEXT | Hashed or NULL |
| `expires_at` | INTEGER | Unix timestamp or NULL |
| `downloads` | INTEGER | Counter |
| `created_at` | INTEGER | Unix timestamp |

### Indexes

- `files.user_id`
- `folders.user_id`
- `messages (user_id, id DESC)`
- `shares.token`
- `shares.user_id`
- `activities.user_id`
- `files.folder_id`

---

## 🌐 API Endpoints

### Public (no auth)

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| POST | `/api/register` | `{ name, email, tg_username, password }` | `{ user, token }` + cookie |
| POST | `/api/login` | `{ email, password }` | `{ user, token }` + cookie |
| POST | `/api/logout` | — | `{ ok: true }` |
| GET | `/api/me` | — | `{ user }` |
| GET | `/api/bot-info` | — | `{ bot_username, ready }` |
| GET | `/api/public/share/:token` | — | Share metadata |
| POST | `/api/public/share/:token/download` | `{ password? }` | File stream |

### Authenticated (cookie required)

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| PATCH | `/api/profile` | `{ name?, bio?, avatar?, password?, theme? }` | `{ user }` |
| POST | `/api/detect-chat-id` | — | `{ chat_id }` |
| GET | `/api/stats` | — | Stats summary |
| GET | `/api/files` | `?filter=&search=&folder=` | `{ files }` |
| POST | `/api/files/upload` | FormData `{ file, folder_id? }` | `{ file }` |
| PATCH | `/api/files/:id` | `{ starred?, folder_id? }` | `{ file }` |
| DELETE | `/api/files/:id` | — | `{ ok: true }` |
| GET | `/api/files/:id/download` | — | File stream (Range supported) |
| GET | `/api/folders` | — | `{ folders }` |
| POST | `/api/folders` | `{ name, color }` | `{ folder }` |
| DELETE | `/api/folders/:id` | — | `{ ok: true }` |
| GET | `/api/shares` | — | `{ shares }` |
| POST | `/api/shares` | `{ file_id, password?, expiry? }` | `{ share }` |
| DELETE | `/api/shares/:id` | — | `{ ok: true }` |
| POST | `/api/ai/chat` | `{ prompt }` | `{ reply }` |
| GET | `/api/messages` | — | `{ messages }` |
| GET | `/api/activities` | — | `{ activities }` |

### Admin only

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| POST | `/api/admin/bot-token` | `{ bot_token }` | `{ ok, bot_username }` |
| GET | `/api/admin/users` | — | `{ users, totals }` |

---

## 🤖 Bot Setup

### Step 1: Create the Bot

1. Open Telegram → search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Give it a name (e.g., `TeleCloud Storage`)
4. Give it a username ending in `bot` (e.g., `my_telecloud_bot`)
5. **Copy the token** — looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

### Step 2: Save Token in TeleCloud

1. Open your TeleCloud URL
2. **Register** → verify you're admin
3. Go to **Admin** page (`/admin`)
4. Paste the token → click **Save token**
5. Bot verification runs automatically ✅

### Step 3: Link Your Chat

1. On Telegram, **search your bot** by username
2. Send `/start` to it
3. Return to TeleCloud → go to **Profile** page
4. Click **📡 Detect Chat ID**
5. If successful, your chat_id is saved

Now you're ready — uploads will be forwarded to your Telegram chat.

---

## 🚀 Deployment

### Prerequisites

```bash
# First time only
npm run login                          # Cloudflare auth
npm run db:create                      # Create D1
# Paste database_id into wrangler.toml
npm run db:init                        # Apply schema
```

### Deploy

```bash
npm run deploy
```

This script:
1. Builds the frontend (`frontend/dist/`)
2. Deploys the Worker with assets

### Cloudflare Dashboard Configuration

Ensure your Worker's **Build Settings** are:

| Setting | Value |
|---------|-------|
| **Build command** | `npm run build` |
| **Deploy command** | `npx wrangler deploy` |
| **Root directory** | *(empty)* |
| **Build output directory** | `frontend/dist` |

### Auto-Deploy from GitHub

1. Push your repo to GitHub
2. In Cloudflare: **Workers & Pages** → **Create** → **Connect to Git**
3. Select your repo
4. Cloudflare detects `wrangler.toml` at root
5. Every push triggers a new deploy ✅

### Environment Variables

**Production (recommended):**
```bash
npx wrangler secret put JWT_SECRET
```

**Preview / dev:** put in `wrangler.toml` under `[vars]`.

---

## 🛡️ Admin Panel

Access at `/admin` — only if `users.is_admin = 1`.

### What you can do

1. **Configure bot token** — verifies with Telegram before saving
2. **View all users** — with file count, storage, join date
3. **System totals** — users, files, total size, shares

### Promote a user to admin

```bash
# By ID
npx wrangler d1 execute telecloud --command "UPDATE users SET is_admin=1 WHERE id=1" --remote

# By email
npx wrangler d1 execute telecloud --command "UPDATE users SET is_admin=1 WHERE email='you@example.com'" --remote

# Via npm script
npm run admin:make
```

---

## 💻 Development

### Scripts

| Command | What it does |
|---------|-------------|
| `npm install` | Install root + worker + frontend |
| `npm run dev` | Run API (8787) + Web (5173) |
| `npm run dev:api` | Run API only |
| `npm run dev:web` | Run Web only |
| `npm run build` | Build frontend to `frontend/dist` |
| `npm run deploy` | Build + deploy Worker |
| `npm run db:create` | Create D1 database |
| `npm run db:init` | Apply schema (remote) |
| `npm run admin:make` | Promote user id=1 to admin |
| `npm run login` | Cloudflare login |

### Local Database

To work with a local D1 (faster, no quota):

```bash
# Apply schema locally
npx wrangler d1 execute telecloud --file=./worker/schema.sql

# Query locally
npx wrangler d1 execute telecloud --command "SELECT * FROM users"
```

Run without `--remote` to use local SQLite.

### Vite Proxy

In dev, Vite proxies `/api/*` → `http://localhost:8787`, so cookies and CORS work seamlessly.

### Hot Reload

- Frontend: Vite HMR (instant)
- Worker: Wrangler restarts on file change

---

## 🐛 Troubleshooting

### ❌ Build fails: `Could not resolve "./hooks/useToast.js"`

**Cause:** JSX file has `.js` extension.

**Fix:** Rename `.js` → `.jsx` and update imports:
```bash
mv frontend/src/hooks/useToast.js frontend/src/hooks/useToast.jsx
# Then update all imports from 'useToast.js' → 'useToast.jsx'
```

### ❌ Build fails: `"useTheme" is not exported by ThemeContext.jsx`

**Cause:** Missing hook export.

**Fix:** In `ThemeContext.jsx`, add:
```javascript
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
```

### ❌ Deploy fails: `The entry-point file at "src/index.js" was not found`

**Cause:** `wrangler.toml` has old path or is in the wrong location.

**Fix:** Ensure `wrangler.toml` is at **project root**, with:
```toml
main = "worker/src/index.js"
directory = "./frontend/dist"
```

Delete `worker/wrangler.toml` if it exists.

### ❌ Share link shows 404 "This page drifted away into space"

**Cause:** Frontend bundle is old; missing `/s/:token` route.

**Fix:**
1. Ensure `frontend/src/pages/PublicShare.jsx` exists
2. Ensure `frontend/src/App.jsx` has:
   ```jsx
   import PublicShare from './pages/PublicShare.jsx';
   // ...
   <Route path="/s/:token" element={<PublicShare />} />
   ```
3. Commit + push
4. Hard-refresh browser (`Ctrl+Shift+R`)

### ❌ Sidebar shows literal `0` under menus

**Cause:** React renders `{0 && <JSX/>}` as `"0"`.

**Fix:** Wrap in `Boolean()`:
```jsx
const isAdmin = Boolean(user?.is_admin);
// ...
{isAdmin && <NavLink to="/admin">...</NavLink>}
```

### ❌ "Chat ID not set" on upload

**Cause:** Bot hasn't been messaged yet, or username mismatch.

**Fix:**
1. Send `/start` to your bot on Telegram
2. Check your `tg_username` in **Profile** matches your Telegram handle
3. Click **Detect Chat ID** again

### ❌ "Bot not configured" error

**Cause:** No admin has set the bot token.

**Fix:**
1. Promote yourself: `npm run admin:make`
2. Go to **Admin** page
3. Paste token from [@BotFather](https://t.me/BotFather)

### ❌ Login fails silently

**Check:**
1. Browser dev tools → **Application** → **Cookies** → ensure `tc_token` is set
2. `JWT_SECRET` must be identical between deploys
3. `Secure` cookie flag requires HTTPS (works only on deployed, not `http://localhost`)

### ❌ Upload fails with "Telegram error"

**Check:**
1. Bot token valid? Test: `https://api.telegram.org/bot<TOKEN>/getMe`
2. Chat ID correct? Send `/start` again
3. File under 50 MB?
4. Bot not blocked by user

### ❌ `npm run db:init` fails

**Check:**
1. D1 database exists: `npx wrangler d1 list`
2. `database_id` in `wrangler.toml` matches
3. Logged in: `npx wrangler whoami`

### ⚠️ Cache issues after deploy

Browser may serve old bundle. Do:
- **Ctrl + Shift + R** (hard refresh)
- DevTools → Network → "Disable cache" checkbox

Service worker might cache old assets. Unregister:
- DevTools → Application → Service Workers → Unregister

---

## 🔐 Security Notes

### Password Storage

- PBKDF2 with 100,000 iterations
- SHA-256 hash
- 16-byte random salt per user
- 256-bit derived key
- Constant-time comparison

Format stored: `pbkdf2$100000$salt_hex$hash_hex`

### JWT

- HS256, signed with `JWT_SECRET`
- 30-day expiry
- Stored in HttpOnly cookie (not accessible to JS)
- `SameSite=Lax` prevents CSRF
- `Secure` flag enforced in production

### File Access

- Every file query scoped by `user_id`
- Public shares validated for expiry + optional password
- Password hashed with same PBKDF2 scheme
- Downloads proxy through Worker — bot token never exposed

### Recommendations

1. **Rotate `JWT_SECRET`** if leaked — this invalidates all sessions
2. **Use Cloudflare Secrets** for production: `npx wrangler secret put JWT_SECRET`
3. **Never commit** `wrangler.toml` with real secrets to a public repo
4. **Enable rate limiting** in production via Cloudflare WAF
5. **Enable Turnstile** for registration if public

---

## ❓ FAQ

**Q: Is it really free?**
A: Yes. Telegram is free, Cloudflare Workers free tier covers 100k requests/day, D1 free tier covers 5M reads/day. For personal use, you'll never hit limits.

**Q: What if I delete the bot?**
A: Files in Telegram remain (they're just messages). You'd lose access through TeleCloud until you re-link a new bot.

**Q: Can I use my own Telegram (not a bot)?**
A: No — TeleCloud uses the Bot API, which requires a bot. But the bot forwards files to your personal chat.

**Q: File size limit?**
A: 50 MB in the browser uploader. Telegram supports up to 2 GB (bots) / 4 GB (Premium).

**Q: Where are my files stored?**
A: Files live in your Telegram chat with the bot. Metadata lives in Cloudflare D1.

**Q: Can I migrate my data?**
A: Yes — export via `npx wrangler d1 export telecloud --remote`.

**Q: Does it work offline?**
A: The PWA shell loads offline, but uploads/downloads require internet.

**Q: How do I delete my account?**
A: Currently manual: `npx wrangler d1 execute telecloud --command "DELETE FROM users WHERE email='you@example.com'" --remote` (cascades to files, shares, etc.).

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

You're free to use, modify, and distribute this software. Attribution appreciated but not required.

---

## 🙏 Credits

Built with:
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pollinations AI](https://pollinations.ai/)
- [Telegram Bot API](https://core.telegram.org/bots/api)

---

## 📬 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR-USERNAME/TeleCloud/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR-USERNAME/TeleCloud/discussions)

---

<p align="center">
  Made with ☁️ and ❤️ — <strong>TeleCloud</strong>
</p>
```

---

## 🎯 क्या-क्या Cover किया इस README में

| Section | Content |
|---------|---------|
| ✅ Overview | Project ka purpose |
| ✅ Features | Har feature bullet points me |
| ✅ Architecture | ASCII diagram |
| ✅ Tech Stack | Table with reasons |
| ✅ Project Structure | Full tree |
| ✅ Quick Start | 8-step setup |
| ✅ Environment Setup | wrangler.toml + JWT generate commands |
| ✅ Database Schema | All 7 tables |
| ✅ API Endpoints | 20+ endpoints |
| ✅ Bot Setup | 3-step BotFather flow |
| ✅ Deployment | Local + GitHub auto-deploy |
| ✅ Admin Panel | How to promote + use |
| ✅ Development | Scripts + local DB |
| ✅ **Troubleshooting** | **9 common errors + fixes** (जो हमने experience किए!) |
| ✅ Security | PBKDF2, JWT, cookies details |
| ✅ FAQ | 8 common questions |
| ✅ License | MIT |
| ✅ Credits | Libraries list |

---

## 🚀 अब ये करें

1. Root folder में `README.md` खोलें
2. **Ctrl+A → Delete** (पुराना content हटाओ)
3. ऊपर वाला पूरा content **paste** करो
4. **`YOUR-USERNAME`** को अपने GitHub username से replace करो (2-3 जगह हैं)
5. Save करो
6. Push करो:

```bash
git add README.md
git commit -m "docs: add comprehensive README"
git push origin main
```
