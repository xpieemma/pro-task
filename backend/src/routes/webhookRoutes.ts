import { Router } from 'express';
import { handleGithubPush } from '../controllers/webhookController.js';

const router = Router();

// Endpoint: POST /api/webhooks/github
router.post('/github', handleGithubPush);

export default router;