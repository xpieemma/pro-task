import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {upload} from '../config/cloudinary.js';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getActivity,
  addAttachment,
  deleteAttachment,
  getProjectAnalytics,
} from '../controllers/taskController.js';

const router = Router({ mergeParams: true });
router.use(protect);
router.route('/').get(getTasks).post(createTask);
router.get('/activity', getActivity);  
router.get('/analytics', getProjectAnalytics);// MUST be before /:taskId
router.route('/:taskId').put(updateTask).delete(deleteTask);

router.post('/:taskId/attachments', upload.single('file'), addAttachment);
router.delete('/:taskId/attachments/:attachmentId', deleteAttachment);
export default router;
