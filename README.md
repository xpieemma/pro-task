# Pro-Tasker

A production-ready full-stack project management app built with the MERN stack (MongoDB, Express, React, Node.js). Features real-time collaboration via Socket.IO, a Kanban drag-and-drop board, a calendar view with draggable due dates, optimistic UI updates, and a live activity feed.

---

## Features

- **JWT Authentication** — Register and login with bcrypt-hashed passwords
- **Multi-user collaboration** — Invite teammates by email; owner/collaborator roles enforced on both frontend and backend
- **Kanban board** — Drag tasks between To Do, In Progress, and Done columns using `@dnd-kit`
- **Calendar view** — Visualize tasks by due date; drag events to reschedule, click a slot to create a task
- **Optimistic UI** — Changes appear instantly and roll back cleanly on failure
- **Real-time sync** — All connected users see task and project changes live via Socket.IO
- **Activity feed** — Timestamped log of every create, update, status change, and delete
- **Search & filter** — Filter tasks by title, description, or status
- **Toast notifications** — Clear feedback on every action
- **Responsive design** — Works on mobile, tablet, and desktop

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Node.js, Express, TypeScript, MongoDB, Mongoose, Socket.IO, JWT, bcryptjs, express-async-handler |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Axios, Socket.IO-client, @dnd-kit, react-big-calendar, date-fns, react-hot-toast |

---

## Project Structure

```text
pro-tasker/
├── backend/
│   ├── src/
│   │   ├── config/db.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── projectController.ts
│   │   │   └── taskController.ts
│   │   ├── middleware/auth.ts
│   │   ├── models/
│   │   │   ├── Activity.ts
│   │   │   ├── Project.ts
│   │   │   ├── Task.ts
│   │   │   └── User.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── projectRoutes.ts
│   │   │   └── taskRoutes.ts
│   │   ├── utils/generateToken.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── nodemon.json
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ActivityFeed.tsx
    │   │   ├── CalendarView.tsx
    │   │   ├── KanbanBoard.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   ├── ProjectCard.tsx
    │   │   ├── ProtectedRoute.tsx
    │   │   ├── SearchFilter.tsx
    │   │   └── TaskCard.tsx
    │   ├── context/AuthContext.tsx
    │   ├── pages/
    │   │   ├── Dashboard.tsx
    │   │   ├── Login.tsx
    │   │   ├── ProjectDetail.tsx
    │   │   └── Register.tsx
    │   ├── services/
    │   │   ├── api.ts
    │   │   └── socket.ts
    │   ├── types/index.ts
    │   ├── App.tsx
    │   ├── index.css
    │   └── main.tsx
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (free tier works) or local MongoDB

### 1. Clone

```bash
git clone https://github.com/xpieemma/pro-task.git
cd pro-tasker
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values (see Environment Variables below)
npm run dev
```

Server starts on `http://localhost:5000`.

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
# .env already points to localhost:5000 — no changes needed for local dev
npm run dev
```

App opens at `http://localhost:5173`.

---

## Environment Variables

### `backend/.env`

```text
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/pro-tasker
JWT_SECRET=replace_with_a_long_random_string
FRONTEND_URL=http://localhost:5173
```

`JWT_SECRET` should be a long random string. You can generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### `frontend/.env`

```text
VITE_API_URL=http://localhost:5000/api
```

---

## API Reference

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` | Register new user |
| POST | `/api/auth/login` | `{ email, password }` | Login, returns JWT |

### Projects _(all require `Authorization: Bearer <token>`)_

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects` | Get all projects for current user |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project with collaborators populated |
| PUT | `/api/projects/:id` | Update project (owner only) |
| DELETE | `/api/projects/:id` | Delete project (owner only) |
| POST | `/api/projects/:id/invite` | Invite collaborator by email (owner only) |

### Tasks _(all require auth + project access)_

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects/:projectId/tasks` | Get all tasks for project |
| POST | `/api/projects/:projectId/tasks` | Create task |
| PUT | `/api/projects/:projectId/tasks/:taskId` | Update task (title, description, status, dueDate) |
| DELETE | `/api/projects/:projectId/tasks/:taskId` | Delete task |
| GET | `/api/projects/:projectId/tasks/activity` | Get last 50 activity entries |

---

## Socket.IO Events

| Event | Direction | Payload | When |
|---|---|---|---|
| `join-project` | Client → Server | `projectId` | On entering project detail page |
| `leave-project` | Client → Server | `projectId` | On leaving project detail page |
| `task-created` | Server → Client | `Task` | Task created |
| `task-updated` | Server → Client | `Task` | Task updated |
| `task-deleted` | Server → Client | `{ taskId, projectId }` | Task deleted |
| `project-created` | Server → Client (all) | `Project` | Project created |
| `project-updated` | Server → Client (all) | `Project` | Project updated |
| `project-deleted` | Server → Client (all) | `{ id }` | Project deleted |
| `collaborator-added` | Server → Client (room) | `{ projectId, user }` | Collaborator invited |
| `activity-updated` | Server → Client (room) | — | Any activity logged; triggers feed refresh |

---

## Deployment

### Backend — Render Web Service

1. Connect your GitHub repo in Render
2. Set **Root Directory** to `backend`
3. **Build command:** `npm install && npm run build`
4. **Start command:** `npm start`
5. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL` (your Render/Netlify frontend URL)

### Frontend — Render Static Site / Netlify / Vercel

1. Set **Root Directory** to `frontend`
2. **Build command:** `npm install && npm run build`
3. **Publish directory:** `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

> **Note:** On Render free tier, the backend spins down after inactivity. First request after sleep takes ~30 seconds. Upgrade to a paid plan or use a keep-alive cron job for a snappier demo.

---

## Known Limitations & Future Work

- **No refresh tokens** — JWTs expire after 30 days with no server-side revocation. Suitable for portfolio use; a production app would add a refresh token flow.
- **No file attachments** — Task cards support title, description, status, and due date only.
- **No email notifications** — Invites are immediate but silent outside the app.
- **Calendar requires due dates** — Tasks without a `dueDate` don't appear on the calendar view.

Potential next steps: file uploads (S3), email notifications (Resend/SendGrid), AI task suggestions, per-task comments, priority levels.

---

## License

MIT
