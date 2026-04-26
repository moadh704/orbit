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
</p>

<br/>

</div>

---

## What is Orbit?

Orbit is a full-stack team project management platform designed to feel like a **$50M SaaS product**. It draws inspiration from Linear, Vercel, and Raycast — prioritizing density, restraint, and intentional design over visual noise.

Manage projects with kanban boards, track tasks across statuses, collaborate with your team in real time, and keep everyone aligned with activity feeds and role-based permissions.

---

## Features

### Core
- **Kanban boards** — drag-and-drop tasks across Todo → In Progress → Review → Done
- **Real-time collaboration** — Socket.io pushes task moves, creates, and deletes to all connected users instantly
- **Task detail panel** — inline editing, priority, assignee, due dates, and threaded comments
- **Project management** — color-coded projects with progress tracking, status, and due dates
- **Team members** — role-based access (Owner / Manager / Member), email invitations, role changes

### Auth & Security
- JWT authentication with 7-day tokens
- bcrypt password hashing
- Protected routes (frontend + backend)
- Rate limiting on all API endpoints (stricter on auth)
- Helmet security headers

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
│   │   │   ├── axios.js        # API client with auth interceptors
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
    ├── middleware/             # JWT auth middleware
    ├── routes/                 # authRoutes, projectRoutes,
    │                           # taskRoutes, memberRoutes
    ├── db/                     # MySQL connection pool
    └── utils/                  # sendEmail
```

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
DELETE /api/projects/:projectId/tasks/:id/comments/:cid Delete comment
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
