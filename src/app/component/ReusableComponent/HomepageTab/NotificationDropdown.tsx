"use client";

import { NotificationItem } from "../../../../../supabase/Lib/General/useNotification";
import { useRouter } from "next/navigation";
import { BellRing, Megaphone } from "lucide-react"; // Added Megaphone

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
      if (notif.redirect_url) {
        // If it has a specific link (like to a Feed post or Announcement)
        router.push(notif.redirect_url);
      } else {
        // Fallback for generic PLC system notifications
        router.push("/PLC");
      }
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
                    className="p-4 border-b border-gray-100 hover:bg-[#FFF9E5]/40 cursor-pointer transition-colors flex gap-4 group items-start"
                  >
                    {/* Icon Container - Gold Theme */}
                    <div className="mt-1 shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-[#EFBF04] to-[#F59E0B] flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <BellRing
                        size={16}
                        fill="currentColor"
                        className="text-white"
                      />
                    </div>

                    <div className="flex-1">
                      <p className="text-[14px] font-bold text-gray-800 mb-1 font-montserrat leading-snug group-hover:text-[#B48E00] transition-colors line-clamp-3">
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium font-ptsans flex items-center gap-1">
                        <span>
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span>
                          {new Date(notif.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
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
                  className="p-4 border-b border-gray-100 hover:bg-[#FDF2F2]/50 cursor-pointer transition-colors flex gap-4 group items-start"
                >
                  {/* Icon Container - Maroon Theme */}
                  <div className="mt-1 shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-[#8B0E0E] to-[#A52A2A] flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform duration-200">
                    <Megaphone size={16} className="text-white" />
                  </div>

                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-gray-700 mb-1 line-clamp-2 font-montserrat leading-relaxed group-hover:text-black transition-colors">
                      <span className="font-bold text-[#8B0E0E]">CIT-U</span>{" "}
                      added {contextText}:{" "}
                      <span className="italic">&quot;{notif.title}&quot;</span>
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium font-ptsans flex items-center gap-1">
                      <span>
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>
                        {new Date(notif.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="p-3 bg-gray-50 text-center border-t border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
          onClick={() => {
            router.push("/Announcement");
            onClose();
          }}
        >
          <button className="text-xs font-bold text-gray-500 hover:text-[#8B0E0E] transition-colors uppercase tracking-wider">
            View All Announcements
          </button>
        </div>
      </div>
    </div>
  );
}
