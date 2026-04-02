import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { Project } from '../models/Project.js';

export interface AuthRequest extends Request {
  user?: IUser;
  project?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    req.user = await User.findById(decoded.id).select('-password');
    if(!req.user) {
      res.status(401).json({ message: 'Not authorized, user not found' });
      return;
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const checkProjectAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized, user not found' });
    return;
  }
  try {
    const projectId = req.params.id || req.params.projectId;
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    const isOwner = project.owner.toString() === req.user!._id.toString();
    const isCollaborator = project.collaborators.some(
      (id) => id.toString() === req.user!._id.toString()
    );
    if (!isOwner && !isCollaborator) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
