import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/auth.js';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { Activity } from '../models/Activity.js';
import mongoose from 'mongoose';

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
    res.status(403);
    throw new Error ( 'Not authorized' );
  }
  const tasks = await Task.find({ project: projectId }).sort({ createdAt: -1 });
  res.json(tasks);
});

export const createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params;
  if (!(await canAccessProject(projectId, req.user!._id.toString()))) {
    res.status(403);
    throw new Error('Not authorized');
  }
  const { title, description, status, dueDate } = req.body;

  if (!title || title.trim() === '') {
    res.status(400).json({ message: 'Title is required' });
    return;
  }

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

export const addAttachment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params;
  const task = await Task.findById(taskId);
  
  if (!task || !(await canAccessProject(task.project.toString(), req.user!._id.toString()))) {
    res.status(404).json({ message: 'Task not found or unauthorized' });
    return;
  }
  
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  const newAttachment = {
    name: req.file.originalname,
    url: req.file.path,
    public_id: req.file.filename,
    size: req.file.size,
    mimeType: req.file.mimetype,
  };

  task.attachments?.push(newAttachment);
  await task.save();

 
  const io = req.app.get('io');
  io.to(`project:${task.project}`).emit('task-updated', task);
  
  res.status(201).json(task);
});

export const deleteAttachment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { taskId, attachmentId } = req.params;
  const task = await Task.findById(taskId);
  
  if (!task || !(await canAccessProject(task.project.toString(), req.user!._id.toString()))) {
    res.status(404).json({ message: 'Task not found or unauthorized' });
    return;
  }

  task.attachments = task.attachments?.filter((att: any) => att._id.toString() !== attachmentId);
  await task.save();

  const io = req.app.get('io');
  io.to(`project:${task.project}`).emit('task-updated', task);
  
  res.json(task);
});


export const getProjectAnalytics = asyncHandler(async (req: any, res: Response) => {
  const { projectId } = req.params;
  
  if (!(await canAccessProject(projectId, req.user._id.toString()))) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const projectIdObj = new mongoose.Types.ObjectId(projectId);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // The Recruiter Flex: A multi-faceted aggregation pipeline
  const analytics = await Task.aggregate([
    { $match: { project: projectIdObj } },
    {
      $facet: {
        // 1. Group by Status
        taskStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        // 2. Calculate Overdue Tasks
        overdueTasks: [
          { $match: { dueDate: { $lt: new Date() }, status: { $ne: 'Done' } } },
          { $count: 'total' }
        ],
        // 3. Velocity: Tasks completed per day over the last 7 days
        completionVelocity: [
          { $match: { status: 'Done', updatedAt: { $gte: sevenDaysAgo } } },
          { 
            $group: { 
              _id: { $dateToString: { format: '%m/%d', date: '$updatedAt' } }, 
              completed: { $sum: 1 } 
            } 
          },
          { $sort: { _id: 1 } }
        ]
      }
    }
  ]);

  // Format the raw MongoDB data for the frontend charts
  const rawData = analytics[0];
  
  const statusData = [
    { name: 'To Do', value: rawData.taskStatus.find((s: any) => s._id === 'To Do')?.count || 0 },
    { name: 'In Progress', value: rawData.taskStatus.find((s: any) => s._id === 'In Progress')?.count || 0 },
    { name: 'Done', value: rawData.taskStatus.find((s: any) => s._id === 'Done')?.count || 0 },
  ];

  const totalTasks = statusData.reduce((acc, curr) => acc + curr.value, 0);
  const overdueCount = rawData.overdueTasks[0]?.total || 0;

  res.json({
    totalTasks,
    overdueCount,
    statusData,
    velocityData: rawData.completionVelocity.map((v: any) => ({ date: v._id, completed: v.completed }))
  });
});