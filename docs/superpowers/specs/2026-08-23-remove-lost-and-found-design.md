# Design Document: Remove Lost and Found Functionality

**Date:** 2026-08-23  
**Status:** Approved by User  
**Topic:** Complete Removal of Lost and Found Feature  

---

## 1. Overview & Objective
The goal is to completely remove all code, routes, UI components, static assets, and marketing/documentation references relating to the "Lost & Found" functionality across Katipunan Hub.

The platform will now focus cleanly on its four core pillars:
1. **Announcements / News**
2. **Feeds (Community Discussion)**
3. **Peer Learning Center (PLC)**
4. **Calendar**

---

## 2. Scope of Changes

### A. Navigation & Routing
- **`frontend/components/HomepageTab.tsx`**:
  - Remove `{ href: "/LostandFound", icon: Package, name: "Lost & Found" }` from `navItems`.
  - Remove unused `Package` icon import from `lucide-react`.
- **`frontend/app/(pages)/LostandFound/page.tsx`**:
  - Delete the entire route page and its parent folder.

### B. Feature Components
- **`frontend/features/LostandFound/`**:
  - Delete the entire directory including:
    - `LostandFoundcontent.tsx`
    - `PostCard.tsx`
    - `PostItemModal.tsx`
    - `PostViewModal.tsx`

### C. Landing Page & Marketing Copy
- **`frontend/features/LandingPage/LandingPageContent/HeroSection.tsx`**:
  - Update tagline copy: Replace `"From school events to lost & found,"` with `"From campus news to student discussions,"`.
  - Replace the floating card icon using `/found.svg` with `/Schedule.svg` to maintain floating layout symmetry.
- **`frontend/features/LandingPage/LandingPageContent/ProjectInfoSection.tsx`**:
  - Replace `"It centralizes Announcements, Feeds, and Lost & Found."` with `"It centralizes Announcements, Feeds, and Academic Resources."`.
  - Replace `"Integrated Lost & Found"` in the feature checklist with `"Official Campus Announcements"`.
- **`frontend/features/LandingPage/LandingPageContent/LandingPageContent.tsx`**:
  - Remove `"Lost & Found"` entry from the footer navigation links array.
- **`frontend/features/LandingPage/LandingPageTab/SignUpForms.tsx`**:
  - Update sidebar copy from `"...PLC scheduling, Lost & Found resources, and community feeds."` to `"...PLC scheduling, Calendar management, and community feeds."`.
- **`frontend/features/LandingPage/LandingPageContent/TeamSection.tsx`**:
  - Update Clark Jaca's bio from `"Crafted the Landing Page and the visual layout for the Lost and Found feature."` to `"Crafted the Landing Page and the visual layout for core student features."`.

### D. Static Assets
- Remove `frontend/public/lost.svg`
- Remove `frontend/public/found.svg`

---

## 3. Verification & Testing
1. Run Next.js build / typecheck (`npm run build` or `npx tsc --noEmit`) to verify zero broken imports or references to `LostandFound` or `LostAndFoundPosts`.
2. Grep search the entire repository to ensure zero stale mentions of `LostandFound` or `Lost & Found`.
