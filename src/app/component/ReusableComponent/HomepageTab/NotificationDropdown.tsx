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
    // --- EDITED: OUTER WRAPPER (Gold Gradient) ---
    <div className="w-[380px] p-[2px] rounded-[20px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl">
      {/* --- EDITED: INNER WRAPPER (White) --- */}
      <div className="bg-white w-full h-full rounded-[18px] overflow-hidden flex flex-col max-h-[450px]">
        {/* --- EDITED: HEADER (Maroon Gradient) --- */}
        <div className="px-6 py-4 border-b border-[#EFBF04]/30 bg-gradient-to-b from-[#4e0505] to-[#3a0000] flex justify-between items-center">
          <h3 className="font-montserrat font-bold text-[18px] text-white tracking-wide">
            Notifications
          </h3>
          <div className="text-[10px] font-bold text-[#EFBF04] bg-white/10 px-2 py-1 rounded-md border border-white/10">
            Recent
          </div>
        </div>

        {/* List Body */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
              <div className="w-2 h-2 bg-[#EFBF04] rounded-full animate-ping" />
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500 italic">
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
                    className="p-4 border-b border-gray-100 hover:bg-[#EFBF04]/5 cursor-pointer transition-colors flex gap-3 group"
                  >
                    <div className="mt-1 shrink-0 text-[#EFBF04] bg-[#EFBF04]/10 p-2 rounded-full h-fit">
                      <BellRing size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-1 font-montserrat leading-snug group-hover:text-black">
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">
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
              const isGlobal =
                !notif.visibility || notif.visibility === "global";
              const contextText = isGlobal
                ? "a new announcement"
                : `an announcement for ${notif.visibility?.toUpperCase()}`;

              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <p className="text-sm font-medium text-gray-700 mb-1 line-clamp-2 font-montserrat leading-snug group-hover:text-black">
                    <span className="font-bold text-[#8B0E0E]">CIT-U</span>{" "}
                    added {contextText}: &quot;{notif.title}&quot;
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
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

        {/* Footer */}
        <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
          <button
            onClick={() => {
              router.push("/Announcement");
              onClose();
            }}
            className="text-xs font-bold text-gray-500 hover:text-[#8B0E0E] transition-colors uppercase tracking-wider"
          >
            View All Announcements
          </button>
        </div>
      </div>
    </div>
  );
}
