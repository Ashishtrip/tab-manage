import { Router } from 'express';
import { handleShowTree } from './tabs.controller.js';

const router = Router();
router.get('/tree', handleShowTree);

export default router;
