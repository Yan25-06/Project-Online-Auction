import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import { supabase } from '../config/supabase.js';

// Attach authenticated user to `req.user` by validating Supabase JWT (Bearer token)
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Require Authorization: Bearer <access_token>
    const auth = req.header('authorization');
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

    const token = auth.split(' ')[1];

    // Validate the access token with Supabase and get user info
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Unauthorized' });

    const user = await UserService.findById(data.user.id);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    (req as any).user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    // Only accept Bearer tokens; if not present, continue unauthenticated
    const auth = req.header('authorization');
    if (!auth || !auth.startsWith('Bearer ')) return next();
    const token = auth.split(' ')[1];

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return next();

    (req as any).user = { id: data.user.id };
    return next();
  } catch (err) {
    return next();
  }
}

export function requireRole(role: string | string[]) {
  const roles = Array.isArray(role) ? role : [role];
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
