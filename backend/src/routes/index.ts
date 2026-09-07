import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import adminRoutes from './admin.routes';
import authRoutes from './auth.routes';
import chapterRoutes from './chapter.routes';
import courseRoutes from './course.routes';
import customerRoutes from './customer.routes';
import fileRoutes from './file.routes';
import wordRoutes from './word.routes';

const api = Router();

// Public
api.use('/auth', authRoutes);

// Protected: every route requires a valid Bearer token.
api.use('/admins', authMiddleware, adminRoutes);
api.use('/customers', authMiddleware, customerRoutes);

// Mixed: GET is public (consumed by the login-less `home` site); the mutating
// verbs carry `authMiddleware` inside the router.
api.use('/files', fileRoutes);
api.use('/courses', courseRoutes);
api.use('/chapters', chapterRoutes);
api.use('/words', wordRoutes);

export default api;
