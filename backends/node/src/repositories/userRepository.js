// Interface: findById(id), findByEmail(email), save(user)

export function createUserRepositorySql(db) {
  return {
    async findById(id) {
      const row = db.prepare('SELECT id, email, password_hash FROM users WHERE id = ?').get(id);
      return row ? { id: row.id, email: row.email, passwordHash: row.password_hash } : null;
    },
    async findByEmail(email) {
      const row = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(email);
      return row ? { id: row.id, email: row.email, passwordHash: row.password_hash } : null;
    },
    async save(user) {
      const id = user.id || crypto.randomUUID();
      db.prepare('INSERT OR REPLACE INTO users (id, email, password_hash) VALUES (?, ?, ?)').run(
        id,
        user.email,
        user.passwordHash
      );
      return { ...user, id };
    },
  };
}

export function createUserRepositoryMongo(col) {
  return {
    async findById(id) {
      const doc = await col.findOne({ _id: id });
      return doc ? { id: doc._id, email: doc.email, passwordHash: doc.passwordHash } : null;
    },
    async findByEmail(email) {
      const doc = await col.findOne({ email });
      return doc ? { id: doc._id, email: doc.email, passwordHash: doc.passwordHash } : null;
    },
    async save(user) {
      const id = user.id || crypto.randomUUID();
      await col.replaceOne(
        { _id: id },
        { _id: id, email: user.email, passwordHash: user.passwordHash },
        { upsert: true }
      );
      return { ...user, id };
    },
  };
}
