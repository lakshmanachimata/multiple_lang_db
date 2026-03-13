export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  sessionSecret: process.env.SESSION_SECRET || 'bff-session-secret-change-in-prod',
};

const BACKEND_URLS = {
  java: 'http://localhost:8081',
  go: 'http://localhost:8082',
  python: 'http://localhost:8083',
  node: 'http://localhost:8084',
};

export function getBackendBaseUrl(lang) {
  return BACKEND_URLS[lang] || BACKEND_URLS.java;
}
