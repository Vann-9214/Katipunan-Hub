export interface NotificationItem {
  id: string;
  title: string;
  created_at: string;
  visibility: string | null;
  type: "announcement" | "system";
  redirect_url?: string;
}
