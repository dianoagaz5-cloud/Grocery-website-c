import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Express middleware factory that validates req.body against a Zod schema.
 * On failure, returns 422 with structured field errors.
 */
export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.issues.map((e: any) => ({ field: e.path.join('.'), message: e.message }));
      return res.status(422).json({ success: false, message: 'Validation failed', errors });
    }
    next(err);
  }
};
