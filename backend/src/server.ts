import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { User } from './models/User.js';
import { Project } from './models/Project.js';
import { Task } from './models/Task.js';
import bcrypt from 'bcryptjs';


connectDB();

const seedDemoData = async () => {
  const demoEmail = 'demo@example.com';
  let demoUser = await User.findOne({ email: demoEmail });
  if (!demoUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('demodemo', salt);
    demoUser = await User.create({
      name: 'Demo User',
      email: demoEmail,
      password: hashedPassword,
    });
    console.log('Demo user created');
  }


  const demoProject = await Project.findOne({ owner: demoUser._id, name: 'Demo Project' });
  if (!demoProject) {
    const project = await Project.create({
      name: 'Demo Project',
      description: 'Try the Kanban board, calendar, and real‑time updates!',
      owner: demoUser._id,
    });

    
    await Task.create([
      {
        title: 'Explore Kanban board',
        description: 'Drag me between columns',
        status: 'To Do',
        project: project._id,
      },
      {
        title: 'Check Calendar view',
        description: 'Click the Calendar tab',
        status: 'In Progress',
        project: project._id,
      },
      {
        title: 'Invite a collaborator',
        description: 'Enter a friend’s email',
        status: 'Done',
        project: project._id,
      },
    ]);
    console.log('Demo project created');
  }
};

seedDemoData().catch(console.error);

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173']
  .filter((url): url is string => Boolean(url));

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, credentials: true },
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const { User } = await import('./models/User.js');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('User not found'));
    socket.data.user = user;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`User ${socket.data.user.email} connected`);
  socket.on('join-project', (projectId: string) => socket.join(`project:${projectId}`));
  socket.on('leave-project', (projectId: string) => socket.leave(`project:${projectId}`));
  socket.on('disconnect', () => console.log(`User ${socket.data.user.email} disconnected`));
});

app.set('io', io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
