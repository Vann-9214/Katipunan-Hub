# Katipunan Hub Restructure & Cleanup Design

## Goal
Transform the Katipunan-Hub project from a standard Next.js full-stack app into a Monorepo Architecture separating the frontend and backend, while also standardizing file structures and cleaning up unused code. The Next.js `src` directory pattern will be dropped in favor of root-level folders.

## Architecture & Structure
The project will use NPM Workspaces to manage multiple applications.

### Root Folder Structure
- `package.json` (Workspace configuration)
- `apps/frontend/` (Next.js Application)
- `apps/backend/` (Express.js API Server)

### Frontend Structure (`apps/frontend/`)
The `src` directory will be removed. All Next.js directories will sit at the root of `apps/frontend/`.
- `app/`: Next.js App Router.
  - Route groups like `(Main)`, `(component-pages)`, `Global` will be reorganized and standardized for a cleaner URL and folder structure.
  - The `api/` folder will be completely removed (migrated to backend).
- `components/`: Unified location for all UI components. Stray component folders (like the current `src/app/component`) will be merged here.
- `lib/`: Utility functions and shared logic.

### Backend Structure (`apps/backend/`)
A standard Express.js application will be initialized.
- `src/index.ts` (Entry point)
- `src/routes/`
- `src/controllers/`
- `src/services/`
The existing Next.js API route (`tutor-application`) will be ported into an Express route (`/api/tutor-application`).

## Cleanup Tasks
- **ESLint Fixes:** Repair the broken ESLint configuration (missing `@eslint/eslintrc` import) and run it across the frontend to catch dead code.
- **Dead Code Removal:** Identify and remove unused components, pages, and dependencies.
- **Component & Route Consolidation:** Simplify the Next.js `app/` structure by reviewing the necessity of current route groups and merging scattered components into the main `components/` directory.

## Phased Approach
1. Scaffold NPM workspace and `apps/frontend`, `apps/backend` folders.
2. Move existing Next.js code to `apps/frontend`, and remove the `src` wrapper so `app` and `components` are at the top level of the frontend.
3. Fix ESLint config in frontend and strip out unused code.
4. Scaffold the Express server in `apps/backend`.
5. Migrate API routes from frontend to backend.
