import { setDbType } from '../dbcontext.js';

const HEADER = 'X-DB-Type';

export function dbTypeMiddleware(req, res, next) {
  setDbType(req.get(HEADER));
  next();
}
