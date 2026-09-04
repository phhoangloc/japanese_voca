import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import adminRoutes from './admin.routes';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import fileRoutes from './file.routes';

const api = Router();

// Public
api.use('/auth', authRoutes);

// Protected: everything below requires a valid Bearer token.
api.use('/admins', authMiddleware, adminRoutes);
api.use('/customers', authMiddleware, customerRoutes);
api.use('/files', authMiddleware, fileRoutes);

export default api;
