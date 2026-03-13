import { Router } from 'express';
import { createRepositoryFactory } from '../repositories/factory.js';

export function createTasksRouter(factory, jwtAuth) {
  const router = Router();
  router.use(jwtAuth);

  router.get('/', async (req, res) => {
    try {
      const taskRepo = factory.getTaskRepository();
      const tasks = await taskRepo.findByUserId(req.userId);
      return res.json(tasks);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const { title, description } = req.body;
      if (!title) return res.status(400).json({ error: 'title required' });
      const taskRepo = factory.getTaskRepository();
      const task = await taskRepo.save({
        title,
        description: description || '',
        userId: req.userId,
        createdAt: new Date(),
      });
      return res.status(201).json(task);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const taskRepo = factory.getTaskRepository();
      const task = await taskRepo.findById(req.params.id);
      if (!task || task.userId !== req.userId) {
        return res.status(404).json({ error: 'task not found' });
      }
      return res.json(task);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const taskRepo = factory.getTaskRepository();
      const existing = await taskRepo.findById(req.params.id);
      if (!existing || existing.userId !== req.userId) {
        return res.status(404).json({ error: 'task not found' });
      }
      const title = req.body.title != null ? req.body.title : existing.title;
      const description = req.body.description != null ? req.body.description : existing.description;
      const task = await taskRepo.save({
        id: existing.id,
        title,
        description,
        userId: req.userId,
        createdAt: existing.createdAt,
      });
      return res.json(task);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const taskRepo = factory.getTaskRepository();
      const task = await taskRepo.findById(req.params.id);
      if (!task || task.userId !== req.userId) {
        return res.status(404).json({ error: 'task not found' });
      }
      await taskRepo.deleteById(req.params.id);
      return res.status(204).send();
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  return router;
}
