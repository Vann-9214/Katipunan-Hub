"use client";

import Link from "next/link";
import { User, LogOut, ChevronRight } from "lucide-react";
import Avatar from "../../ReusableComponent/Avatar";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";
import type { User as AppUser } from "../../../../../supabase/Lib/General/user";
import { motion, Variants } from "framer-motion";

// Component Interface
interface ProfileDropdownProps {
  user: AppUser | null;
  onClose: () => void;
}

// Define Variants with explicit types
const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
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
      className="w-[320px] p-[2px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white w-full h-full rounded-[22px] overflow-hidden flex flex-col">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4 p-6 bg-gradient-to-b from-[#4e0505] to-[#3a0000] border-b border-[#EFBF04]/30 relative overflow-hidden"
        >
          {/* Decorative Glow */}
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-[#EFBF04]/20 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 shrink-0 rounded-full border-[2px] border-[#EFBF04] p-[2px] shadow-lg">
            <Avatar
              avatarURL={avatarUrl}
              altText={fullName}
              className="w-14 h-14 flex-shrink-0 rounded-full"
            />
          </div>
          <div className="relative z-10 min-w-0 flex flex-col justify-center">
            <p className="font-bold font-montserrat text-[17px] text-white truncate leading-tight">
              {fullName}
            </p>
            <p className="text-[12px] font-montserrat text-[#EFBF04] truncate font-medium opacity-90 mt-0.5">
              {email}
            </p>
          </div>
        </motion.div>

        {/* Menu Links */}
        <nav className="p-3 flex flex-col gap-2">
          {/* Profile Link */}
          <motion.div variants={itemVariants}>
            <Link
              href={user?.id ? `/Profile/${user.id}` : "/Account"}
              className="relative group flex items-center justify-between px-4 py-3.5 rounded-[16px] transition-all duration-300 hover:bg-[#FFF9E5]/50 border border-transparent hover:border-[#EFBF04]/20"
              onClick={onClose}
            >
              <div className="flex items-center gap-4 relative z-10">
                {/* Icon Wrapper: Gold Gradient */}
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#EFBF04] to-[#F59E0B] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                  <User className="w-[20px] h-[20px] text-white" />
                </div>
                <div>
                  <span className="block text-[15px] font-bold text-gray-800 font-montserrat group-hover:text-[#B48E00] transition-colors">
                    Profile
                  </span>
                  <span className="block text-[11px] font-medium text-gray-400 group-hover:text-gray-500">
                    View your details
                  </span>
                </div>
              </div>
              <ChevronRight
                size={18}
                className="text-gray-300 group-hover:text-[#EFBF04] group-hover:translate-x-1 transition-all duration-200"
              />
            </Link>
          </motion.div>
        </nav>

        <div className="h-px bg-gray-100 mx-5 my-1" />

        {/* Log Out Button */}
        <motion.div variants={itemVariants} className="p-3 pt-1">
          <button
            onClick={handleLogout}
            className="w-full relative group flex items-center px-4 py-3.5 rounded-[16px] transition-all duration-300 hover:bg-red-50 border border-transparent hover:border-red-100"
          >
            <div className="flex items-center gap-4 relative z-10 w-full">
              {/* Icon Wrapper: Red/Maroon Gradient */}
              <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-[#DC2626] to-[#991B1B] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                <LogOut className="w-[18px] h-[18px] text-white ml-0.5" />
              </div>
              <div className="flex flex-col items-start">
                <span className="block text-[15px] font-bold text-gray-800 font-montserrat group-hover:text-red-700 transition-colors">
                  Log Out
                </span>
                <span className="block text-[11px] font-medium text-gray-400 group-hover:text-red-400">
                  Sign out of your account
                </span>
              </div>
            </div>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
