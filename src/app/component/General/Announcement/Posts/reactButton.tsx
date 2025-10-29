// components/ReactButton/reactButton.tsx
"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
// --- 1. Import from your new config file ---
import { reactionsList, getReactionIcon, ReactionInfo } from "./Utils/config";

// --- Component Props (Unchanged) ---
interface ReactionButtonProps {
  selectedReactionId: string | null;
  isLoading: boolean;
  onReactionSelect: (id: string) => void;
  onMainButtonClick: () => void;
}

export default function ReactionButton({
  selectedReactionId,
  isLoading,
  onReactionSelect,
  onMainButtonClick,
}: ReactionButtonProps) {
  // --- All UI state logic (showPicker, timeouts) is UNCHANGED ---
  const [showPicker, setShowPicker] = useState(false);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimeouts = () => {
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = null;
    hideTimeoutRef.current = null;
  };

  const onPickerSelect = (id: string) => {
    setShowPicker(false);
    clearTimeouts();
    onReactionSelect(id);
  };

  const onMainClick = () => {
    setShowPicker(false);
    clearTimeouts();
    onMainButtonClick();
  };

  const handleMouseEnter = () => {
    clearTimeouts();
    showTimeoutRef.current = setTimeout(() => setShowPicker(true), 800);
  };
  const handleMouseLeave = () => {
    clearTimeouts();
    hideTimeoutRef.current = setTimeout(() => setShowPicker(false), 200);
  };
  const handlePickerMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setShowPicker(true);
  };

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  // --- 2. Update Display Value logic ---
  // Find the full reaction object to get label and color
  const selectedReaction = reactionsList.find(
    (r) => r.id === selectedReactionId
  );

  // Use your helper function to get the icon
  const currentIcon = getReactionIcon(selectedReactionId);
  const currentLabel = selectedReaction ? selectedReaction.label : "Like";
  const currentColorClass = selectedReaction
    ? selectedReaction.colorClass
    : "text-black"; // Default to black if no color specified

  // --- 3. Update Render logic ---
  return (
    <div
      className="relative w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Reaction Picker */}
      {showPicker && (
        <div
          onMouseEnter={handlePickerMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute bottom-full h-10 w-62 gap-2 left-1/2 mb-2 -translate-x-1/2 flex items-center justify-center bg-white rounded-full shadow-lg z-10"
        >
          {/* Use reactionsList instead of reactions */}
          {reactionsList.map((reaction) => (
            <button
              key={reaction.id}
              onClick={() => onPickerSelect(reaction.id)}
              disabled={isLoading}
              className={`rounded-full transition-transform hover:scale-125 focus:outline-none ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-label={reaction.label}
            >
              <Image
                src={reaction.icon}
                alt={reaction.label}
                width={32}
                height={32}
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={onMainClick}
        disabled={isLoading}
        className={`cursor-pointer rounded-[10px] text-[22px] font-montserrat font-medium h-[35px] w-full flex gap-1 items-center justify-center px-4 transition-colors ${
          isLoading
            ? "opacity-50 cursor-not-allowed"
            : selectedReactionId
            ? "bg-transparent hover:bg-black/10"
            : "hover:bg-black/10"
        }`}
      >
        <Image src={currentIcon} alt={currentLabel} height={23} width={23} />
        <span className={currentColorClass}>{currentLabel}</span>
      </button>
    </div>
  );
}
