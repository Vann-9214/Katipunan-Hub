// Chat Popup
export interface ConversationItem {
  id: string;
  otherUserName: string;
  lastMessagePreview: string;
  avatarURL: string | null;
  timestamp: string; // Formatted time
  unreadCount: number; // Crucial for 'active' state
}

// Sidebar

export interface OtherAccount {
  id: string;
  fullName: string;
  avatarURL: string | null;
}

export interface Conversation {
  id: string;
  last_message_at: string;
  is_favorite: boolean;
  is_blocked: boolean;
  otherUser: OtherAccount;
  lastMessageContent: string;
  unreadCount: number;
}

// Conversation Window

// --- Types ---
export interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
}

export interface OtherUser {
  id: string;
  fullName: string;
  avatarURL: string | null;
}