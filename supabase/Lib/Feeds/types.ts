export interface FeedPost {
  id: string;
  content: string;
  images: string[];
  created_at: string;
  author: {
    id: string;
    fullName: string;
    avatarURL: string | null;
    role: string;
  };
}

export interface PLCHighlight {
  id: string; // booking id or rating id
  tutorName: string;
  tutorAvatar: string | null;
  studentName: string;
  rating: number;
  review: string;
  subject: string;
  created_at: string;
}