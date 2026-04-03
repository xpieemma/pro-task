
# THANK YOU PER SCHOLAS 🙏

## 📘 Pro-Tasker

<div align="center">
  <h1>Pro‑Tasker</h1>
  <p><strong>Real‑time collaborative project management for modern teams</strong></p>
  <p>
    <a href="LIVE_DEPLOYMENT_URL"><img src="https://img.shields.io/badge/Live_Demo-View_Project-brightgreen?style=for-the-badge" alt="Live Demo" /></a>
    <a href="GITHUB_PROFILE_URL"><img src="https://img.shields.io/badge/GitHub-View_Code-181717?style=for-the-badge&logo=github" alt="GitHub" /></a>
    <a href="LINKEDIN_PROFILE_URL"><img src="https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin" alt="LinkedIn" /></a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/MERN-Stack-green" alt="MERN Stack" />
    <img src="https://img.shields.io/badge/TypeScript-5.3-blue" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-18+-61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Socket.IO-Real_time-orange" alt="Socket.IO" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC" alt="Tailwind CSS" />
  </p>
</div>

---

## ✨ Features

### Core Task Management
- 🔐 **JWT Authentication** – Secure login/register with bcrypt hashing
- 📁 **Project Management** – Create, update, delete projects (owner‑only)
- ✅ **Task Management** – Full CRUD with status (`To Do`, `In Progress`, `Done`) and optional due dates
- 👥 **Team Collaboration** – Invite collaborators by email; roles enforced on backend
- 📋 **Kanban Board** – Drag‑and‑drop tasks between columns using `@dnd-kit`
- 📅 **Calendar View** – Visualize tasks by due date; drag to reschedule; click empty slot to create task
- 📎 **File Attachments** – Secure Cloudinary integration with size limits and dynamic UI
- ⚡ **Optimistic UI** – Instant updates with automatic rollback on error
- 🔔 **Real‑time Sync** – All connected users see changes live via Socket.IO
- 📜 **Activity Feed** – Timestamped log of every action (create, update, status change, delete)
- 🔍 **Search & Filter** – Filter tasks by title, description, or status
- 🍞 **Toast Notifications** – Clear feedback for all user actions
- 📱 **Responsive Design** – Works seamlessly on mobile, tablet, and desktop

### 🎨 API Showcase (Public, No Login Required)
Pro‑Tasker includes a separate `/showcase` section with 8 creative tools that demonstrate real‑world API integrations:

| Tool | API | Description |
|------|-----|-------------|
| Poem Weaver | Pollinations.ai | Collaborative poem writing – user + AI take turns |
| Story Weaver | Pollinations.ai | You write first 3 lines → AI adds 1 sentence → you write ≥2 more |
| Weather Mood | Open‑Meteo | Live weather with mood messages & dynamic backgrounds |
| Infinite Inspiration | Unsplash | Search and browse high‑resolution images (free API key required) |
| Currency Explorer | ExchangeRate‑API | Real‑time rates, live converter, mood‑based spending insights |
| Developer Study Studio | Pollinations.ai | Paste notes → AI generates flashcards & discussion questions |
| Spotify Vibe | Spotify Web API | OAuth 2.0 – view your top tracks & artists of the month |
| Resume | GitHub API | Fetch and display your public repositories dynamically |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | Node.js, Express, TypeScript, MongoDB, Mongoose, Socket.IO, JWT, bcryptjs, Cloudinary, Multer |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Axios, Socket.IO‑client, @dnd‑kit, react‑big‑calendar, date‑fns, react‑hot‑toast |
| **Showcase APIs** | Pollinations.ai, Open‑Meteo, Unsplash, ExchangeRate‑API, Spotify Web API, GitHub API |
| **Deployment** | Render (Web Service + Static Site), Netlify, Vercel |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- Cloudinary account (for file uploads)

### 1. Clone the repository
```bash
git clone [https://github.com/yourusername/pro-tasker.git](https://github.com/yourusername/pro-tasker.git)
cd pro-tasker
```

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/pro-tasker
JWT_SECRET=your_super_secret_key_here
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

```text
Start the backend:
```bash
npm run dev
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env 
npm run dev
```

---

## 🤝 Contributing & License

Contributions are welcome! Please open an issue or submit a pull request.

```markdown
> 
```

---

```markdown
> **Execution Standard:** Enterprise-grade deployment readiness. 
> Below are 7 deeply hidden bugs that survived standard testing, along with their immediate solutions. Implement these prior to production release to ensure data integrity and system resilience.

## 🚨 1. Database Leak: Orphaned Records on Project Deletion
**The Problem:** When a project is deleted in `backend/src/controllers/projectController.ts`, you call `await project.deleteOne()`. However, Mongoose does not natively cascade deletes unless configured. The `Tasks` and `Activities` associated with that project remain in the database forever, consuming storage and potentially leaking data context.
**The Fix:** Manually cascade deletes before removing the project.
```typescript
// backend/src/controllers/projectController.ts (deleteProject)
import { Task } from '../models/Task.js';
import { Activity } from '../models/Activity.js';

export const deleteProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project || project.owner.toString() !== req.user!._id.toString()) {
    res.status(404);
    throw new Error('Project not found or unauthorized');
  }
  
  // ✅ Clean up related documents first
  await Task.deleteMany({ project: project._id });
  await Activity.deleteMany({ project: project._id });
  
  await project.deleteOne();
  const io = req.app.get('io');
  io.emit('project-deleted', { id: req.params.id });
  res.json({ message: 'Project removed' });
});
```

## 💥 2. API Crash: Unhandled `CastError` on Invalid ObjectIds

**The Problem:** In multiple controllers (e.g., `getProjectById`), `req.params.id` is passed directly into `findById()`. If a user tampers with the URL and provides a string that is not a 24-character hex string, Mongoose throws a fatal `CastError` that bypasses your standard `!project` null check.
**The Fix:** Validate the ObjectId format before querying.

```typescript
// backend/src/controllers/projectController.ts
import mongoose from 'mongoose';

export const getProjectById = asyncHandler(async (req: AuthRequest, res: Response) => {
  // ✅ Validate ID format
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid project ID format');
  }
  
  const project = await Project.findById(req.params.id) // ... rest of code
```

## 🔥 3. Frontend Crash: Deleted User Reference in Activity Feed

**The Problem:** In `frontend/src/components/ActivityFeed.tsx`, you map over activities and render `activity.user.name`. If a user is deleted from the platform, their ID remains in the Activity document, but `.populate('user')` on the backend will return `null`. Attempting to read `name` of `null` will completely crash the React tree.
**The Fix:** Add optional chaining to the user reference.

```tsx
// frontend/src/components/ActivityFeed.tsx
<span className="font-medium">{activity.user?.name || 'Deleted User'}</span>{' '}
```

## 🕸️ 4. CORS Failure: Trailing Slash Rejection in Production

**The Problem:** In `backend/src/server.ts`, your CORS array strictly matches `process.env.FRONTEND_URL`. If the deployment environment (e.g., Vercel, Netlify) automatically appends a trailing slash (e.g., `https://myapp.com/`), the exact match fails and CORS blocks the entire frontend.
**The Fix:** Sanitize the environment variable dynamically.

```typescript
// backend/src/server.ts
const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, ''); // ✅ Strip trailing slash
const allowedOrigins = [frontendUrl, 'http://localhost:5173']
  .filter((url): url is string => Boolean(url));
```

## ⚠️ 5. Data Corruption: Optimistic UI Desync on Temp Task Drag

**The Problem:** When `addTask` is called in `ProjectDetail.tsx`, it creates a task with a `_id` like `temp-1715000000`. If a user instantly drags this task on the Kanban board before the backend responds, `onUpdate` attempts a PUT request to `/projects/:id/tasks/temp-1715000000`. The backend throws a 400 error, the optimistic update rolls back, and the UI state breaks.
**The Fix:** Disable dragging for temporary tasks in the `TaskCard` component.

```tsx
// frontend/src/components/TaskCard.tsx
const isTemp = task._id.startsWith('temp-');
const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ 
  id: task._id,
  disabled: isTemp // ✅ Disable drag while syncing
});

return (
  <div 
    ref={setNodeRef} 
    style={style} 
    {...attributes} 
    {...listeners} 
    className={`bg-white p-3 rounded shadow mb-2 ${isTemp ? 'opacity-50 cursor-wait' : 'cursor-grab'}`}
  >
```

## 🛡️ 6. Data Duplication: Form Double-Submission Spam

**The Problem:** The `addTask` form in `ProjectDetail.tsx` lacks submission state control. A user clicking "Create Task" multiple times rapidly, or a double-firing keypress, will dispatch multiple API requests, flooding the database with duplicate tasks.
**The Fix:** Manage form submission state locally.

```tsx
// frontend/src/pages/ProjectDetail.tsx (Inside Add Task Form)
const [isSubmittingTask, setIsSubmittingTask] = useState(false);

<form onSubmit={async (e) => {
  e.preventDefault();
  if (isSubmittingTask) return; // ✅ Guard clause
  
  setIsSubmittingTask(true);
  const form = e.target as HTMLFormElement;
  const title = (form.elements.namedItem('title') as HTMLInputElement).value;
  const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
  
  await addTask({ title, description }); // Ensure addTask is awaited
  form.reset();
  setIsSubmittingTask(false);
}}>
  <button disabled={isSubmittingTask} type="submit" className="...">
    {isSubmittingTask ? 'Creating...' : 'Create Task'}
  </button>
</form>
```

## ⚙️ 7. Runtime Crash: Missing Environment Variable Validation

**The Problem:** `connectDB` and `jwt.verify` rely on `process.env.MONGO_URI!` and `process.env.JWT_SECRET!`. The TypeScript `!` operator suppresses compile-time warnings, but if a DevOps mistake forgets to set these on the server, the app boots up fine but crashes ungracefully the moment someone tries to log in or query the DB.
**The Fix:** Implement a startup guard in `server.ts`.

```typescript
// backend/src/server.ts (Add right after dotenv.config())
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME'];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`FATAL ERROR: Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});
```


## 🙏 Acknowledgements

Pollinations.ai – free AI text & image generation

Open‑Meteo – free weather API

Unsplash – beautiful high‑resolution photos

ExchangeRate‑API – free real‑time exchange rates

Spotify Web API – music data & OAuth

GitHub REST API – repository data

<div align="center"> <sub>Built with ❤️ as a full‑stack capstone project</sub> </div>

```
```

```
```