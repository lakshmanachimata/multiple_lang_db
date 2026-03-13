# Multi-Language Backend + BFF + Frontend

Four backends (Java, Go, Python, Node.js), one BFF, and a React frontend. Each backend supports **SQL** and **MongoDB**; the choice is made at login/signup and sent on every request via the **`X-DB-Type`** header (Option B: one process per language).

## Structure

| Service   | Port | Path          |
|----------|------|---------------|
| Java     | 8081 | `backends/java` |
| Go       | 8082 | `backends/go`   |
| Python   | 8083 | `backends/python` |
| Node     | 8084 | `backends/node`   |
| BFF      | 3000 | `bff`            |
| Frontend | 5173 | `frontend`       |

## Prerequisites

- **Java 17+**, Maven (for Java backend)
- **Go 1.21+** (for Go backend)
- **Python 3.11+**, uv (for Python backend)
- **Node 18+** (for Node backend, BFF, and frontend)
- **MongoDB** (optional; required only when using the "MongoDB" option in the UI)

## Quick start

1. **Start one backend** (e.g. Java):
   ```bash
   cd backends/java && ./mvnw spring-boot:run
   ```
2. **Start BFF**:
   ```bash
   cd bff && npm install && npm run dev
   ```
3. **Start frontend** (proxies `/api` to BFF):
   ```bash
   cd frontend && npm install && npm run dev
   ```
4. Open **http://localhost:5173**. Default combo is **Java** + **SQL**. Sign up or log in; then use the dashboard to manage tasks.

## Running each backend

- **Java**: `cd backends/java && ./mvnw spring-boot:run` (or open in IDE and run `MultiLangBackendJavaApplication`)
- **Go**: `cd backends/go && go run .`
- **Python**: `cd backends/python && uv run uvicorn app.main:app --host 0.0.0.0 --port 8083`
- **Node**: `cd backends/node && npm install && npm run dev`

Each backend reads **`X-DB-Type: sql`** or **`X-DB-Type: mongo`** and uses the corresponding repository (SQL or Mongo).

## BFF

- Stores **lang**, **db**, and **token** in session after login/register.
- Proxies `/api/auth/*` and `/api/tasks/*` to the backend for the chosen **lang**, adding **`X-DB-Type`** from session.

## Frontend

- Login/signup screen: dropdowns **Language** (Java, Go, Python, Node.js) and **Database** (SQL, MongoDB). Default: **Java** + **SQL**.
- Dashboard: list, add, edit, delete tasks. All requests go to the BFF with credentials (session cookie).

## Debugging (VS Code)

Use `.vscode/launch.json`:

- **Backend Java**, **Backend Go**, **Backend Python**, **Backend Node**: run each backend under the debugger.
- **BFF**, **Frontend**: run BFF and the Vite dev server.
- **Frontend (Chrome)**: launch Chrome against http://localhost:5173.
- **Compound "All backends + BFF + Frontend"**: start all services at once (start Frontend first so the dev server is up, then start the compound or start backends + BFF manually).

## API (same for all backends)

- `POST /api/auth/register` — body: `{ "email", "password" }` (BFF also accepts `lang`, `db`)
- `POST /api/auth/login` — body: `{ "email", "password" }` (BFF also accepts `lang`, `db`)
- `GET /api/tasks` — list tasks (auth required)
- `POST /api/tasks` — body: `{ "title", "description?" }` (auth required)
- `GET /api/tasks/:id` — get task (auth required)
- `PUT /api/tasks/:id` — update task (auth required)
- `DELETE /api/tasks/:id` — delete task (auth required)

Auth: `Authorization: Bearer <JWT>`.
