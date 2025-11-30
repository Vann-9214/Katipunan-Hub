"use client";

import Link from "next/link";
import { User, LogOut, ChevronRight } from "lucide-react";
import Avatar from "../../ReusableComponent/Avatar";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";
import type { User as AppUser } from "../../../../../supabase/Lib/General/user";
// 1. Import motion and Variants
import { motion, Variants } from "framer-motion";

// Component Interface
interface ProfileDropdownProps {
  user: AppUser | null;
  onClose: () => void;
}

// 2. Define Variants with explicit types to fix the error
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// Component
export default function AccountDropdown({
  user,
  onClose,
}: ProfileDropdownProps) {
  const router = useRouter();

  // Handler
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error logging out:", error.message);
    }

    router.push("/");
    router.refresh();
    onClose();
  };

  const fullName = user?.fullName || "Loading...";
  const email = user?.email || "";
  const avatarUrl = user?.avatarURL || null;

  // Render
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      // --- EDITED: Added Gold Gradient Border ---
      className="w-72 p-[2px] rounded-[20px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* --- EDITED: Added Inner White Content Wrapper --- */}
      <div className="bg-white w-full h-full rounded-[18px] overflow-hidden flex flex-col">
        {/* --- EDITED: Maroon Header --- */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3 p-5 bg-gradient-to-b from-[#4e0505] to-[#3a0000] border-b border-[#EFBF04]/30 relative overflow-hidden"
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#EFBF04]/10 blur-2xl rounded-full pointer-events-none" />

          <div className="relative z-10 shrink-0 rounded-full border-2 border-[#EFBF04] p-[1px]">
            <Avatar
              avatarURL={avatarUrl}
              altText={fullName}
              className="w-12 h-12 flex-shrink-0"
            />
          </div>
          <div className="relative z-10 min-w-0">
            <p className="font-bold font-montserrat text-[16px] text-white truncate">
              {fullName}
            </p>
            <p className="text-[12px] font-montserrat text-[#EFBF04] truncate font-medium opacity-90">
              {email}
            </p>
          </div>
        </motion.div>

        {/* Menu Links */}
        <nav className="p-2 flex flex-col gap-1">
          <motion.div variants={itemVariants}>
            <Link
              href="/Account"
              // --- EDITED: Beautified Account Item ---
              className="relative group flex items-center justify-between px-4 py-3 rounded-[12px] text-[15px] font-medium text-gray-700 hover:text-[#8B0E0E] overflow-hidden transition-all duration-300"
              onClick={onClose}
            >
              {/* Hover Background Slide */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#EFBF04]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="p-1.5 bg-gray-100 rounded-full group-hover:bg-[#EFBF04]/20 transition-colors">
                  <User className="w-[20px] h-[20px] text-gray-500 group-hover:text-[#8B0E0E]" />
                </div>
                <span className="font-montserrat group-hover:translate-x-1 transition-transform duration-200">
                  Account
                </span>
              </div>
              <ChevronRight
                size={16}
                className="text-gray-300 group-hover:text-[#EFBF04] transition-colors relative z-10"
              />
            </Link>
          </motion.div>
          {/* <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[16px] text-black hover:bg-maroon/5 hover:text-maroon transition-colors group"
          onClick={onClose}
        >
          <Settings className="w-[24px] h-[24px] text-black group-hover:text-maroon" />
          <span>Settings</span>
        </Link> */}
        </nav>

        <div className="h-px bg-gray-100 mx-4 my-1" />

        {/* Log Out Button */}
        <motion.div variants={itemVariants} className="p-2">
          <button
            onClick={handleLogout}
            // --- EDITED: Beautified Logout Item ---
            className="relative w-full cursor-pointer group flex items-center gap-3 px-4 py-3 rounded-[12px] text-[15px] font-medium text-gray-700 hover:text-red-600 overflow-hidden transition-all duration-300"
          >
            {/* Hover Background Slide */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="p-1.5 bg-gray-100 rounded-full group-hover:bg-red-100 transition-colors">
                <LogOut className="w-[20px] h-[20px] text-gray-500 group-hover:text-red-500" />
              </div>
              <span className="font-montserrat group-hover:translate-x-1 transition-transform duration-200">
                Log Out
              </span>
            </div>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
