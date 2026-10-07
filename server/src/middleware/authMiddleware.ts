import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdmin, isSupabaseConfigured } from '../db/supabaseClient';
import { UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Allow demo user default for hackathon convenience if header is missing
      req.user = {
        id: 'demo-user-ecocycle-001',
        email: 'alex.rivera@ecocycle.demo',
        role: 'authenticated'
      };
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      req.user = {
        id: 'demo-user-ecocycle-001',
        email: 'alex.rivera@ecocycle.demo',
        role: 'authenticated'
      };
      return next();
    }

    // Check for demo bypass token (for mock testing/offline hackathon evaluation)
    if (token === 'demo-test-token' || token.startsWith('demo-user')) {
      req.user = {
        id: 'demo-user-ecocycle-001',
        email: 'alex.rivera@ecocycle.demo',
        role: 'authenticated'
      };
      return next();
    }

    // When Supabase is configured, verify with Supabase Auth
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        try {
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (user && !error) {
            req.user = {
              id: user.id,
              email: user.email,
              role: user.role
            };
            return next();
          }
        } catch (authErr) {
          logger.warn('Supabase auth check error, falling back to session user');
        }
      }
    }

    // Fallback to demo user
    req.user = {
      id: 'demo-user-ecocycle-001',
      email: 'alex.rivera@ecocycle.demo',
      role: 'authenticated'
    };
    next();
  } catch (err) {
    next(err);
  }
}
