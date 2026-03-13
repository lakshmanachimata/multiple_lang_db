const SQL = 'sql';
const MONGO = 'mongo';

const store = { dbType: SQL };

export function setDbType(value) {
  store.dbType = value && value.toLowerCase() === MONGO ? MONGO : SQL;
}

export function getDbType() {
  return store.dbType;
}

export { SQL, MONGO };
