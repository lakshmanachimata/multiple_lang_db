import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { sign } from '../auth/jwt.js';
import { createRepositoryFactory } from '../repositories/factory.js';

export function createAuthRouter(factory) {
  const router = Router();

  router.post('/register', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'email and password required' });
      }
      const userRepo = factory.getUserRepository();
      const existing = await userRepo.findByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'email already registered' });
      }
      const hash = await bcrypt.hash(password, 10);
      const user = await userRepo.save({ email, passwordHash: hash });
      const token = sign(user.id, user.email);
      return res.json({ token });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'email and password required' });
      }
      const userRepo = factory.getUserRepository();
      const user = await userRepo.findByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(400).json({ error: 'invalid email or password' });
      }
      const token = sign(user.id, user.email);
      return res.json({ token });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  return router;
}
