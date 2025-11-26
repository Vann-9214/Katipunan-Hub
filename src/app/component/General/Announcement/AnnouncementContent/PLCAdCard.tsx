"use client";

import { useState } from "react";
import { BookOpenText, ChevronRight } from "lucide-react";
import { Montserrat } from "next/font/google";
import PLCTutorApplicationModal from "./PLCTutorApplication";
import { createPortal } from "react-dom";

// Fonts
const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });

export default function PLCAdCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cardContent = (
    <div className="w-[320px] bg-white rounded-xl shadow-lg border border-gray-200 p-5 flex flex-col gap-4">
      {/* Header/Title */}
      <div className="flex items-start gap-3">
        <BookOpenText size={32} className="text-[#8B0E0E] shrink-0" />
        <div>
          <h3
            className={`${montserrat.className} text-xl font-bold text-black`}
          >
            Peer Learning Center
          </h3>
          <p className="text-sm text-gray-500">
            Shape the future. Become a tutor!
          </p>
        </div>
      </div>

      {/* Body */}
      <p className="text-gray-700 text-sm">
        Do you excel in your subjects? Help your fellow Tekn oys succeed and get
        paid while doing it. Apply now to become a certified peer tutor!
      </p>

      {/* Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-between px-4 py-2 bg-[#EFBF04] text-[#800000] font-bold rounded-lg transition-colors hover:bg-[#d9af09] shadow-md"
      >
        <span className={`${montserrat.className}`}>Apply to Tutor</span>
        <ChevronRight size={20} />
      </button>
    </div>
  );

  // Use createPortal to render the modal outside the main DOM flow
  const modal =
    isModalOpen && typeof document !== "undefined"
      ? createPortal(
          <PLCTutorApplicationModal
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
