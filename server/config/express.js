import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from '../features/auth/auth.routes.js';
import tabsRouter from '../features/tabs/tabs.routes.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use('/api/auth', authRouter);
app.use('/api/tabs', tabsRouter);

export default app;
