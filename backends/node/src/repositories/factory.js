import { getDbType, MONGO } from '../dbcontext.js';
import { createUserRepositorySql, createUserRepositoryMongo } from './userRepository.js';
import { createTaskRepositorySql, createTaskRepositoryMongo } from './taskRepository.js';

export function createRepositoryFactory(db, mongoDb) {
  const userSql = createUserRepositorySql(db);
  const userMongo = mongoDb
    ? createUserRepositoryMongo(mongoDb.collection('users'))
    : null;
  const taskSql = createTaskRepositorySql(db);
  const taskMongo = mongoDb
    ? createTaskRepositoryMongo(mongoDb.collection('tasks'))
    : null;

  return {
    getUserRepository() {
      return getDbType() === MONGO && userMongo ? userMongo : userSql;
    },
    getTaskRepository() {
      return getDbType() === MONGO && taskMongo ? taskMongo : taskSql;
    },
  };
}
