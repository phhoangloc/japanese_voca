import express, { Request, Response } from 'express';
import { corsMiddleware } from './middleware/cors.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import api from './routes';
import { UPLOAD_DIR, UPLOAD_URL_PREFIX } from './ult/upload';

export const app = express();

app.use(corsMiddleware);
// JSON bodies now only carry small metadata; uploads come in as multipart and
// are handled by multer, not this parser. 1mb is plenty of headroom.
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

// Serve uploaded files straight from disk (`backend/public/upload`). A missing
// file falls through to the JSON 404 handler below.
app.use(UPLOAD_URL_PREFIX, express.static(UPLOAD_DIR, { index: false }));

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', api);

// Unknown route -> 404 in the standard error shape.
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorMiddleware);
