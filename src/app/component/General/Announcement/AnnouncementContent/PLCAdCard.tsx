// src/app/component/General/Announcement/AnnouncementContent/PLCAdCard.tsx
"use client";

import { useState } from "react";
import { BookOpenText, ChevronRight } from "lucide-react";
import { Montserrat } from "next/font/google";
import PLCTutorApplicationModal from "./PLCTutorApplication";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

// Fonts
const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });

export default function PLCAdCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cardContent = (
    // Outer static container for alignment
    <div className="relative">
      {/* DECORATIVE GOLD BORDER CONTAINER */}
      <motion.div
        // Keep motion here for the subtle lift/shadow on hover
        whileHover={{
          scale: 1.01,
          boxShadow: "0 8px 25px rgba(239, 191, 4, 0.4)",
        }}
        transition={{ duration: 0.2 }}
        className="w-[320px] p-[2px] rounded-xl bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-xl"
      >
        {/* INNER CONTENT: Maroon Gradient Theme */}
        <div className="w-full bg-gradient-to-b from-[#5D0000] to-[#3a0000] rounded-lg shadow-inner p-5 flex flex-col gap-4">
          {/* Header/Title */}
          <div className="flex items-start gap-3">
            {/* ICON: Gold color inside a translucent Maroon circle */}
            <div className="p-2 bg-white/10 rounded-full shrink-0 border border-white/20">
              <BookOpenText size={24} className="text-[#EFBF04]" />
            </div>

            <div>
              <h3
                className={`${montserrat.className} text-xl font-bold text-white`}
              >
                Peer Learning Center
              </h3>
              <p className="text-sm text-white/80">
                Shape the future. Become a tutor!
              </p>
            </div>
          </div>

          {/* Body */}
          <p className="text-white text-sm leading-relaxed">
            Do you excel in your subjects? Help your fellow Tekn oys succeed and
            get paid while doing it. Apply now to become a certified peer tutor!
          </p>

          {/* Action Button: Gold Button with Maroon Text */}
          <motion.button
            onClick={() => setIsModalOpen(true)}
            whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-[#EFBF04] text-white cursor-pointer font-bold rounded-lg transition-colors shadow-lg shadow-yellow-500/30"
          >
            <span className={`${montserrat.className}`}>Apply to Tutor</span>
            <ChevronRight size={20} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  // Use createPortal to render the modal outside the main DOM flow
  const modal =
    isModalOpen && typeof document !== "undefined"
      ? createPortal(
          <PLCTutorApplicationModal
            // FIX: You must pass the props explicitly to the component being rendered
            // TS was complaining because it was trying to pass props to the portal's container
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />,
          document.body
        )
      : null;

  return (
    <>
      {cardContent}
      {modal}
    </>
  );
}
