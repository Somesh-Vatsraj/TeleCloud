# TeleCloud ☁️

AI-powered cloud storage that stores files on Telegram via a Bot.

## Stack
- **Backend:** Cloudflare Workers + D1 (SQLite)
- **Frontend:** React 18 + Vite + Tailwind CSS + React Router v6
- **Auth:** JWT (HS256) + PBKDF2
- **AI:** Pollinations AI (free, no key)
- **Telegram:** Bot API

## Quick Start

```bash
# 1. Install everything (worker + frontend)
npm install

# 2. Login to Cloudflare
npm run login

# 3. Create D1 database
npm run db:create
# → Copy the database_id into worker/wrangler.toml

# 4. Apply schema
npm run db:init

# 5. Run both dev servers
npm run dev
# API: http://localhost:8787
# Web: http://localhost:5173

# 6. Deploy
npm run deploy

# 7. Promote first user to admin
npm run admin:make
