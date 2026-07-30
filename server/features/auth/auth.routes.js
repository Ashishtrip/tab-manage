import express from 'express';
import { register, login, refresh, logout, getMe } from './auth.controller.js';
import { requireAuth } from './auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

export default router;
