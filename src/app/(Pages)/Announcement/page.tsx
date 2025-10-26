import { SpeedInsights } from "@vercel/speed-insights/next";
import AnnouncementPageContent from "@/app/component/General/Announcement/AnnouncementContent/AnnouncementContent";

export default function AnnouncementPage() {
  return (
    <div>
      <AnnouncementPageContent />
      <SpeedInsights />
    </div>
  );
}
