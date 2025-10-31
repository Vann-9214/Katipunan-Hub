"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
// --- 1. Import from your new config file ---
import { reactionsList, getReactionIcon } from "./Utils/config";

// --- 2. Update Component Props ---
interface ReactionButtonProps {
  selectedReactionId: string | null;
  isLoading: boolean;
  onReactionSelect: (id: string) => void;
  onMainButtonClick: () => void;
  // --- ADDED PROPS ---
  width?: number | "full" | "auto";
  height?: number;
  textSize?: number;
  // --- END ADDED PROPS ---
}

export default function ReactionButton({
  selectedReactionId,
  isLoading,
  onReactionSelect,
  onMainButtonClick,
  // --- 3. Set default values to match original code ---
  width = "full", // Original was w-full
  height = 35, // Original was h-[35px]
  textSize = 22, // Original was text-[22px]
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

  // --- Display Value logic (Unchanged) ---
  const selectedReaction = reactionsList.find(
    (r) => r.id === selectedReactionId
  );
  const currentIcon = getReactionIcon(selectedReactionId);
  const currentLabel = selectedReaction ? selectedReaction.label : "Like";
  const currentColorClass = selectedReaction
    ? selectedReaction.colorClass
    : "text-black";

  // --- 4. Create dynamic classes from props ---
  const widthClass =
    width === "full"
      ? "w-full"
      : width === "auto"
      ? "w-auto"
      : `w-[${width}px]`;

  // Scale icon size based on text size (Original: 22px text -> 23px icon)
  const iconSize = textSize + 1;

  // --- 5. Update Render logic ---
  return (
    <div
      className="relative w-full" // Kept w-full as per original
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Reaction Picker (Unchanged) */}
      {showPicker && (
        <div
          onMouseEnter={handlePickerMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute bottom-full h-10 w-62 gap-2 left-1/2 mb-2 -translate-x-1/2 flex items-center justify-center bg-white rounded-full shadow-lg z-10"
        >
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
        // --- 6. Apply dynamic classes ---
        className={`cursor-pointer rounded-[10px] font-montserrat font-medium flex gap-1 items-center justify-center px-4 transition-colors ${
          `text-[${textSize}px]` // Apply text size
        } ${
          `h-[${height}px]` // Apply height
        } ${
          widthClass // Apply width
        } ${
          isLoading
            ? "opacity-50 cursor-not-allowed"
            : selectedReactionId
            ? "bg-transparent hover:bg-black/10"
            : "hover:bg-black/10"
        }`}
      >
        {/* --- 7. Apply dynamic icon size --- */}
        <Image
          src={currentIcon}
          alt={currentLabel}
          height={iconSize}
          width={iconSize}
        />
        <span className={currentColorClass}>{currentLabel}</span>
      </button>
    </div>
  );
}
