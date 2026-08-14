# Katipunan Hub Restructure Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Katipunan-Hub repository into a root-level frontend/backend setup without a src directory.

**Architecture:** Monorepo with NPM workspaces. The frontend is Next.js, backend is Express.js.

**Tech Stack:** Next.js, Express.js, TypeScript, TailwindCSS.

## Global Constraints
- No `src` directories allowed in either `frontend` or `backend` (unless strictly necessary for standard Express, but frontend definitely has no `src`).
- Create fresh package-lock.json at root.
- Remove old api routes from frontend.

---

### Task 1: Root Workspace Setup
**Files:**
- Create: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: None
- Produces: NPM workspace ready for apps.

- [ ] **Step 1: Create root package.json**
Create a new `package.json` at the root of the repository:
```json
{
  "name": "katipunan-hub",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "npm run dev --workspaces --if-present",
    "build": "npm run build --workspaces --if-present"
  }
}
```

- [ ] **Step 2: Remove old lockfiles**
Run `rm package-lock.json` at the root if it exists.

- [ ] **Step 3: Commit**
```bash
git add package.json package-lock.json
git commit -m "chore: setup root workspace"
```

---

### Task 2: Scaffold Backend
**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/index.ts`
- Create: `backend/routes/tutor-application.ts`

**Interfaces:**
- Consumes: None
- Produces: Running Express API on port 4000.

- [ ] **Step 1: Create backend directories**
Run `mkdir -p backend/routes`

- [ ] **Step 2: Create backend/package.json**
```json
{
  "name": "backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev index.ts"
  },
  "dependencies": {
    "express": "^4.19.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
```

- [ ] **Step 3: Create backend/tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

- [ ] **Step 4: Create backend/index.ts**
```typescript
import express from 'express';
import cors from 'cors';
import tutorApplicationRouter from './routes/tutor-application';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/tutor-application', tutorApplicationRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
```

- [ ] **Step 5: Create placeholder for tutor-application route**
Create `backend/routes/tutor-application.ts`:
```typescript
import { Router } from 'express';
const router = Router();
router.post('/', (req, res) => {
  res.json({ success: true, message: "Tutor application received" });
});
export default router;
```

- [ ] **Step 6: Commit**
```bash
git add backend/
git commit -m "feat: scaffold express backend"
```

---

### Task 3: Migrate Frontend Files
**Files:**
- Modify: `frontend/` (various file moves)
- Delete: `src/` (old directory)

**Interfaces:**
- Consumes: Existing Next.js files in root.
- Produces: Clean frontend workspace.

- [ ] **Step 1: Create frontend directory**
Run `mkdir -p frontend`

- [ ] **Step 2: Move Next.js config files to frontend**
Run `git mv next.config.ts tailwind.config.ts postcss.config.mjs eslint.config.mjs tsconfig.json components.json frontend/`
Run `git mv README.md frontend/` (if it exists and makes sense, otherwise leave at root. Just move config files).

- [ ] **Step 3: Move src contents to frontend**
Run `git mv src/app frontend/app`
Run `git mv src/components frontend/components` (if it exists)
Run `git mv src/lib frontend/lib` (if it exists)
Run `git mv src/middleware.ts frontend/` (if it exists)
Run `rm -rf src`

- [ ] **Step 4: Move public folder**
Run `git mv public frontend/public`

- [ ] **Step 5: Move package.json and rename**
Run `git mv package.json frontend/package.json` (Wait, we already created root package.json in Task 1. We should rename the ORIGINAL root package.json to frontend/package.json FIRST, before Task 1 creates the new root package.json! Actually, let's just do it manually here: rename the original one to frontend/package.json, but root package.json was created in Task 1. Wait, this will fail if root package.json is already the new one.
Let's use `git show HEAD:package.json > frontend/package.json` to get the old one, then change its name to "frontend".
```bash
git show HEAD:package.json > frontend/package.json
# modify frontend/package.json to have name "frontend"
```

- [ ] **Step 6: Delete old frontend API routes**
Run `git rm -rf frontend/app/api`

- [ ] **Step 7: Commit**
```bash
git add frontend/ src/ public/
git commit -m "refactor: move next.js to frontend workspace and remove src"
```
