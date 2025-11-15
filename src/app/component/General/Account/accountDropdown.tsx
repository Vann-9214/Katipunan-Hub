// ProfileDropdown.tsx
"use client";

import Link from "next/link";
import { User, Settings, LogOut } from "lucide-react";
import Avatar from "../../ReusableComponent/Avatar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUserDetails } from "../../../../../supabase/Lib/General/getUser";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";
interface ProfileDropdownProps {
  onClose: () => void;
}

export default function AccountDropdown({ onClose }: ProfileDropdownProps) {
  const router = useRouter();

  const [fullName, setFullName] = useState<string>("Loading...");
  const [email, setEmail] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDetails = await getCurrentUserDetails();

      if (!userDetails) {
        router.push("/signin");
        return;
      }
      setFullName(userDetails.fullName || "User");
      setEmail(userDetails.email || "No email");
      setAvatarUrl(userDetails.avatarURL || null);
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error logging out:", error.message);
    }

    router.push("/");
    router.refresh();
    onClose();
  };

  return (
    <div
      className="w-64 bg-white rounded-lg shadow-xl border border-gray-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* User Info Header */}
      <div className="flex items-center  gap-3 p-4">
        <Avatar
          avatarURL={avatarUrl}
          altText={fullName}
          className="w-12 h-12 flex-shrink-0"
        />
        <div>
          <p className="font-semibold font-montserrat text-[18px] text-black">
            {fullName}
          </p>
          <p className="text-[14px] font-montserrat text-black/70">{email}</p>
        </div>
      </div>

      <hr className="border-black/50 mx-4" />

      {/* Menu Links */}
      <nav className="p-2">
        <Link
          href="/Account"
          className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[16px] hover:bg-maroon/5 hover:text-maroon transition-colors group"
          onClick={onClose}
        >
          <User className="w-[24px] h-[24px] text-black group-hover:text-maroon" />
          <span>Account</span>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[16px] hover:bg-maroon/5 hover:text-maroon transition-colors group"
          onClick={onClose}
        >
          <Settings className="w-[24px] h-[24px] text-black group-hover:text-maroon" />
          <span>Settings</span>
        </Link>
      </nav>

      <hr className="border-black/50 mx-4" />

      {/* Log Out Button */}
      <div className="p-2">
        <button
          onClick={handleLogout}
          className="cursor-pointer flex items-center w-full gap-3 px-3 py-2.5 rounded-[10px] text-[16px] hover:bg-maroon/5 hover:text-maroon transition-colors group"
        >
          <LogOut className="w-[24px] h-[24px] text-black group-hover:text-maroon" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
