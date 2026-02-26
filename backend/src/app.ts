import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import promotionRoutes from './routes/promotionRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { me } from './controllers/authController.js';

dotenv.config();
const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '2mb' }));
app.use(cookieParser());
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/me', me);
app.use('/api/auth', authRoutes);
app.use('/api', menuRoutes);
app.use('/api', orderRoutes);
app.use('/api', addressRoutes);
app.use('/api', promotionRoutes);
app.use('/api', settingsRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});
export default app;