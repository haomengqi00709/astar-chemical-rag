# Infrastructure — Progression

Last updated: 2026-04-18

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS (Vite) |
| Backend | Node.js / Express (`server.js`) |
| AI agents | Python subprocesses (spawned by server.js) |
| Vector DB | ChromaDB (local persistence) |
| Wiki DB | SQLite (`db/engineering.db`) |
| Deployment | Docker → Railway |
| CI/CD | GitHub Actions (build + push Docker image on push to `main`) |

---

## server.js

Single Express server handles:
- Static file serving (React build at `/dist`)
- All `/api/*` routes
- Spawning Python subprocesses for agents and wiki queries
- In-memory caching for wiki graph (rebuilt hourly)

### Python path resolution
```javascript
const PYTHON = (() => {
  const envPath = process.env.PYTHON_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;  // Railway/Docker
  if (fs.existsSync(_localPython))       return _localPython; // local venv
  return 'python3';                                          // system fallback
})();
```
`_localPython = RAG_ROOT/venv/bin/python3`

### Key API routes

| Route | Handler |
|---|---|
| `POST /api/projects` | Create project, run PM agent |
| `POST /api/projects/:id/run-process` | Run Process agent |
| `POST /api/projects/:id/run-mechanical` | Run Mechanical agent |
| `POST /api/projects/:id/summarize-deliverables` | Generate deliverable summary |
| `GET /api/wiki/graph` | Standard knowledge graph (cached) |
| `POST /api/wiki/query` | Standard wiki query (ask.py) |
| `GET /api/user-projects` | List user projects |
| `POST /api/user-projects` | Create user project + run wiki pipeline |
| `GET /api/user-projects/:id/graph` | Per-project knowledge graph |
| `POST /api/user-projects/:id/query` | Per-project wiki query (ask_generic.py) |
| `GET /api/library` | Library document data |

---

## Deployment (Railway)

- Docker image: `ghcr.io/haomengqi00709/astar-chemical-rag:latest`
- Built via GitHub Actions on push to `main`
- Environment variables set in Railway dashboard:
  - `GOOGLE_API_KEY` — Gemini API key
  - `PYTHON_PATH` — path to Python in Docker image
  - `PORT` — 8080
- Vector store layer cached separately in Docker to skip rebuild on code-only pushes

---

## Docker Build

```dockerfile
# Vector store built at image build time (not startup)
# Requires GOOGLE_API_KEY as build secret
```

- ChromaDB (`chroma_db/`) embedded in image at build time
- Wiki KB artifacts (`wiki_kb/db/`, `wiki_kb/_tmp/`) gitignored, rebuilt in image
- `user_projects/` mounted as volume (runtime data)

---

## .gitignore Key Entries

| Pattern | Reason |
|---|---|
| `.env` | API keys |
| `venv/` | Python virtualenv |
| `chroma_db/` | Large, rebuilt by pipeline |
| `user_projects/` | Runtime user data |
| `wiki_kb/db/` | Generated SQLite DB |
| `wiki_kb/_tmp/` | Build artifacts |
| `work_agents/.../projects_store.json` | 25MB runtime data, regenerated |
| `work_agents/.../deliverables/*.docx` | Generated output files |

---

## Changes Log

### 2026-04-18
- `projects_store.json` (25MB) removed from git tracking, added to `.gitignore`
- PM agent deliverable `.docx` files added to `.gitignore`
- Server: quota error detection in wiki query — returns friendly message when Gemini 429 detected in stderr

### 2026-04-09 → 2026-04-15
- Vector store Docker layer separated from code layer (cache hit on code-only pushes)
- LibreOffice added to Docker image for `.doc` → `.docx` conversion
- Python path resolution hardened — falls back gracefully if `PYTHON_PATH` doesn't exist on disk
- Pipeline error stderr now surfaced in user project UI via `/api/user-projects/:id/logs`

### Pre-2026-04-09
- GitHub Actions CI/CD wired up
- Railway deployment configured
- Docker image with embedded ChromaDB at build time
- `GOOGLE_API_KEY` passed as GitHub Actions build secret

---

## Known Issues / Next Steps

- No health check endpoint — Railway uses HTTP ping on `/`
- Wiki query blocks a thread for up to 120s during rate-limit retries (synchronous subprocess)
- No request timeout on long-running Python subprocesses — could hang indefinitely if agent crashes
- User project data (`user_projects/`) not backed up — lives only on Railway ephemeral storage
