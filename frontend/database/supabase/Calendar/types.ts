export interface DBEvent {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  date: string;
  year: number;
  month: number;
  day: number;
  audience: "Personal" | "Global";
  courses: string[] | null;
  created_by_name: string | null;
  created_by_role: string | null;
}

export interface CreateEventInput {
  user_id: string;
  title: string;
  date: string;
  year: number;
  month: number;
  day: number;
  audience: string;
  courses: string[] | null;
  created_by_name: string | null;
  created_by_role: string | null;
}
