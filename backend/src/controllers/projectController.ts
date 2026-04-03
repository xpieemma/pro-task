import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/auth.js';
import { Project} from '../models/Project.js';
import { User } from '../models/User.js';
import { Activity } from '../models/Activity.js';


type PopulatedUser = {
  _id: string;
  name: string;
  email: string;
};

type PopulatedProject = {
  _id: string;
  name: string;
  owner: PopulatedUser;
  collaborators: PopulatedUser[];
};



export const getProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
  const projects = await Project.find({
    $or: [{ owner: req.user!._id }, { collaborators: req.user!._id }],
  })
  .populate('owner', 'name email _id')
  .populate('collaborators', 'name email _id')
  .lean() as unknown as PopulatedProject[];
  res.json(projects);   
});

export const getProjectById = asyncHandler(async (req: AuthRequest, res: Response) => {
const project = await Project.findById(req.params.id)
  .populate("owner", "name email")
  .populate("collaborators", "name email")
  .lean() as unknown as PopulatedProject | null;
  if (!project) {
    res.status(404).json({ message: 'Project not found' });
    return;
  }
  // const isOwner = (project.owner as any)._id.toString() === req.user!._id.toString();
  // const isCollaborator = (project.collaborators as any[]).some(
  //   (c) => c._id.toString() === req.user!._id.toString()
  // );
  const userId = req.user!._id.toString();

const isOwner = project.owner._id.toString() === userId;
const isCollaborator = project.collaborators.some(c => c._id.toString() === userId);

  if (!isOwner && !isCollaborator) {
    res.status(403).json({ message: 'Not authorized' });
    return;
  }
  res.json(project);
});

export const createProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  
  if (!name || name.trim() === '') {
    res.status(400).json({ message: 'Project Name is required' });
    return;
  }
  
  const project = await Project.create({
    name,
    description,
    owner: req.user!._id,
  });
  const io = req.app.get('io');
  io.emit('project-created', project);
  res.status(201).json(project);
});

export const updateProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project || project.owner.toString() !== req.user!._id.toString()) {
    res.status(404).json({ message: 'Project not found or unauthorized' });
    return;
  }
  project.name = req.body.name || project.name;
  if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
    project.description = req.body.description;
  }
  const updated = await project.save();
  const io = req.app.get('io');
  io.emit('project-updated', updated);
  res.json(updated);
});

export const deleteProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project || project.owner.toString() !== req.user!._id.toString()) {
    res.status(404).json({ message: 'Project not found or unauthorized' });
    return;
  }
  await project.deleteOne();
  const io = req.app.get('io');
  io.emit('project-deleted', { id: req.params.id });
  res.json({ message: 'Project removed' });
});

export const inviteCollaborator = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project || project.owner.toString() !== req.user!._id.toString()) {
    res.status(403).json({ message: 'Not authorized' });
    return;
  }
  const { email } = req.body;
  const userToInvite = await User.findOne({ email });
  if (!userToInvite) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  const alreadyCollaborator = project.collaborators.some(
    (id) => id.toString() === userToInvite._id.toString()
  );
  if (!alreadyCollaborator) {
    project.collaborators.push(userToInvite._id as any);
    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user!._id,
      action: 'added collaborator',
      details: `Added ${userToInvite.name} as a collaborator`,
    });

    const io = req.app.get('io');
    io.to(`project:${project._id}`).emit('collaborator-added', {
      projectId: project._id,
      user: {
        _id: userToInvite._id,
        name: userToInvite.name,
        email: userToInvite.email,
      },
    });
  }
  res.json({ message: 'Collaborator added' });
});
