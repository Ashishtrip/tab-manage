import { Router } from 'express';
import { handleTabCreated, handleTabRemoved, handleTabUpdated, handleShowTree, handleGetAll } from './tabs.controller.js';

const router = Router();
router.post('/', handleTabCreated);
router.delete('/:id', handleTabRemoved);
router.patch('/:id', handleTabUpdated);
router.get('/tree', handleShowTree);
router.post('/all', handleGetAll);

export default router;
