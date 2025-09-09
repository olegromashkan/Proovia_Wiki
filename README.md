Proovia E‑Learning is a simple training and knowledge platform built with Next.js (App Router) and Tailwind.

## Getting Started

First, run the development server (binds to all interfaces for LAN access):

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open http://localhost:3000 on this machine, or from another device on your network use http://<your-ip>:3000 (e.g. http://192.168.1.10:3000).

If you run a firewall, allow inbound TCP 3000 (Linux: `ufw allow 3000/tcp`).

For production, the start script also binds to all interfaces:

```bash
npm run build && npm start
```

## Features

- Articles directory with search and department filters (`/articles`).
- Departments list linking to filtered articles (`/departments`).
- Training tracks with module checklists and local progress (`/training`).
- Minimal breadcrumbs on article pages.
- Admin: create articles with tags, department and a rich text editor (`/admin/articles/new`).

Content is currently in TypeScript data files. Next steps could include MDX or CMS integration.

## Tech

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4

## Database

- Local dev DB: SQLite via `better-sqlite3` (file stored at `var/data.db`, ignored by git).
- API writes/reads articles and tags from DB (`src/app/api/articles/route.ts`, `src/lib/articlesDb.ts`).
- You can publish from `/admin/articles/new` and see the article at `/articles/<slug>` immediately.

Production recommendation: PostgreSQL (e.g. Neon/Cloud SQL) with Prisma ORM. We can swap the `articlesDb` implementation to Prisma models without touching UI.

## Creating Articles

- Open `/admin/articles/new`.
- Fill title, description, optional slug, department and tags (comma‑separated).
- Write content with the editor (TipTap). Click Publish.
- Articles are stored as JSON under `content/articles/<slug>.json` and appear instantly on `/articles`.
