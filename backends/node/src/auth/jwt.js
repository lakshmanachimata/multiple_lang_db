import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function sign(userId, email) {
  return jwt.sign(
    { sub: userId, email },
    config.jwtSecret,
    { expiresIn: config.jwtExpirationMs / 1000 }
  );
}

export function verify(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
}
