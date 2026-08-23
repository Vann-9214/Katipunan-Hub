"use client";

import { MessageSquare, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import type { User } from "@/database/supabase/General/user";

interface AccountAboutProps {
  user: User;
  isOwner: boolean;
  onEditClick: () => void;
  teamsUrl: string;
}

export default function AccountAbout({
  user,
  isOwner,
  onEditClick,
  teamsUrl,
}: AccountAboutProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-3 text-white font-montserrat flex items-center gap-2">
          About
        </h2>
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          {user.bio ? (
            <p className="text-[15px] text-white/90 font-montserrat whitespace-pre-wrap leading-relaxed">
              {user.bio}
            </p>
          ) : (
            <p className="text-sm text-white/50 italic font-ptsans">
              No bio provided yet.
            </p>
          )}
        </div>
      </div>

      {/* External Communication Banner */}
      {!isOwner && (
        <div className="bg-white/10 rounded-xl p-5 border border-[#EFBF04]/30 space-y-3">
          <h3 className="text-sm font-bold text-[#EFBF04] font-montserrat uppercase tracking-wider flex items-center gap-2">
            <MessageSquare size={16} /> Direct Communication
          </h3>
          <p className="text-xs text-white/80 font-ptsans leading-relaxed">
            Connect directly with {user.fullName} for academic discussions, questions, and tutoring sessions via Microsoft Teams.
          </p>
          <a
            href={teamsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#EFBF04] hover:bg-[#FFD700] text-[#4e0505] px-4 py-2 rounded-lg font-bold text-xs transition-all"
          >
            <span>Start Chat on Teams</span>
            <ExternalLink size={12} />
          </a>
        </div>
      )}

      {isOwner && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEditClick}
          className="w-full cursor-pointer bg-[#EFBF04] hover:bg-[#FFD700] text-[#4e0505] font-bold py-2.5 rounded-xl transition-colors shadow-md font-montserrat"
        >
          Edit Bio & Details
        </motion.button>
      )}
    </div>
  );
}
