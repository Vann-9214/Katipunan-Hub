# Remove Lost and Found Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely remove all routes, feature components, navigation links, public assets, and marketing/documentation references relating to the "Lost & Found" function.

**Architecture:** Purge obsolete routes under `frontend/app/(pages)/LostandFound` and feature modules under `frontend/features/LostandFound`. Clean up the top navbar in `frontend/components/HomepageTab.tsx` and align all Landing Page copy, footer links, and animated hero graphics to the remaining four core pillars (News, Feeds, PLC, Calendar).

**Tech Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide React, Framer Motion

## Global Constraints

- Do not leave any unused imports or broken links across the frontend.
- Maintain visual balance in the Landing Page Hero animation section by replacing `/found.svg` with `/Schedule.svg`.
- Every task must end with verification and git commit.

---

### Task 1: Delete Lost & Found Route, Components, and Assets

**Files:**
- Delete: `frontend/app/(pages)/LostandFound/page.tsx`
- Delete: `frontend/features/LostandFound/LostandFoundcontent.tsx`
- Delete: `frontend/features/LostandFound/PostCard.tsx`
- Delete: `frontend/features/LostandFound/PostItemModal.tsx`
- Delete: `frontend/features/LostandFound/PostViewModal.tsx`
- Delete: `frontend/public/lost.svg`
- Delete: `frontend/public/found.svg`

- [ ] **Step 1: Delete page route and feature directory**

Run in PowerShell:
```powershell
Remove-Item -Recurse -Force "frontend/app/(pages)/LostandFound"
Remove-Item -Recurse -Force "frontend/features/LostandFound"
```

- [ ] **Step 2: Delete public SVG assets**

Run in PowerShell:
```powershell
Remove-Item -Force "frontend/public/lost.svg"
Remove-Item -Force "frontend/public/found.svg"
```

- [ ] **Step 3: Verify deletion**

Run in PowerShell:
```powershell
Test-Path "frontend/app/(pages)/LostandFound"
Test-Path "frontend/features/LostandFound"
Test-Path "frontend/public/lost.svg"
Test-Path "frontend/public/found.svg"
```
Expected: All return `False`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: delete lost and found route, components, and assets"
```

---

### Task 2: Remove Lost & Found from Navigation Header

**Files:**
- Modify: `frontend/components/HomepageTab.tsx`

- [ ] **Step 1: Remove Package icon import and navItems entry**

In `frontend/components/HomepageTab.tsx`:
1. Remove `Package,` from `lucide-react` import (lines 7-18).
2. Remove `{ href: "/LostandFound", icon: Package, name: "Lost & Found" },` from `navItems` array (lines 34-40).

- [ ] **Step 2: Verify HomepageTab compiles**

Run in PowerShell:
```powershell
cd frontend; npx tsc --noEmit
```
Expected: No TypeScript errors in `HomepageTab.tsx`.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/HomepageTab.tsx
git commit -m "refactor: remove lost and found navigation item from HomepageTab"
```

---

### Task 3: Update Landing Page Marketing Copy, Hero Graphics, and Bios

**Files:**
- Modify: `frontend/features/LandingPage/LandingPageContent/HeroSection.tsx`
- Modify: `frontend/features/LandingPage/LandingPageContent/ProjectInfoSection.tsx`
- Modify: `frontend/features/LandingPage/LandingPageContent/LandingPageContent.tsx`
- Modify: `frontend/features/LandingPage/LandingPageTab/SignUpForms.tsx`
- Modify: `frontend/features/LandingPage/LandingPageContent/TeamSection.tsx`

- [ ] **Step 1: Update HeroSection.tsx**

1. Replace line 105:
```tsx
From school events to lost & found,{" "}
```
with:
```tsx
From campus news to student discussions,{" "}
```

2. Replace line 184:
```tsx
<Image src="/found.svg" alt="Found" width={65} height={65} />
```
with:
```tsx
<Image src="/Schedule.svg" alt="Schedule" width={65} height={65} />
```

- [ ] **Step 2: Update ProjectInfoSection.tsx**

1. Replace line 212:
```tsx
It centralizes Announcements, Feeds, and Lost & Found. We also
```
with:
```tsx
It centralizes Announcements, Feeds, and Academic Resources. We also
```

2. Replace line 224:
```tsx
"Integrated Lost & Found",
```
with:
```tsx
"Official Campus Announcements",
```

- [ ] **Step 3: Update LandingPageContent.tsx**

In `LandingPageContent.tsx` footer items list (lines 166-172), replace:
```tsx
[
  "Home",
  "Announcements",
  "Peer Learning Center",
  "Lost & Found",
  "Community Feed",
]
```
with:
```tsx
[
  "Home",
  "Announcements",
  "Peer Learning Center",
  "Calendar",
  "Community Feed",
]
```

- [ ] **Step 4: Update SignUpForms.tsx**

In `frontend/features/LandingPage/LandingPageTab/SignUpForms.tsx` (around line 170), replace:
```tsx
announcements, PLC scheduling, Lost & Found resources, and community
```
with:
```tsx
announcements, PLC scheduling, Calendar management, and community
```

- [ ] **Step 5: Update TeamSection.tsx**

In `frontend/features/LandingPage/LandingPageContent/TeamSection.tsx` (around line 19), update Clark Jaca's bio:
```tsx
bio: "Focused on the user interface design and implementation. Crafted the Landing Page and the visual layout for core student features.",
```

- [ ] **Step 6: Commit**

```bash
git add frontend/features/LandingPage/
git commit -m "refactor: update landing page copy, graphics, and bios to remove lost and found references"
```

---

### Task 4: Repository Verification & Build Check

**Files:**
- Repository-wide verification

- [ ] **Step 1: Check for any remaining occurrences of "Lost & Found" or "LostandFound"**

Run in repository root:
```powershell
git grep -i "lostandfound"
git grep -i "lost & found"
```
Expected: Only hits in docs/specs/plans or git log. No code occurrences in `frontend/`.

- [ ] **Step 2: Run Next.js type check & build**

Run in PowerShell:
```powershell
cd frontend; npm run build
```
Expected: Build succeeds with 0 errors.

- [ ] **Step 3: Final clean commit (if any remaining adjustments)**

```bash
git status
```
