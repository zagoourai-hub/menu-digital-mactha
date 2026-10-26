# Repository Guidelines

## Project Structure & Module Organization

The current application lives in `frontend/`: Next.js App Router, React, TypeScript, Tailwind CSS, and Prisma with SQLite.

- `frontend/app/`: pages, layouts, section components, global styles, and the `/api/menus` route.
- `frontend/components/`: feature components; `ui/` contains reusable UI primitives.
- `frontend/lib/`: Prisma access, providers, hooks, utilities, and Zustand stores.
- `frontend/prisma/`: database schema and versioned migrations. `frontend/generated/prisma/` contains generated client code; do not edit it manually.
- `frontend/public/assets/images/`: static image assets.
- `docs/PRD/`, `docs/Architectur/`, and `docs/design/`: requirements, architecture proposals, and visual references. Some documented features, including a separate backend, are not implemented yet.

## Build, Test, and Development Commands

Run commands from `frontend/` (`cd frontend`). Use pnpm to match `pnpm-lock.yaml`.

- `pnpm install --frozen-lockfile`: install locked dependencies.
- `pnpm dev`: start the local development server.
- `pnpm build`: create the production build.
- `pnpm start`: serve an existing production build.
- `pnpm lint`: run ESLint with Next.js and TypeScript rules.
- `pnpm typecheck`: check TypeScript without emitting files.
- `pnpm format`: format TypeScript and TSX files with Prettier.

## Coding Style & Naming Conventions

Use strict TypeScript and the `@/` import alias. Prettier specifies two-space indentation, double quotes, no semicolons, LF endings, and an 80-column print width; its Tailwind plugin sorts utility classes. Use PascalCase for component names, `useX` for hooks, and descriptive store filenames such as `sidebar.store.ts`. Preserve Next.js filenames such as `page.tsx`, `layout.tsx`, and `route.ts`.

## Testing Guidelines

No automated test framework, test script, or coverage threshold is configured. Before submitting, run lint, typecheck, and build. Manually verify the landing page, category filtering, menu loading/error states, and `/api/menus`. Record checks and known failures in the pull request.

## Commit & Pull Request Guidelines

The Git repository is at the project root and includes `frontend/` and `docs/`. Use concise imperative messages, such as `Add menu category filtering`. Include a change description, related issue when available, validation results, screenshots for UI changes, and migration/configuration notes. Keep local databases, credentials, and generated test artifacts out of commits.

## Configuration & Agent Instructions

Keep credentials in ignored environment files; configure `DATABASE_URL` for local SQLite. Prisma CLI commands must explicitly select `--config prisma7.config.ts`. Follow `frontend/AGENTS.md`, including reading the bundled Next.js documentation before changing application code.
