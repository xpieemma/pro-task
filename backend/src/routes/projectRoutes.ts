import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  inviteCollaborator,
} from '../controllers/projectController.js';

const router = Router();
router.use(protect);
router.route('/').get(getProjects).post(createProject);
router.route('/:id').get(getProjectById).put(updateProject).delete(deleteProject);
router.post('/:id/invite', inviteCollaborator);
export default router;
