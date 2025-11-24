"use client";

import Link from "next/link";
import { User, LogOut } from "lucide-react";
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
      className="w-64 bg-white rounded-lg shadow-xl border border-gray-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* User Info Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-3 p-4"
      >
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
      </motion.div>

      <hr className="border-black/50 mx-4" />

      {/* Menu Links */}
      <nav className="p-2">
        <motion.div variants={itemVariants}>
          <Link
            href="/Account"
            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[16px] hover:bg-maroon/5 hover:text-maroon transition-colors group"
            onClick={onClose}
          >
            <User className="w-[24px] h-[24px] text-black group-hover:text-maroon" />
            <span>Account</span>
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

      <hr className="border-black/50 mx-4" />

      {/* Log Out Button */}
      <motion.div variants={itemVariants} className="p-2">
        <button
          onClick={handleLogout}
          className="cursor-pointer flex items-center w-full gap-3 px-3 py-2.5 rounded-[10px] text-[16px] text-black hover:bg-maroon/5 hover:text-maroon transition-colors group"
        >
          <LogOut className="w-[24px] h-[24px] text-black group-hover:text-maroon" />
          <span>Log Out</span>
        </button>
      </motion.div>
    </motion.div>
  );
}
