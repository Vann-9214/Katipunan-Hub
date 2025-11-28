"use client";

import { NotificationItem } from "../../../../../supabase/Lib/General/useNotification";
import { useRouter } from "next/navigation";
import { BellRing } from "lucide-react"; // Import an icon for system notifs

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  isLoading: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({
  notifications,
  isLoading,
  onClose,
}: NotificationDropdownProps) {
  const router = useRouter();

  const handleItemClick = (notif: NotificationItem) => {
    // 1. Handle System/PLC Notifications
    if (notif.type === "system") {
      // Just go to their PLC page as requested
      router.push("/PLC");
      onClose();
      return;
    }

    // 2. Handle Existing Announcement Logic
    const isGlobal = !notif.visibility || notif.visibility === "global";
    const filterMode = isGlobal ? "Global" : "Course";
    router.push(`/Announcement?id=${notif.id}&filter=${filterMode}`);
    onClose();
  };

  return (
    <div className="bg-white w-[380px] rounded-xl shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[400px]">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-montserrat font-bold text-lg text-black">
          Notifications
        </h3>
      </div>

      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No new notifications.
          </div>
        ) : (
          notifications.map((notif) => {
            // --- RENDER LOGIC ---

            // A. System / PLC Notification
            if (notif.type === "system") {
              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className="p-4 border-b border-gray-100 hover:bg-yellow-50 cursor-pointer transition-colors flex gap-3"
                >
                  <div className="mt-1 shrink-0 text-[#EFBF04]">
                    <BellRing size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black mb-1">
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(notif.created_at).toLocaleDateString()} •{" "}
                      {new Date(notif.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            }

            // B. Announcement (Existing Logic)
            const isGlobal = !notif.visibility || notif.visibility === "global";
            const contextText = isGlobal
              ? "a new announcement"
              : `an announcement for ${notif.visibility?.toUpperCase()}`;

            return (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <p className="text-sm font-medium text-black mb-1 line-clamp-2">
                  <span className="font-bold text-[#8B0E0E]">CIT-U</span> added{" "}
                  {contextText}: &quot;{notif.title}&quot;
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(notif.created_at).toLocaleDateString()} •{" "}
                  {new Date(notif.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            );
          })
        )}
      </div>

      <div className="p-2 bg-gray-50 text-center border-t border-gray-100">
        <button
          onClick={() => {
            router.push("/Announcement");
            onClose();
          }}
          className="text-xs font-bold text-[#8B0E0E] hover:underline"
        >
          View All Announcements
        </button>
      </div>
    </div>
  );
}
