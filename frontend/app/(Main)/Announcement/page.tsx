import { Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AnnouncementPageContent from "@/components/General/Announcement/AnnouncementContent/AnnouncementContent";
import LoadingScreen from "@/components/ReusableComponent/LoadingScreen";

export default function AnnouncementPage() {
  return (
    <div>
      <Suspense fallback={<LoadingScreen />}>
        <AnnouncementPageContent />
      </Suspense>
      <SpeedInsights />
    </div>
  );
}
