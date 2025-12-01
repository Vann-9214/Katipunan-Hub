export interface Message {
  id: string;
  created_at: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  read_at: string | null;
  image_url?: string | null;
  file_name?: string | null;
}

export interface OtherUser {
  id: string;
  fullName: string;
  avatarURL: string | null;
  role?: string;
  course?: string;
  studentID?: string;
  year?: string;
}

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

export interface ConversationItem {
  id: string;
  otherUserName: string;
  lastMessagePreview: string;
  avatarURL: string | null;
  timestamp: string;
  unreadCount: number;
}