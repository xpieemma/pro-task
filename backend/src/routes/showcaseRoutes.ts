import { Router } from 'express';
import { 
  generateStory, 
  generatePoem, 
  generatePoemHint, 
  generateJsonData, 
  searchGallery 
} from '../controllers/showcaseController.js';

const router = Router();

// Public routes for the recruiter showcase
router.post('/story', generateStory);
router.post('/poem', generatePoem);
router.post('/poem/hint', generatePoemHint);
router.post('/generate-json', generateJsonData);
router.get('/gallery', searchGallery);

export default router;