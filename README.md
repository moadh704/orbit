<div align="center">

<br/>

<img src="client/public/orbit.svg" width="64" height="64" alt="Orbit logo" />

<h1>Orbit</h1>

<p><strong>Premium team project management — built for focus, speed, and clarity.</strong></p>

<p>
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-Real--time-010101?style=flat-square&logo=socketdotio&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Security-OWASP%20Aligned-red?style=flat-square&logo=owasp&logoColor=white" />
</p>

<br/>

</div>

---

## What is Orbit?

Orbit is a full-stack team project management platform designed to feel like a **$50M SaaS product**. It draws inspiration from Linear, Vercel, and Raycast — prioritizing density, restraint, and intentional design over visual noise.

Manage projects with kanban boards, track tasks across statuses, collaborate with your team in real time, and keep everyone aligned with activity feeds and role-based permissions — all backed by a security-first architecture.

---

## Features

### Core
- **Kanban boards** — drag-and-drop tasks across Todo → In Progress → Review → Done
- **Real-time collaboration** — Socket.io pushes task moves, creates, and deletes to all connected users instantly
- **Task detail panel** — inline editing, priority, assignee, due dates, and threaded comments
- **Project management** — color-coded projects with progress tracking, status, and due dates
- **Team members** — role-based access (Owner / Manager / Member), email invitations, role changes

### Auth & Security
- JWT authentication with 7-day expiry and per-request verification
- bcrypt password hashing (cost factor 10)
- Tiered rate limiting — global API + hardened auth endpoints
- HTTP security headers via Helmet
- Strict CORS allowlist
- Parameterized SQL queries throughout (no raw interpolation)
- Server-side RBAC enforced on every mutating route

### UI & Experience
- **Three.js particle field** on the auth pages
- **Bento grid dashboard** with GSAP counter animations and ApexCharts activity chart
- **Command palette** (`Ctrl+K`) — search projects and navigate instantly
- **Theme system** — Dark / Dim / Light with 6 accent colors, persisted per user
- **Toast notifications** — success, error, warning, info with auto-dismiss
- **Confirm dialogs** — safe destructive actions
- **Collapsible sidebar** — 240px expanded / 56px icon-only

---

## Tech Stack

### Frontend — `/client`

| Layer | Library |
|-------|---------|
| Framework | Vue 3 (Composition API) |
| Build tool | Vite 5 |
| Styling | Tailwind CSS + CSS custom properties |
| State | Pinia |
| Routing | Vue Router 4 |
| HTTP | Axios |
| Realtime | socket.io-client |
| Drag & drop | vue-draggable-plus |
| Charts | ApexCharts + vue3-apexcharts |
| Animations | GSAP, @vueuse/motion, @formkit/auto-animate |
| 3D / Canvas | Three.js |
| Icons | lucide-vue-next |

**Fonts:** Bricolage Grotesque (headings) · DM Sans (body) · JetBrains Mono (IDs & timestamps)

### Backend — `/server`

| Layer | Library |
|-------|---------|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MySQL 2 |
| Auth | jsonwebtoken + bcryptjs |
| Realtime | Socket.io |
| Validation | express-validator |
| Security | helmet, express-rate-limit |
| Email | Nodemailer |

---

## Project Structure

```
orbit/
├── client/                     # Vue 3 frontend
│   ├── src/
│   │   ├── assets/css/         # Global CSS design system & theme variables
│   │   ├── components/
│   │   │   ├── layout/         # AppSidebar, AppLayout
│   │   │   ├── projects/       # ProjectCard, CreateProjectModal
│   │   │   ├── tasks/          # KanbanBoard, KanbanColumn, TaskCard,
│   │   │   │                   # TaskDetailPanel, CreateTaskModal
│   │   │   └── ui/             # Avatar, Badges, Toast, ConfirmDialog,
│   │   │                       # CommandPalette, Spinner
│   │   ├── lib/
│   │   │   ├── axios.js        # API client with auth interceptors & 401 handler
│   │   │   └── socket.js       # Socket.io singleton
│   │   ├── pages/              # LoginPage, RegisterPage, DashboardPage,
│   │   │                       # ProjectsPage, ProjectViewPage,
│   │   │                       # MembersPage, SettingsPage, NotFoundPage
│   │   ├── router/             # Vue Router with auth guards
│   │   └── stores/             # Pinia: auth, ui, projects, tasks, members
│   └── public/
│       └── orbit.svg
│
└── server/                     # Express API
    ├── controllers/            # authController, projectController,
    │                           # taskController, memberController
    ├── middleware/             # JWT verification middleware
    ├── routes/                 # authRoutes, projectRoutes,
    │                           # taskRoutes, memberRoutes
    ├── db/                     # MySQL connection pool
    └── utils/                  # sendEmail
```

---

## Security Architecture

Security is a first-class concern in Orbit, not an afterthought. The following sections map each control to the threats it mitigates and the relevant OWASP Top 10 categories.

---

### 1 · Authentication — JWT + bcrypt

**How it works**

Every user authenticates via `POST /api/auth/login`. On success the server signs a JWT using `jsonwebtoken` with a configurable secret and a **7-day expiry**:

```js
const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
```

Every subsequent request to a protected route passes through the `protect` middleware, which extracts the token from the `Authorization: Bearer <token>` header and verifies the signature and expiry:

```js
const decoded = jwt.verify(token, process.env.JWT_SECRET)
req.user = decoded   // { id } attached to request context
```

A missing, malformed, or expired token returns `401 Unauthorized` immediately — the request never reaches a controller.

**Password hashing**

Passwords are never stored in plaintext. bcrypt is used with a **cost factor of 10** (~100ms per hash on modern hardware), making offline brute-force attacks computationally expensive:

```js
const hashed = await bcrypt.hash(password, 10)  // register
const match  = await bcrypt.compare(plain, hashed) // login
```

Password changes require the current password to be verified before the new hash is written to the database, preventing account takeover via an unattended session.

**Frontend session handling**

The Axios instance attaches the token automatically on every request. A global response interceptor catches any `401` and immediately clears the token from storage and redirects to `/login` — ensuring expired or revoked sessions cannot linger:

```js
api.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('orbit_token')
    window.location.href = '/login'
  }
  return Promise.reject(err)
})
```

> **OWASP coverage:** A07 — Identification and Authentication Failures

---

### 2 · Authorization — Server-side RBAC

Every project action is gated by a server-side membership check. The frontend never controls what a user *can* do — it only controls what is *shown*. The database is the authority.

**Membership verification**

Before any project resource is read or mutated, the server queries the `project_members` table to confirm the requesting user is actually a member:

```js
const [member] = await db.query(
  'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
  [projectId, req.user.id]
)
if (!member.length) return res.status(403).json({ message: 'Access denied' })
```

A user with a valid JWT for *Project A* cannot read or write data belonging to *Project B* if they are not a member.

**Role hierarchy enforcement**

Three roles exist — `owner`, `manager`, and `member` — each with escalating privileges enforced per route:

| Action | Required role |
|--------|--------------|
| Read project, tasks, members | Any member |
| Create / edit / delete tasks | Any member |
| Update project details | owner **or** manager |
| Invite / remove members | owner **or** manager |
| Change a member's role | owner only |
| Delete the project | owner only |

Managers cannot elevate themselves to owner and cannot remove the owner. Owners cannot remove themselves. These constraints are enforced in the controller logic, not just the UI.

**Comment ownership**

Users can only delete their own comments. The controller verifies `comment.user_id === req.user.id` before performing the deletion, preventing one user from wiping another's messages.

> **OWASP coverage:** A01 — Broken Access Control

---

### 3 · Input Validation & SQL Injection Prevention

**express-validator**

All auth routes use `express-validator` to validate and sanitize input before it reaches business logic:

```js
body('email').isEmail()
body('password').isLength({ min: 6 })
body('name').trim().notEmpty()
```

Validation errors are returned as structured `400` responses — invalid input never reaches the database layer.

**Parameterized queries**

Every database query in the application uses `mysql2`'s parameterized (`?`) placeholder syntax. User-supplied values are never interpolated into SQL strings:

```js
// ✅ Safe — value passed as parameter, never concatenated
db.query('SELECT * FROM users WHERE email = ?', [email])

// All INSERT, UPDATE, DELETE operations follow the same pattern
db.query(
  'INSERT INTO tasks (project_id, title, status, priority, ...) VALUES (?, ?, ?, ?, ...)',
  [projectId, title, status, priority, ...]
)
```

This eliminates the entire class of SQL injection vulnerabilities, regardless of what the input contains.

> **OWASP coverage:** A03 — Injection

---

### 4 · Rate Limiting — Brute-Force & Abuse Protection

Two separate rate limiters are applied using `express-rate-limit`:

```js
// General API — 100 requests per 15 minutes per IP
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
app.use('/api/', limiter)

// Auth endpoints — 10 requests per 15 minutes per IP
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })
app.use('/api/auth', authLimiter)
```

The tighter auth limit directly mitigates credential stuffing and brute-force login attacks. A bot attempting to enumerate passwords for a single account will be blocked after 10 attempts per 15-minute window. The server also sets `trust proxy` to ensure rate limiting works correctly behind reverse proxies and load balancers, using the real client IP rather than the proxy address.

> **OWASP coverage:** A07 — Identification and Authentication Failures

---

### 5 · HTTP Security Headers — Helmet

Helmet is applied globally and sets a suite of security-relevant HTTP response headers automatically:

| Header | Purpose |
|--------|---------|
| `Content-Security-Policy` | Restricts which origins can load scripts, styles, and frames |
| `X-Frame-Options: SAMEORIGIN` | Prevents clickjacking via iframe embedding |
| `X-Content-Type-Options: nosniff` | Blocks MIME-type sniffing attacks |
| `Strict-Transport-Security` | Enforces HTTPS connections (when served over TLS) |
| `X-DNS-Prefetch-Control` | Disables cross-origin DNS prefetching |
| `Referrer-Policy` | Controls referrer information sent to other origins |

```js
app.use(helmet())  // sets all of the above in one call
```

> **OWASP coverage:** A05 — Security Misconfiguration

---

### 6 · CORS — Strict Origin Allowlist

The CORS policy explicitly allows only known origins. Any request from an unlisted origin is rejected at the middleware level before reaching any route handler:

```js
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,   // e.g. https://app.yourcompany.com
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
```

The same allowlist is applied independently to the Socket.io server, so real-time connections from unlisted origins are also blocked. Adding `credentials: true` is intentional and safe because the allowed origins are explicitly named — not a wildcard.

> **OWASP coverage:** A05 — Security Misconfiguration

---

### 7 · Secure Invitation Tokens

Project invitations use `crypto.randomBytes(32)` to generate a 256-bit cryptographically random token — not a predictable ID or timestamp-based value:

```js
const token = crypto.randomBytes(32).toString('hex')  // 64-character hex string
const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)  // 24-hour window
```

Tokens are stored in the `invitations` table, enforced as `UNIQUE`, and expire after 24 hours. On acceptance, the token is immediately deleted from the database — making it single-use. An attacker cannot reuse a captured token, and cannot guess one by brute force.

> **OWASP coverage:** A02 — Cryptographic Failures, A07 — Identification and Authentication Failures

---

### 8 · Sensitive Data Exposure Prevention

The API is designed to return only what the client needs — no more.

- `/api/auth/me` returns `id, name, email, avatar_color, created_at` — the `password` column is never selected
- Login responses return `id, name, email, avatar_color` — no internal fields
- The JWT payload contains only `{ id }` — no roles, emails, or sensitive claims are embedded in the token

```js
// Explicit column selection — password is never included
SELECT id, name, email, avatar_color, created_at FROM users WHERE id = ?
```

Environment secrets (`JWT_SECRET`, database credentials, SMTP password) live in `.env`, which is excluded from version control via `.gitignore`.

> **OWASP coverage:** A02 — Cryptographic Failures

---

### 9 · Audit Trail — Activity Logging

Every significant action in the application is recorded in the `activity_logs` table with a timestamp, the acting user, the action description, and the affected entity:

```
Created project "Q4 Roadmap"
Created task "Fix auth bug"
Updated task "Fix auth bug"
Invited user@example.com to project
Changed member role to manager
Removed a member from project
```

Logs are immutable from the application layer — there is no delete endpoint for activity records. This provides a non-repudiation trail useful for incident response and forensic analysis.

> **OWASP coverage:** A09 — Security Logging and Monitoring Failures

---

### Security Summary — OWASP Top 10 Coverage

| # | Category | Controls in place |
|---|----------|-------------------|
| A01 | Broken Access Control | Server-side RBAC on every route, membership verification, ownership checks on comments |
| A02 | Cryptographic Failures | bcrypt (cost 10) for passwords, `crypto.randomBytes` for invite tokens, no sensitive data in JWT payload, selective column queries |
| A03 | Injection | Parameterized queries throughout, express-validator input sanitization |
| A04 | Insecure Design | Role hierarchy enforced server-side, single-use expiring invitation tokens, current-password required for changes |
| A05 | Security Misconfiguration | Helmet headers, explicit CORS allowlist, trust-proxy set correctly for rate limiting |
| A07 | Identification & Authentication Failures | JWT expiry + signature verification, bcrypt hashing, tiered rate limiting (10 req/15min on auth), 401 auto-logout on frontend |
| A09 | Security Logging & Monitoring | Immutable activity logs for all project and task actions |

---

## API Reference

### Auth
```
POST   /api/auth/register          Create account
POST   /api/auth/login             Sign in, receive JWT
GET    /api/auth/me                Get current user (protected)
PUT    /api/auth/profile           Update name & avatar color
PUT    /api/auth/change-password   Change password
```

### Projects
```
GET    /api/projects               List all projects for authenticated user
POST   /api/projects               Create a new project
GET    /api/projects/:id           Get project by ID
PUT    /api/projects/:id           Update project (owner/manager)
DELETE /api/projects/:id           Delete project (owner only)
GET    /api/projects/:id/stats     Get task statistics
GET    /api/projects/:id/logs      Get activity log (last 50 entries)
```

### Tasks
```
GET    /api/projects/:projectId/tasks              List all tasks
POST   /api/projects/:projectId/tasks              Create task
PUT    /api/projects/:projectId/tasks/:id          Update task
PATCH  /api/projects/:projectId/tasks/:id/status   Move task (status + position)
DELETE /api/projects/:projectId/tasks/:id          Delete task
```

### Comments
```
GET    /api/projects/:projectId/tasks/:id/comments      List comments
POST   /api/projects/:projectId/tasks/:id/comments      Add comment
DELETE /api/projects/:projectId/tasks/:id/comments/:cid Delete comment (own only)
```

### Members
```
GET    /api/projects/:projectId/members                  List members
POST   /api/projects/:projectId/members/invite           Send invite email
PUT    /api/projects/:projectId/members/:userId/role     Change role (owner only)
DELETE /api/projects/:projectId/members/:userId          Remove member
```

### Socket.io Events
```
Client → Server
  join-project   (projectId)    Subscribe to project room
  leave-project  (projectId)    Unsubscribe from project room

Server → Client
  task-created   { taskId }
  task-updated   { taskId }
  task-moved     { taskId, status, position }
  task-deleted   { taskId }
  comment-added  { taskId, commentId }
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+

### 1 — Database setup

Create a MySQL database and run the following schema:

```sql
CREATE TABLE users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  avatar_color VARCHAR(20),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  owner_id    INT NOT NULL,
  color       VARCHAR(20) DEFAULT '#7C5CFF',
  status      ENUM('active','archived') DEFAULT 'active',
  due_date    DATE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE project_members (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  user_id    INT NOT NULL,
  role       ENUM('owner','manager','member') DEFAULT 'member',
  joined_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_member (project_id, user_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
);

CREATE TABLE tasks (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  project_id  INT NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      ENUM('todo','in_progress','review','done') DEFAULT 'todo',
  priority    ENUM('low','medium','high','critical') DEFAULT 'medium',
  assignee_id INT,
  created_by  INT,
  due_date    DATE,
  position    INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id)  REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (assignee_id) REFERENCES users(id)    ON DELETE SET NULL,
  FOREIGN KEY (created_by)  REFERENCES users(id)    ON DELETE SET NULL
);

CREATE TABLE comments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  task_id    INT NOT NULL,
  user_id    INT NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id)  REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE activity_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  project_id  INT NOT NULL,
  user_id     INT NOT NULL,
  action      VARCHAR(255),
  entity_type VARCHAR(50),
  entity_id   INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
);

CREATE TABLE invitations (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  email      VARCHAR(150) NOT NULL,
  token      VARCHAR(255) UNIQUE NOT NULL,
  role       ENUM('manager','member') DEFAULT 'member',
  expires_at TIMESTAMP NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

### 2 — Backend

```bash
cd server
cp .env.example .env   # fill in your values
npm install
npm run dev            # starts on port 8080
```

**Environment variables:**

```env
PORT=8080
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=orbit

JWT_SECRET=your-super-secret-key-change-this

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=yoursmtppassword
```

### 3 — Frontend

```bash
cd client
npm install
npm run dev            # starts on http://localhost:5173
```

> The Vite dev server proxies `/api` and `/socket.io` to `localhost:8080` automatically.

---

## Roles & Permissions

| Action | Owner | Manager | Member |
|--------|:-----:|:-------:|:------:|
| View project & tasks | ✓ | ✓ | ✓ |
| Create / edit tasks | ✓ | ✓ | ✓ |
| Delete tasks | ✓ | ✓ | ✓ |
| Update project details | ✓ | ✓ | — |
| Invite members | ✓ | ✓ | — |
| Remove members | ✓ | ✓ | — |
| Change member roles | ✓ | — | — |
| Delete project | ✓ | — | — |

---

## Design Principles

Orbit follows a strict design system defined in [`DESIGN.md`](./DESIGN.md).

- **Elevation through brightness** — no drop shadows on dark backgrounds; surfaces get brighter as they stack higher
- **Typographic hierarchy** — three purpose-built fonts, weight and size create levels, not color
- **Density** — 13px base, 32px interactive elements, tight spacing that respects the screen
- **Restraint** — not every element gets a border, animation, or icon
- **Consistency** — same 8px button radius, 12px card radius, and spacing scale everywhere

---

## Scripts

```bash
# Frontend
npm run dev        # Development server (hot reload)
npm run build      # Production build → dist/
npm run preview    # Preview production build

# Backend
npm run dev        # Development server (nodemon)
npm start          # Production server
```

---

## License

MIT
