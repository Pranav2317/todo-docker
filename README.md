# Dock Tasks: a full-stack to-do app in Docker

Practice project for running a **Next.js frontend**, a **FastAPI backend** and a **PostgreSQL database** together with Docker Compose.

```
Browser ──► frontend (Next.js, :3000) ──► backend (FastAPI, :8000) ──► db (PostgreSQL, :5432)
```

## Project structure

```
todo-docker/
├── docker-compose.yml      ← runs all 3 services together
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py         ← API routes
│       ├── database.py     ← DB connection
│       └── models.py       ← Todo table
└── frontend/
    ├── Dockerfile          ← multi-stage build
    ├── package.json
    ├── next.config.js
    └── app/
        ├── layout.js
        ├── page.js         ← the to-do UI
        └── globals.css
```

## Run it

1. Start **Docker Desktop** and wait for "Engine running".
2. Open PowerShell in this folder (the one with `docker-compose.yml`):
   ```powershell
   cd C:\projects\todo-docker
   ```
3. Build and start everything:
   ```powershell
   docker compose up -d --build
   ```
   The first build takes a few minutes (it downloads Python, Node and Postgres images).
4. Open:
   - App: http://localhost:3000
   - API docs: http://localhost:8000/docs

## Everyday commands

| Command | What it does |
|---|---|
| `docker compose ps` | Show all services and their status |
| `docker compose logs -f backend` | Follow backend logs (Ctrl+C to exit) |
| `docker compose up -d --build` | Rebuild after changing code |
| `docker compose restart backend` | Restart one service |
| `docker compose down` | Stop everything (data is kept) |
| `docker compose down -v` | Stop and **delete** database data |
| `docker compose exec db psql -U todo_user -d todo_db` | Open the database shell (`\q` to quit) |

## Practice challenges

1. **Prove data persists.** Add some tasks, run `docker compose down`, then `docker compose up -d`. Your tasks are still there because of the `db-data` volume. Now try `down -v` and see what happens.
2. **Look inside the database.** Open the psql shell (command above) and run `SELECT * FROM todos;`
3. **Change the backend.** Add a `GET /api/stats` endpoint returning total and completed counts. Rebuild with `docker compose up -d --build backend`.
4. **Break it on purpose.** Run `docker compose stop backend` and refresh the app: the service chain turns red. Start it again with `docker compose start backend`.
5. **Change a port.** Make the frontend run on 4000 instead of 3000 (hint: change the left side of `"3000:3000"` and update `FRONTEND_ORIGIN`).
6. **Move secrets to a .env file.** Put the Postgres password in a `.env` file and reference it in `docker-compose.yml` as `${POSTGRES_PASSWORD}`.
7. **Deploy it.** Push to GitHub, clone on a cloud VPS, run `docker compose up -d --build`, and change `NEXT_PUBLIC_API_URL` and `FRONTEND_ORIGIN` to your server's IP.

## Troubleshooting

- **"Can't reach the API" in the app:** run `docker compose ps`. If backend isn't "Up", check `docker compose logs backend`.
- **Port already allocated:** another program uses 3000 or 8000. Stop it or change the left-hand port in `docker-compose.yml`.
- **Changes don't show up:** you must rebuild with `--build`. Hard-refresh the browser with Ctrl+F5.
- **Slow builds or file errors:** keep the project outside OneDrive, for example in `C:\projects`.

## Deploying with CI/CD (GitHub Actions → EC2)

Files involved:

- `.github/workflows/deploy.yml`: the pipeline (tests → build images → push to ghcr.io → deploy over SSH)
- `docker-compose.prod.yml`: the compose file the server runs (uses images, not builds)
- `backend/tests/test_api.py`: tests the pipeline runs before building

One-time setup:

1. Server prepared with Docker, `~/todo-app/.env` containing `POSTGRES_PASSWORD=...`, and the deploy key in `~/.ssh/authorized_keys`.
2. GitHub repo secrets: `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`.
3. Push to `main`. Watch progress in the repo's **Actions** tab.

After that, every `git push` to `main` redeploys automatically. App: `http://SERVER_IP:3000`.
