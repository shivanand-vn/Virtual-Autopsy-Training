import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    const formatted = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(res, 'Validation failed', 422, formatted);
    return;
  }

  // Multer errors (file size / type)
  if (err.name === 'MulterError') {
    sendError(res, `File upload error: ${err.message}`, 400);
    return;
  }

  console.error('Unhandled server error:', err);

  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  sendError(res, message, 500, env.NODE_ENV === 'development' ? err.stack : undefined);
}
