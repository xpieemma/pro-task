import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/auth.js';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { Activity } from '../models/Activity.js';

const canAccessProject = async (projectId: string, userId: string): Promise<boolean> => {
  const project = await Project.findById(projectId);
  if (!project) return false;
  return (
    project.owner.toString() === userId ||
    project.collaborators.some((id) => id.toString() === userId)
  );
};

export const getTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params;
  if (!(await canAccessProject(projectId, req.user!._id.toString()))) {
    res.status(403).json({ message: 'Not authorized' });
    return;
  }
  const tasks = await Task.find({ project: projectId });
  res.json(tasks);
});

export const createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params;
  if (!(await canAccessProject(projectId, req.user!._id.toString()))) {
    res.status(403).json({ message: 'Not authorized' });
    return;
  }
  const { title, description, status, dueDate } = req.body;
  const task = await Task.create({
    title,
    description,
    status,
    dueDate: dueDate || null,
    project: projectId,
  });

  await Activity.create({
    project: projectId,
    user: req.user!._id,
    action: 'created task',
    details: `Created task "${title}"`,
  });

  const io = req.app.get('io');
  io.to(`project:${projectId}`).emit('task-created', task);
  io.to(`project:${projectId}`).emit('activity-updated');
  res.status(201).json(task);
});

export const updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.taskId).populate('project');
  if (!task) {
    res.status(404).json({ message: 'Task not found' });
    return;
  }
  const project = task.project as any;
  if (!(await canAccessProject(project._id.toString(), req.user!._id.toString()))) {
    res.status(403).json({ message: 'Not authorized' });
    return;
  }

  task.title = req.body.title || task.title;
  if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
    task.description = req.body.description;
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'dueDate')) {
    task.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
  }

  const oldStatus = task.status;
  task.status = req.body.status || task.status;
  const updated = await task.save();

  // Log the most specific activity
  if (oldStatus !== task.status) {
    await Activity.create({
      project: project._id,
      user: req.user!._id,
      action: 'changed status',
      details: `Changed "${task.title}" from ${oldStatus} to ${task.status}`,
    });
  } else if (Object.prototype.hasOwnProperty.call(req.body, 'dueDate')) {
    await Activity.create({
      project: project._id,
      user: req.user!._id,
      action: 'changed due date',
      details: `Updated due date for "${task.title}"`,
    });
  } else {
    await Activity.create({
      project: project._id,
      user: req.user!._id,
      action: 'updated task',
      details: `Updated task "${task.title}"`,
    });
  }

  const io = req.app.get('io');
  io.to(`project:${project._id.toString()}`).emit('task-updated', updated);
  io.to(`project:${project._id.toString()}`).emit('activity-updated');
  res.json(updated);
});

export const deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.taskId).populate('project');
  if (!task) {
    res.status(404).json({ message: 'Task not found' });
    return;
  }
  const project = task.project as any;
  if (!(await canAccessProject(project._id.toString(), req.user!._id.toString()))) {
    res.status(403).json({ message: 'Not authorized' });
    return;
  }
  const projectId = project._id.toString();
  const taskTitle = task.title;
  await task.deleteOne();

  await Activity.create({
    project: projectId,
    user: req.user!._id,
    action: 'deleted task',
    details: `Deleted task "${taskTitle}"`,
  });

  const io = req.app.get('io');
  io.to(`project:${projectId}`).emit('task-deleted', { taskId: req.params.taskId, projectId });
  io.to(`project:${projectId}`).emit('activity-updated');
  res.json({ message: 'Task removed' });
});

export const getActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params;
  if (!(await canAccessProject(projectId, req.user!._id.toString()))) {
    res.status(403).json({ message: 'Not authorized' });
    return;
  }
  const activities = await Activity.find({ project: projectId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(activities);
});
