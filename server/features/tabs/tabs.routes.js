import { Router } from 'express';
import { handleShowTree, handleGetStats } from './tabs.controller.js';
import { requireAuth } from '../auth/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.get('/tree', handleShowTree);
router.get('/stats', handleGetStats);

export default router;
