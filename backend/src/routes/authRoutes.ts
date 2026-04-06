import { Router } from 'express';
import { registerUser, loginUser, githubLogin } from '../controllers/authController.js';

const router = Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/github', githubLogin);
export default router;
