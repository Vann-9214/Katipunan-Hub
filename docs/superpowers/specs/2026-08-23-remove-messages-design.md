# Design Spec: Removal of Private Messaging (PM) Feature

## 1. Overview
Remove all private messaging (PM/chat) functionality across Katipunan-Hub, including the `/Message` pages, the top navigation chat popup and badge, and all PM action buttons across other features (Account profile, Lost & Found post view, and PLC tutoring details). Public posts, feeds, announcements, and other non-PM features remain completely unaffected.

---

## 2. Changes Summary

### 2.1 File Deletions
- `frontend/app/(pages)/Message/` (All routing files: `layout.tsx`, `page.tsx`, `[ConversationId]/page.tsx`, `new/[userId]/page.tsx`)
- `frontend/features/Message/` (All UI components: `ChatPopup/`, `ConversationWindow/`, `Sidebar/`, `Utils/`)
- `frontend/database/supabase/Message/` (`auth.ts`)

### 2.2 Navigation & Top Bar (`frontend/components/HomepageTab.tsx`)
- Remove `ChatPopup` import and usage.
- Remove Chat button icon next to notification bell.
- Remove `isChatPopupOpen` state.
- Remove `chatUnreadCount` state, `fetchChatUnreadCount()` function, and Supabase realtime listener on `Messages` table.
- Remove `isOnMessagePage` check.

### 2.3 Account Feature (`frontend/features/Account/accountContent.tsx`)
- Remove `MessageCircle` icon import and `getSortedUserPair` import.
- Remove `handleChatClick` function.
- Remove the "Chat" button displayed on other users' profile headers.

### 2.4 Lost & Found Feature
- `frontend/features/LostandFound/PostViewModal.tsx`:
  - Remove `onChat` prop from `PostViewModalProps`.
  - Remove "Chat with Uploader" button and `MessageCircle` icon.
- `frontend/features/LostandFound/LostandFoundcontent.tsx`:
  - Remove `handleOpenChat` and `navigateToNewChat` functions.
  - Remove `onChat` prop passed to `<PostViewModal />`.

### 2.5 Peer Learning Center (PLC) Feature
- `frontend/features/PLC/fullDetails.tsx`:
  - Remove `MessageCircle` icon and `getSortedUserPair` import.
  - Remove `handleChatClick` function, `isChatLoading` state, and direct `Messages`/`Conversations` Supabase queries.
  - Remove "Chat" button for approved bookings.
- `frontend/database/supabase/PLC/usePLCBooking.ts`:
  - Remove `getSortedUserPair` import.
  - Remove rating chat message insertion logic in `rateTutor`.

---

## 3. Verification
- Run Next.js build / TypeScript typecheck (`npm run build`) in `frontend` to guarantee no broken imports or missing types.
- Verify page navigation and modal interactions in Account, Lost & Found, and PLC.
