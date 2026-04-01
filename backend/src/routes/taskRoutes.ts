import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getActivity,
} from '../controllers/taskController.js';

const router = Router({ mergeParams: true });
router.use(protect);
router.route('/').get(getTasks).post(createTask);
router.get('/activity', getActivity);                         // MUST be before /:taskId
router.route('/:taskId').put(updateTask).delete(deleteTask);
export default router;
