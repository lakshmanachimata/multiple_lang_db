# Multi-Language Backend + BFF + Frontend — Implementation Plan

## Overview

- **4 backend services**: Java (Spring Boot), Go, Python, Node.js — each with Repository pattern, same API contract, different ports.
- **1 BFF**: Node.js — routes to the correct backend based on **language + DB** chosen at login/signup.
- **1 frontend**: React — login/signup with combo (lang + DB), dashboard with task CRUD.
- **Databases**: Each backend supports **SQL** and **MongoDB**; selected via combo (default: **Java + SQL**). **One process per language**; DB is switched at runtime using request header `X-DB-Type: sql|mongo` (Option B).

---

## 1. Project Structure

```
multiple_lang_db/
├── .vscode/
│   └── launch.json              # Debug all services
├── .gitignore                   # Updated for Java, Go, Python, Node, React
├── backends/
│   ├── java/                    # Spring Boot (port 8081)
│   ├── go/                      # Go (port 8082)
│   ├── python/                  # Python/FastAPI or Flask (port 8083)
│   └── node/                    # Node/Express (port 8084)
├── bff/                         # Node.js BFF (port 3000)
└── frontend/                    # React SPA (port 5173 or 3001)
```

---

## 2. API Contract (Same for All 4 Backends)

### Public (no auth)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create user (email, password, etc.) |
| POST | `/api/auth/login` | Login; returns JWT (or session token) |

### Protected (Bearer token required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task (title, description) |
| GET | `/api/tasks/:id` | Get task by id |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

**Task model**: `{ id, title, description, userId?, createdAt? }`  
**Auth**: JWT in `Authorization: Bearer <token>`.

---

## 3. Backend Services (Same Behavior, Different Ports)

### 3.1 Java (Spring Boot) — Port **8081**

- **Stack**: Spring Boot 3.x, Spring Data JPA (SQL) + Spring Data MongoDB.
- **Repo pattern**: `UserRepository`, `TaskRepository`; implementations: `UserRepositoryJpa`, `UserRepositoryMongo`, same for Task.
- **DB switching**: Read request header **`X-DB-Type: sql`** or **`X-DB-Type: mongo`** (sent by BFF on every request); use the corresponding repository implementation for that request. One process, both DBs configured; switch per request.
- **Auth**: Spring Security + JWT (filter).

### 3.2 Go — Port **8082**

- **Stack**: Gin or Echo; `database/sql` (e.g. PostgreSQL) + official MongoDB driver.
- **Repo pattern**: Interfaces `UserRepository`, `TaskRepository`; implementations for SQL and Mongo.
- **DB switching**: Read **`X-DB-Type`** header on each request; resolve repository implementation (SQL or Mongo) and use it for that request.
- **Auth**: JWT middleware; same API paths as above.

### 3.3 Python — Port **8083**

- **Stack**: FastAPI (or Flask); SQLAlchemy (SQL) + Motor/PyMongo (MongoDB).
- **Repo pattern**: Abstract base classes or protocols for `UserRepository`, `TaskRepository`; SQL and Mongo implementations.
- **DB switching**: Read **`X-DB-Type`** header; inject or select the matching repository in the dependency chain (e.g. FastAPI `Depends`) per request.
- **Auth**: JWT via dependency (e.g. OAuth2PasswordBearer + verify token).

### 3.4 Node.js — Port **8084**

- **Stack**: Express; e.g. Prisma or raw SQL for SQL, Mongoose for MongoDB.
- **Repo pattern**: `UserRepository` / `TaskRepository` interfaces; `UserRepositorySql`, `UserRepositoryMongo`, etc.
- **DB switching**: Middleware or per-route logic reads **`X-DB-Type`** and selects the correct repository for that request.
- **Auth**: JWT middleware (e.g. `express-jwt` or custom).

**DB switching (Option B — chosen)**: **One process per language.** BFF forwards to a single backend URL per language and sends **`X-DB-Type: sql`** or **`X-DB-Type: mongo`** on every request (from session). Each backend uses that header to choose the repository layer (SQL or Mongo) for that request. Lang + DB are fixed at login/signup and stored in session, so all subsequent requests use the same combo until the user logs out.

---

## 4. BFF (Node.js) — Port **3000**

- **Role**: Single entry point for the frontend; forwards to the correct backend by **language** and sends **`X-DB-Type`** so the backend uses the right DB (Option B).
- **Storage**: After successful login/signup, store `{ lang, db, token }` in **session** (e.g. express-session). Frontend sends session cookie on every request; BFF reads (lang, db), picks backend URL by **lang**, and adds header **`X-DB-Type: sql`** or **`X-DB-Type: mongo`** (from session `db`) when proxying.
- **Routing** (by language only; one URL per backend):
  - `java` → `http://localhost:8081`
  - `go` → `http://localhost:8082`
  - `python` → `http://localhost:8083`
  - `node` → `http://localhost:8084`
- **Proxying**: Every request to a backend includes **`X-DB-Type: <sql|mongo>`** from session so the backend switches repository per request.
- **Endpoints** (BFF mirrors backend for client):
  - `POST /api/auth/register` — body: `{ email, password, lang, db }` → pick backend by `lang`, forward with `X-DB-Type: <db>`, return token/session.
  - `POST /api/auth/login` — body: `{ email, password, lang, db }` → same; on success store (lang, db, token) in session, return session/ok.
  - `GET/POST/PUT/DELETE /api/tasks/*` — require auth; read (lang, db) from session; proxy to backend for `lang` with headers `X-DB-Type: <db>` and `Authorization: Bearer <token>`.

---

## 5. Frontend (React) — Port **5173** (Vite) or **3001**

- **Login/Signup screen**:
  - Two dropdowns: **Language** (Java, Go, Python, Node.js) and **Database** (SQL, MongoDB). Default: **Java** and **SQL**.
  - Actions: Login, Sign up. Calls BFF `POST /api/auth/login` or `POST /api/auth/register` with `{ email, password, lang, db }`. On success, redirect to dashboard and store session (cookie or token in memory/localStorage as per BFF design).
- **Dashboard** (after login):
  - **Tasks**: List tasks, Add task, Edit task, Delete task. All requests go to BFF (e.g. `/api/tasks`); BFF uses session to know which backend to call. UI uses the same API regardless of (lang, db).
- **Tech**: React (Vite), fetch/axios to BFF base URL (e.g. `http://localhost:3000`). No direct backend URLs in frontend.

---

## 6. Defaults and Combo Behavior

- **Default on login/signup**: Language = **Java**, Database = **SQL** (pre-selected in combo).
- User can change to any (lang, db). That choice is sent to BFF on login/register and stored in session; all subsequent task API calls use that backend (and DB) until the user logs out and logs in again with another combo.

---

## 7. .gitignore Updates

- **Java**: `target/`, `*.class`, `*.jar`, `*.war`, `.idea/`, `*.iml`, etc.
- **Go**: `bin/`, `*.exe`, `vendor/` (if not committed).
- **Python**: (already present) `__pycache__/`, `.venv/`, etc.
- **Node**: `node_modules/`, `dist/`, `.env`, `*.log`, `npm-debug.log*`.
- **React**: `node_modules/`, `dist/`, `build/`, `.env.local`, etc.
- **General**: `.env`, `.vscode/launch.json` can be committed (no secrets in it); exclude only local overrides if any.

---

## 8. VS Code launch.json — Debug All Services

- **Configurations** (one per service; 4 backends, 1 BFF, 1 frontend):
  - **Java**: type `java`, mainClass or Spring Boot app, port 8081 (single process; X-DB-Type switches DB).
  - **Go**: type `go`, program path, port 8082.
  - **Python**: type `python`, module/script to run (e.g. `uvicorn` or `flask run`), port 8083.
  - **Node (backend)**: type `node` or `pwa-node`, program or `npm run dev`, port 8084.
  - **BFF**: type `node`/`pwa-node`, script or `npm run dev`, port 3000.
  - **Frontend**: type `chrome` or `pwa-chrome`, url `http://localhost:5173`, preLaunchTask to start Vite dev server (or compound to start server + attach).
- **Compound**: "Run All" (or "Debug Backend + BFF + Frontend") to start the ones you need.

---

## 9. Implementation Order (Suggested)

1. **API contract**: Document request/response shapes (OpenAPI optional) and agree on JWT format.
2. **One backend first**: e.g. Java (Spring Boot) with SQL only — register, login, task CRUD. Then add Mongo repo implementations and **X-DB-Type** header handling to switch repository per request (single process).
3. **Repeat** for Go, Python, Node (each with SQL + Mongo repos and X-DB-Type-based switching in one process per language).
4. **BFF**: Proxy auth and task APIs; route by `lang` to backend URL and send **`X-DB-Type`** from session on every proxied request; session storage of (lang, db, token).
5. **Frontend**: Login/signup with combo, dashboard, task list/add/edit/delete calling BFF.
6. **.gitignore** and **launch.json** for all services.
7. **README**: How to run each backend (with SQL and Mongo), BFF, and frontend; how to debug with VS Code.

---

## 10. Port Summary (Option B — One Process per Language)

| Service   | Port | Notes                                      |
|----------|------|--------------------------------------------|
| Java     | 8081 | Single process; `X-DB-Type` switches DB   |
| Go       | 8082 | Single process; `X-DB-Type` switches DB   |
| Python   | 8083 | Single process; `X-DB-Type` switches DB   |
| Node     | 8084 | Single process; `X-DB-Type` switches DB   |
| BFF      | 3000 | Forwards with `X-DB-Type` from session     |
| Frontend | 5173 | —                                          |

---

## 11. Open Points for Your Approval

1. **DB switching**: **Option B** — one process per language; backend reads **`X-DB-Type: sql|mongo`** on each request and uses the corresponding repository. Lang + DB are set at login/signup and sent by BFF on every proxied request.
2. **Session vs JWT in frontend**: BFF stores (lang, db, backend token) in server-side session and returns session cookie; frontend only talks to BFF.
3. **Python framework**: FastAPI recommended (async, OpenAPI, typing). Confirm or choose Flask.
4. **SQL database**: Same for all (e.g. PostgreSQL or H2 for dev); or each backend can use its default (H2/Java, sqlite/Go, etc.) for simplicity in dev.

If this plan looks good, next step is to implement in the order above and keep APIs aligned across all four backends and the BFF.
