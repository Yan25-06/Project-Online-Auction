import type { Request, Response, NextFunction } from 'express';

export function requireFields(...fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const f of fields) {
      if (req.body[f] === undefined || req.body[f] === null) {
        return res.status(400).json({ error: `${f} is required` });
      }
    }
    next();
  };
}
