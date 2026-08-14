### Task 1: Root Workspace Setup

**Before you begin:**
The current `package.json` at the root contains the Next.js dependencies. We need to save it before creating the workspace root.
Rename it to `frontend-package.json` so we don't lose it for Task 3.

- [ ] **Step 0: Save old package.json**
Run `git mv package.json frontend-package.json` (or just use regular rename/move).

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
git add package.json frontend-package.json package-lock.json
git commit -m "chore: setup root workspace"
```
