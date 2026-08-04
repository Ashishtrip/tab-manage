import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from '../features/auth/auth.routes.js';
import tabsRouter from '../features/tabs/tabs.routes.js';
import clustersRouter from '../features/clusters/clusters.routes.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use('/api/auth', authRouter);
app.use('/api/tabs', tabsRouter);
app.use('/api/clusters', clustersRouter);

export default app;
