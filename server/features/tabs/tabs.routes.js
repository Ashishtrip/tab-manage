import { Router } from 'express';
import { handleShowTree } from './tabs.controller.js';
import { requireAuth } from '../auth/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.get('/tree', handleShowTree);

export default router;
