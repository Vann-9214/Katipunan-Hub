import Posts from "@/app/component/General/Announcement/Posts";
import ImageAttachments from "@/app/component/General/Announcement/ImageAttachments";

export default function AnnouncementPage() {
  return (
    <div className="flex flex-col items-center w-full p-4 gap-5">
      <Posts />
    </div>
  );
}
