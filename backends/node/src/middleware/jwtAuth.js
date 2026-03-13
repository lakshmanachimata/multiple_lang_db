import { verify } from '../auth/jwt.js';

export function jwtAuthMiddleware(req, res, next) {
  const auth = req.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing or invalid authorization' });
  }
  const token = auth.slice(7);
  const payload = verify(token);
  if (!payload) {
    return res.status(401).json({ error: 'invalid token' });
  }
  req.userId = payload.sub;
  req.email = payload.email;
  next();
}
