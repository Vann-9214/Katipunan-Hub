# Remove Messages Functionality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely remove all private messaging (PM/chat) code, routes, components, helpers, and integration points across the Katipunan-Hub codebase.

**Architecture:** Remove cross-feature messaging buttons and helpers from Account, Lost & Found, and PLC features first, clean up the top navigation header (`HomepageTab.tsx`), delete the `Message` pages, feature components, and Supabase auth helper, and verify full build/typecheck cleanly.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Supabase JS Client

## Global Constraints
- Only remove direct/private messaging (chat) functionality; do not modify public posts, comments, announcements, feeds, or non-PM functionality.
- Ensure all TypeScript types and imports compile cleanly without dangling references or unused imports.

---

### Task 1: Clean Up Account and Lost & Found Features

**Files:**
- Modify: `frontend/features/Account/accountContent.tsx`
- Modify: `frontend/features/LostandFound/PostViewModal.tsx`
- Modify: `frontend/features/LostandFound/LostandFoundcontent.tsx`

**Interfaces:**
- Removes: `handleChatClick` in `accountContent.tsx`
- Removes: `onChat` prop from `PostViewModalProps` in `PostViewModal.tsx`
- Removes: `handleOpenChat` and `navigateToNewChat` in `LostandFoundcontent.tsx`

- [ ] **Step 1: Modify `accountContent.tsx` to remove the Chat button and navigation logic**
  - Remove `import { getSortedUserPair } from "@/database/supabase/Message/auth";` and `MessageCircle` from `lucide-react`.
  - Remove `handleChatClick` function.
  - In JSX, when `!isOwnProfile`, remove the `<motion.button onClick={handleChatClick}>` Chat button.

- [ ] **Step 2: Modify `PostViewModal.tsx` to remove Chat button**
  - Remove `MessageCircle` from `lucide-react`.
  - Remove `onChat: () => void;` from `PostViewModalProps`.
  - In footer actions for non-owner and open post, remove the `<button onClick={onChat}>` "Chat with Uploader" block.

- [ ] **Step 3: Modify `LostandFoundcontent.tsx` to remove Chat handler**
  - Remove `handleOpenChat` and `navigateToNewChat` methods.
  - Remove `onChat={handleOpenChat}` prop on `<PostViewModal />`.

- [ ] **Step 4: Commit changes**
```bash
git add frontend/features/Account/accountContent.tsx frontend/features/LostandFound/PostViewModal.tsx frontend/features/LostandFound/LostandFoundcontent.tsx
git commit -m "refactor: remove messaging buttons and handlers from Account and Lost & Found"
```

---

### Task 2: Clean Up Peer Learning Center (PLC) Messaging

**Files:**
- Modify: `frontend/features/PLC/fullDetails.tsx`
- Modify: `frontend/database/supabase/PLC/usePLCBooking.ts`

**Interfaces:**
- Removes: `handleChatClick` and `isChatLoading` in `fullDetails.tsx`
- Removes: rating chat message creation step in `usePLCBooking.ts`

- [ ] **Step 1: Modify `fullDetails.tsx` to remove Chat button and message creation**
  - Remove `MessageCircle` from `lucide-react`.
  - Remove `import { getSortedUserPair } from "@/database/supabase/Message/auth";`.
  - Remove `isChatLoading` state and `handleChatClick` function.
  - In JSX, remove the `computedStatus === "Approved"` Chat button.

- [ ] **Step 2: Modify `usePLCBooking.ts` to remove rating chat insertion**
  - Remove `import { getSortedUserPair } from "../Message/auth";`.
  - In `rateTutor`, remove step 3 ("Send Chat Message" try/catch block querying `Conversations` and inserting into `Messages`).

- [ ] **Step 3: Commit changes**
```bash
git add frontend/features/PLC/fullDetails.tsx frontend/database/supabase/PLC/usePLCBooking.ts
git commit -m "refactor: remove messaging logic and chat button from PLC"
```

---

### Task 3: Clean Up Navigation Header (`HomepageTab.tsx`)

**Files:**
- Modify: `frontend/components/HomepageTab.tsx`

**Interfaces:**
- Removes: Chat icon button, `ChatPopup` modal, unread badge, and realtime `Messages` listener

- [ ] **Step 1: Modify `HomepageTab.tsx`**
  - Remove `import ChatPopup from "../features/Message/ChatPopup/chatPopup";`.
  - Remove `isChatPopupOpen` state and `chatUnreadCount` state.
  - Remove `fetchChatUnreadCount` and the `useEffect` with Supabase channel listening on table `Messages`.
  - In `handleBellClick` and `useEffect([pathname])`, remove `setIsChatPopupOpen(false)`.
  - Remove `const isOnMessagePage = pathname.startsWith("/Message");`.
  - In JSX, remove the entire Chat Icon button block and `<ChatPopup />` modal block.

- [ ] **Step 2: Commit changes**
```bash
git add frontend/components/HomepageTab.tsx
git commit -m "refactor: remove chat popup and unread badge from top navigation"
```

---

### Task 4: Delete Message Pages, Components, and Supabase Auth Helper

**Files:**
- Delete: `frontend/app/(pages)/Message/` (all files: `page.tsx`, `layout.tsx`, `[ConversationId]/page.tsx`, `new/[userId]/page.tsx`)
- Delete: `frontend/features/Message/` (all files: `ChatPopup/`, `ConversationWindow/`, `Sidebar/`, `Utils/`)
- Delete: `frontend/database/supabase/Message/` (`auth.ts`)

- [ ] **Step 1: Delete directories and files**
```bash
rm -rf "frontend/app/(pages)/Message"
rm -rf "frontend/features/Message"
rm -rf "frontend/database/supabase/Message"
```

- [ ] **Step 2: Commit file deletions**
```bash
git add -A
git commit -m "refactor: delete Message pages, components, and auth helper"
```

---

### Task 5: Build & Typecheck Verification

**Files:**
- Verification only

- [ ] **Step 1: Run Next.js build / typecheck in `frontend`**
```bash
cd frontend && npm run build
```
- [ ] **Step 2: Verify zero compilation errors or broken references**
- [ ] **Step 3: Commit any final cleanup if needed**
