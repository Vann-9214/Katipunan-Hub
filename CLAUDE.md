# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root unless noted.

```bash
npm install                # installs both workspaces
npm run dev                # runs every workspace's dev script concurrently
npm run build              # builds every workspace that has a build script

cd frontend && npm run dev     # Next.js dev server on :3000 (falls back to :3001 if taken)
cd frontend && npm run build   # production build
cd frontend && npm run lint    # eslint
cd backend  && npm run dev     # Express on :4000 (ts-node-dev)
```

### Verifying changes

There is **no test suite** — no test runner, config, or test files exist. Verification is
typecheck, lint, and exercising the app in a browser.

`next.config.ts` sets both `eslint.ignoreDuringBuilds: true` and
`typescript.ignoreBuildErrors: true`, so **a successful `npm run build` proves nothing about
type or lint correctness.** Always check explicitly:

```bash
cd frontend
npx tsc --noEmit                    # whole project
npx eslint features/<Feature>       # scope to what you touched
```

`npx tsc --noEmit` currently reports one pre-existing error in
`features/Announcement/components/UploadImage.tsx` (a `title` prop that isn't on
`ImageLightboxModalProps`). Treat that one as baseline noise; anything else is yours.

## Architecture

npm workspaces monorepo: `frontend/` (Next.js 15 App Router, React 19) and `backend/`
(Express). Data and auth are Supabase.

### The Express backend is vestigial — don't assume it does the work

`backend/` exposes exactly one route, and it returns a hardcoded
`{ success: true }` without doing anything. The real tutor-application flow (nodemailer over
Gmail) lives in the **Next.js route handler** at `frontend/app/api/tutor-application/route.ts`,
and the frontend posts to `/api/tutor-application` — never to `:4000`. Nothing in the
frontend calls the Express server. New server work almost certainly belongs in a Next route
handler, not in `backend/`.

### Three layers in the frontend

```
app/(pages)/<Name>/page.tsx   thin route shell
  └─ features/<Name>/<Name>Content.tsx   the actual screen
       ├─ components/   feature-local UI
       ├─ hooks/        state + data orchestration
       └─ utils/        feature-local helpers + framer-motion variants
            └─ database/supabase/<Domain>/   all Supabase access
```

Route pages stay thin — they render `HomepageTab` plus the feature's `*Content` component,
and sometimes fetch the current user for the header. Put real logic in the feature module.

Route segments are **capitalized**: `/PLC`, `/Announcement`, `/Calendar`, `/Leaderboard`,
`/Account`, `/Profile/[id]`.

### Supabase data layer

`frontend/database/supabase/<Domain>/` holds one exported function per file, re-exported
through a barrel `index.ts`. Import from the barrel, not the deep path:

```ts
import { getBookings, subscribeToPLCBookings } from "@/database/supabase/PLC";
```

Domains: `Account`, `Announcement`, `Calendar`, `General`, `LandingPage`, `Leaderboard`,
`Notification`, `PLC`. When adding a function, create the file *and* add it to that domain's
`index.ts` — the barrel is not automatic.

Realtime follows a fixed shape: each domain has a `subscribeToX.ts` that opens a
`postgres_changes` channel and **returns an unsubscribe function**. Feature hooks own the
subscription lifecycle and refetch on change. Note Supabase table names are PascalCase
(announcements live in `Posts`, not `announcements`).

### Auth

Uses `@supabase/ssr` with two distinct clients:

- **Browser**: a single shared instance exported from
  `database/supabase/General/supabaseClient.ts`. Use this in `"use client"` code; don't
  construct another.
- **Server**: built per-request via `createServerClient` with cookie handlers, in
  `middlewares/authMiddleware.ts` and `app/auth/callback/route.ts`.

`middleware.ts` protects every path except the public ones listed in its matcher regex
(landing page, `api`, static assets, `auth/callback`, `AboutUs`, `Features`). Unauthenticated
requests get redirected to `/signin` carrying a `redirectedFrom` query param.

**Gotcha:** there is no `/signin` or `/signup` route in `app/` — sign in and sign up are a
modal rendered over the landing page at `/` (the `LandingPage` feature). So the middleware's
redirect target 404s. Successful sign-in reads `redirectedFrom` and otherwise sends users to
`/Announcement`; the email-confirmation callback always lands on `/Announcement`.

Sign-up enforces the `@cit.edu` email domain. That constant, plus the course and year-level
lists, live in `database/supabase/constants.ts`.

## Conventions

- `@/*` resolves to the **`frontend/` root** — there is no `src/` directory. So
  `@/features/...`, `@/database/...`, `@/components/...`.
- `cn()` is at `@/database/utils`, not `@/lib/utils` — `components.json` points shadcn's
  `utils` alias into `database/`.
- shadcn/ui ("new-york", lucide icons) lives in `components/ui/`. Bespoke shared components
  sit at the top level of `components/`.
- Tailwind v4, configured CSS-first: `app/globals.css` imports `tailwindcss` then
  `styles/theme.css`, `styles/scrollbar.css`, and `styles/animations.css`. Shared keyframes
  belong in `styles/animations.css`, not inline.
- Animation is framer-motion. Reusable variants go in the feature's `utils/variants.ts`.
- `next.config.ts` pins `images.remotePatterns` to a single Supabase storage hostname —
  images from any other host will fail until it's added.

### Env vars

Read from `frontend/.env`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`GMAIL_USER`, `GMAIL_APP_PASSWORD`.

### Animated overlays are performance-sensitive

The landing page stacks large `backdrop-blur` surfaces (nav bar, glass cards, modal
scrim). Translating a big subtree over those forces a full repaint plus a backdrop
re-rasterize every frame. When animating a large panel: promote it with
`will-change: transform` for the duration of the movement and release it at rest, keep both
panels mounted rather than mounting one mid-transition, and memoize heavy form subtrees so a
state flip doesn't re-reconcile them. `features/LandingPage/components/LandingPageTab.tsx`
implements this pattern and documents the measurements behind it.

Verify motion changes by measuring, not by eye — a transition that *looks* choppy is
usually one stalled frame at the start, not a low frame rate, and the two have completely
different fixes. Drive real Chrome with a CPU throttle (`Emulation.setCPUThrottlingRate`,
4x ≈ mid-range laptop, 6x ≈ mid-range phone) and sample `requestAnimationFrame` deltas
across the interaction. Sustained 20–40ms deltas mean a genuine per-frame cost; one long
delta then smooth frames means something blocked the start.

### The auth modal is a two-slide carousel

Sign in and sign up are **both mounted for the whole life of the modal** (see the
performance note above). `AUTH_PANEL_RESTING_OFFSET` in `utils/variants.ts` parks sign in
at `-100%` and sign up at `100%`; whichever matches `authMode` animates to `0`. Travel
direction is therefore implicit — do not reintroduce a `direction` state.

Consequences worth knowing before editing either form:

- **`layoutId` must be unique per component instance.** Two toggles are now on screen at
  once, so a hardcoded shared `layoutId` makes framer-motion treat them as one element:
  the pill migrates to whichever rendered last and vanishes from the other, leaving
  `text-white` labels invisible on white. `components/ToggleButton.tsx` derives its id from
  `useId()`. The same trap applies to any `layoutId` inside these panels.
- **No `autoFocus` in the forms.** It only fires on mount and the two panels would fight
  over it. `AuthPanel` focuses the first input on animation complete instead, and marks the
  off-screen panel `inert` to keep it out of the tab order.
- **The two panels' right-hand columns are kept structurally identical** — same top-anchored
  container, header block, toggle wrapper, and a bottom-pinned trailing block for the submit
  button — so the toggle and submit button land at the same pixel on both. They are
  top-anchored rather than centred because centring makes position depend on each form's
  content height. Sign up is near its height budget; adding a field there will push its
  trailing block out of alignment with sign in.

### Page background and overscroll

`app/globals.css` paints `html, body` white, and the landing page's maroon comes from a
child of the hero rather than the root. The rubber-band overscroll region is painted with
the *root* background, so bouncing past the top would otherwise flash white — which is why
that rule also sets `overscroll-behavior-y: none`. Give any new full-bleed page its colour
on the root, or keep the bounce suppressed.
