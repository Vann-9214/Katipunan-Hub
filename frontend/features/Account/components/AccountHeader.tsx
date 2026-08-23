"use client";

import Image from "next/image";
import { Pen, MessageSquare, ExternalLink, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import Avatar from "@/components/Avatar";
import type { User } from "@/database/supabase/General/user";

interface AccountHeaderProps {
  user: User;
  isOwner: boolean;
  onEditClick: () => void;
  teamsUrl: string;
}

export default function AccountHeader({
  user,
  isOwner,
  onEditClick,
  teamsUrl,
}: AccountHeaderProps) {
  const isTutor = user.role?.includes("Tutor") ?? false;

  return (
    <div className="pt-[20px] pb-4">
      <div className="max-w-[1095px] mx-auto px-4">
        <div className="p-[3px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-xl">
          <div className="bg-gradient-to-b from-[#4e0505] to-[#3a0000] rounded-[22px] overflow-hidden">
            {/* Cover Photo */}
            <div className="relative w-full h-[200px] md:h-[320px] bg-gray-800 overflow-hidden group">
              {user.coverURL ? (
                <Image
                  src={user.coverURL}
                  alt="Cover"
                  fill
                  className="object-cover opacity-90 transition-opacity"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-[#2a0303] to-[#4e0505]">
                  <span className="text-white/20 font-bold text-4xl select-none font-montserrat tracking-widest">
                    KATIPUNAN HUB
                  </span>
                </div>
              )}
            </div>

            {/* Profile Bar */}
            <div className="px-4 md:px-8 pb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end relative -mt-[80px] md:-mt-[50px] gap-4 md:gap-6">
                {/* Avatar */}
                <div className="relative z-10">
                  <div className="w-[150px] h-[150px] relative rounded-full overflow-hidden border-[4px] border-[#EFBF04] shadow-2xl bg-[#3a0000]">
                    <Avatar
                      avatarURL={user.avatarURL}
                      altText={user.fullName}
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* Name & Role */}
                <div className="flex-1 text-center md:text-left mb-6">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <h1 className="text-[28px] md:text-[32px] font-bold text-white font-montserrat leading-tight drop-shadow-md">
                      {user.fullName}
                    </h1>
                    {isTutor && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#EFBF04] text-[#4e0505] font-extrabold text-xs uppercase tracking-wide">
                        <GraduationCap size={14} /> PLC Tutor
                      </span>
                    )}
                  </div>
                  <p className="text-[#EFBF04] font-medium text-[15px] uppercase tracking-wide mt-1">
                    {user.role}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mb-6 md:mb-4 flex-shrink-0 flex items-center gap-3">
                  {isOwner ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onEditClick}
                      className="bg-white/10 cursor-pointer hover:bg-white/20 border border-white/30 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg backdrop-blur-sm"
                    >
                      <Pen size={16} className="text-[#EFBF04]" />
                      <span className="font-montserrat">Edit Profile</span>
                    </motion.button>
                  ) : (
                    <a
                      href={teamsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#EFBF04] hover:bg-[#FFD700] text-[#4e0505] px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:scale-105"
                    >
                      <MessageSquare size={18} className="text-[#4e0505]" />
                      <span className="font-montserrat">Message on MS Teams</span>
                      <ExternalLink size={14} className="opacity-70" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
