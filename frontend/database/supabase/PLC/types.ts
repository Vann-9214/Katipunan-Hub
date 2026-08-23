export interface TutorRating {
  rating: number;
  review: string;
}

export interface Booking {
  id: string;
  subject: string;
  startTime: string;
  endTime?: string;
  status: string;
  description?: string;
  bookingDate: string;
  studentId: string;
  approvedBy?: string;
  hasRejected?: boolean;
  createdAt?: string;
  Accounts?: {
    fullName: string;
    course: string;
    year: string;
    studentID: string;
    avatarURL: string;
  };
  Tutor?: {
    id: string;
    fullName: string;
    avatarURL: string | null;
  };
  TutorRatings?: TutorRating[];
}

export type MonthBooking = Pick<
  Booking,
  "id" | "bookingDate" | "status" | "approvedBy" | "startTime" | "endTime"
>;

export interface BookingStats {
  totalTutors: number;
  rejectionCount: number;
}

export interface CreateBookingParams {
  studentId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  subject: string;
  description?: string;
  status?: string;
}

export type RatingsMap = Map<string, TutorRating>;
