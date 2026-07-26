import express from 'express';
import cors from 'cors';
import tabsRouter from '../features/tabs/tabs.routes.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/tabs', tabsRouter);

export default app;
