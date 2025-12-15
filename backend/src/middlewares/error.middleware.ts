import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Minimal error handler that returns JSON error messages
  console.error(err);
  const status = err?.status || 500;
  const message = err?.message || 'Internal Server Error';
  res.status(status).json({ error: message });
}
