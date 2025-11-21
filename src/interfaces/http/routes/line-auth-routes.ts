import { Hono } from 'hono';
import { LineAuthController } from '@interfaces/http/controllers/line-auth-controller';

export function createAuthRoutes(lineAuthController : LineAuthController): Hono {
    const authRoutes = new Hono();

    authRoutes.post('/auth/line/callback', (c) => lineAuthController.auth(c));
    
    return authRoutes;
}
