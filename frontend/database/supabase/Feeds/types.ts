export interface PLCHighlight {
  id: string; // booking id or rating id
  tutorId: string; // Added tutorId for linking
  tutorName: string;
  tutorAvatar: string | null;
  studentName: string;
  rating: number;
  review: string;
  subject: string;
  created_at: string;
}