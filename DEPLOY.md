# Deploy Orbit (free) — for recruiters & portfolio

One public URL: **UI + API + Socket.io** on a single Render free web service.

> **Note:** Free services **sleep after ~15 minutes** idle. First open can take **30–90 seconds**. After that, the app works normally. Fine for portfolio demos.

## 1. Push code (already prepared)

Repo: `https://github.com/moadh704/orbit`

## 2. Create a free MySQL database

Render free tier often has **no free MySQL**. Use any free MySQL and copy host/user/password/db:

Options that work:

- [Railway](https://railway.app) — create MySQL (free trial credits)
- [Aiven](https://aiven.io) — free trial MySQL
- [Clever Cloud](https://www.clever-cloud.com) — free MySQL (limited)
- Or keep an existing MySQL you already use on Render

You need:

| Variable   | Example              |
|-----------|----------------------|
| DB_HOST   | `xxx.mysql.xxx`      |
| DB_PORT   | `3306`               |
| DB_USER   | `orbit`              |
| DB_PASSWORD | `••••`             |
| DB_NAME   | `orbit`              |

Tables are created **automatically** on server start (`server/db/migrate.js`).

## 3. Deploy the web service on Render

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. **New → Web Service**
3. Connect GitHub repo **`moadh704/orbit`**
4. Settings:

| Field | Value |
|-------|--------|
| **Name** | `orbit` |
| **Region** | any |
| **Branch** | `main` |
| **Runtime** | Node |
| **Build Command** | `npm install --prefix client && npm run build --prefix client && npm install --prefix server` |
| **Start Command** | `npm start --prefix server` |
| **Instance type** | **Free** |

5. **Environment** variables:

```env
NODE_ENV=production
JWT_SECRET=<long-random-string>
CLIENT_URL=https://orbit-xxxx.onrender.com
DB_HOST=<your-mysql-host>
DB_PORT=3306
DB_USER=<user>
DB_PASSWORD=<password>
DB_NAME=orbit
```

After first deploy, set `CLIENT_URL` to the **exact** service URL Render gives you (no trailing slash).

Optional (invites by email — not required to demo):

```env
EMAIL_USER=
EMAIL_PASS=
```

6. Click **Create Web Service** and wait for the build (5–10 min first time).

7. Open: `https://your-service.onrender.com`  
   Health check: `https://your-service.onrender.com/api/health`

## 4. Demo for recruiters

1. Open the URL (wait if cold start).
2. **Register** a new account.
3. Create a project → kanban tasks → drag cards.
4. Optional: open a second browser / incognito to show real-time.

### Portfolio blurb (copy-paste)

> **Orbit** — full-stack team project management (Vue 3, Express, MySQL, Socket.io). Live demo: [URL]. First load on free hosting may take ~1 minute.

## If you already have separate frontend + backend on Render

You can either:

**A. Switch to this single service** (recommended on free) — one URL, no CORS pain.

**B. Keep split services**

- Frontend static site build: `npm install && npm run build` in `client`, publish `dist`
- Env at **build time**:  
  `VITE_API_URL=https://your-api.onrender.com`  
  `VITE_SOCKET_URL=https://your-api.onrender.com`
- Backend env: `CLIENT_URL=https://your-frontend.onrender.com`  
  `SERVE_SPA=false`
