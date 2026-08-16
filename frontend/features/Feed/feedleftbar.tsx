"use client";

import type { User } from "@/database/supabase/General/user";
import Avatar from "@/components/Avatar";
import { Mail, BookOpen, GraduationCap, Pen } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

interface FeedsLeftBarProps {
  user: User | null;
}

export default function FeedsLeftBar({ user }: FeedsLeftBarProps) {
  return (
    <div className="bg-white w-[350px] left-0 top-0 fixed h-full pt-24 flex flex-col items-center overflow-y-auto border-r border-gray-100 custom-scrollbar pb-8">
      {user && (
        <div className="w-[320px]">
          <div className="w-full rounded-[24px] bg-white border border-gray-100 shadow-xl overflow-hidden relative">
            <div className="relative h-[100px] w-full bg-gray-800 overflow-hidden">
              {user.coverURL ? (
                <Image
                  src={user.coverURL}
                  alt="Cover"
                  fill
                  className="object-cover"
                  sizes="320px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#8B0E0E] to-[#4e0505] opacity-100">
                  <span className="text-white/20 font-bold text-xl select-none font-montserrat tracking-widest">
                    KATIPUNAN HUB
                  </span>
                </div>
              )}
            </div>

            <div className="px-5 pb-5 relative">
              <div className="absolute -top-12 left-5 p-[3px] bg-white rounded-full shadow-md">
                <div className="rounded-full border-2 border-[#EFBF04] p-[2px]">
                  <Avatar
                    avatarURL={user.avatarURL}
                    altText={user.fullName}
                    className="w-20 h-20"
                  />
                </div>
              </div>

              <div className="h-10 mb-2"></div>

              <h3 className="font-montserrat font-bold text-[20px] text-[#1a1a1a]">
                {user.fullName}
              </h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#8B0E0E]">
                    <Mail size={16} />
                  </div>
                  <span className="text-[13px] font-ptsans truncate max-w-[180px]">
                    {user.email}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#8B0E0E]">
                    <BookOpen size={16} />
                  </div>
                  <span className="text-[13px] font-ptsans font-bold uppercase tracking-wide">
                    {user.course}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#8B0E0E]">
                    <GraduationCap size={16} />
                  </div>
                  <span className="text-[13px] font-ptsans">
                    {user.year} Year
                  </span>
                </div>
              </div>

              <Link href="/Account" className="block mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-b from-[#4e0505] to-[#3a0000] cursor-pointer hover:bg-[#600a0a] border border-[#EFBF04]/50 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:brightness-110"
                >
                  <Pen size={18} className="text-[#EFBF04]" strokeWidth={2.5} />
                  <span className="font-montserrat">Profile</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
