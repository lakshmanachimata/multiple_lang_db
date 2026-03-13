export function createTaskRepositorySql(db) {
  return {
    async findById(id) {
      const row = db.prepare('SELECT id, title, description, user_id, created_at FROM tasks WHERE id = ?').get(id);
      if (!row) return null;
      return {
        id: row.id,
        title: row.title,
        description: row.description || '',
        userId: row.user_id,
        createdAt: row.created_at ? new Date(row.created_at) : null,
      };
    },
    async findByUserId(userId) {
      const rows = db
        .prepare('SELECT id, title, description, user_id, created_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC')
        .all(userId);
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description || '',
        userId: r.user_id,
        createdAt: r.created_at ? new Date(r.created_at) : null,
      }));
    },
    async save(task) {
      const id = task.id || crypto.randomUUID();
      const createdAt = task.createdAt || new Date();
      db.prepare(
        'INSERT OR REPLACE INTO tasks (id, title, description, user_id, created_at) VALUES (?, ?, ?, ?, ?)'
      ).run(id, task.title, task.description || '', task.userId, createdAt.toISOString());
      return { ...task, id, createdAt };
    },
    async deleteById(id) {
      db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    },
  };
}

export function createTaskRepositoryMongo(col) {
  return {
    async findById(id) {
      const doc = await col.findOne({ _id: id });
      if (!doc) return null;
      return {
        id: doc._id,
        title: doc.title,
        description: doc.description || '',
        userId: doc.userId,
        createdAt: doc.createdAt,
      };
    },
    async findByUserId(userId) {
      const cursor = col.find({ userId }).sort({ createdAt: -1 });
      const docs = await cursor.toArray();
      return docs.map((d) => ({
        id: d._id,
        title: d.title,
        description: d.description || '',
        userId: d.userId,
        createdAt: d.createdAt,
      }));
    },
    async save(task) {
      const id = task.id || crypto.randomUUID();
      const createdAt = task.createdAt || new Date();
      await col.replaceOne(
        { _id: id },
        { _id: id, title: task.title, description: task.description || '', userId: task.userId, createdAt },
        { upsert: true }
      );
      return { ...task, id, createdAt };
    },
    async deleteById(id) {
      await col.deleteOne({ _id: id });
    },
  };
}
