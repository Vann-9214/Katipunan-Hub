"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { reactionsList, getReactionIcon } from "./Utils/config";
import { motion, AnimatePresence } from "framer-motion";

interface ReactionButtonProps {
  selectedReactionId: string | null;
  isLoading: boolean;
  onReactionSelect: (id: string) => void;
  onMainButtonClick: () => void;
  width?: number | "full" | "auto";
  height?: number;
  textSize?: number;
}

export default function ReactionButton({
  selectedReactionId,
  isLoading,
  onReactionSelect,
  onMainButtonClick,
  width = "full",
  height = 35,
  textSize = 18,
}: ReactionButtonProps) {
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
    showTimeoutRef.current = setTimeout(() => setShowPicker(true), 500);
  };
  const handleMouseLeave = () => {
    clearTimeouts();
    hideTimeoutRef.current = setTimeout(() => setShowPicker(false), 300);
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

  const selectedReaction = reactionsList.find(
    (r) => r.id === selectedReactionId
  );
  const currentIcon = getReactionIcon(selectedReactionId);
  const currentLabel = selectedReaction ? selectedReaction.label : "Like";
  const currentColorClass = selectedReaction
    ? selectedReaction.colorClass
    : "text-black";

  const widthClass =
    width === "full"
      ? "w-full"
      : width === "auto"
      ? "w-auto"
      : `w-[${width}px]`;

  const iconSize = textSize + 1;

  return (
    <div
      className="relative w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Reaction Picker */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.4 }}
            onMouseEnter={handlePickerMouseEnter}
            onMouseLeave={handleMouseLeave}
            // INCREASED HEIGHT: h-[70px] to fit larger icons comfortably
            className="w-65 absolute bottom-full left-1/2 mb-2 -translate-x-1/2 h-[45px] px-1 gap-1 flex items-center justify-center bg-white rounded-full shadow-xl z-20 border border-gray-100"
          >
            {reactionsList.map((reaction) => (
              <motion.button
                key={reaction.id}
                onClick={() => onPickerSelect(reaction.id)}
                disabled={isLoading}
                // Big hover scale effect
                whileHover={{ scale: 1.35, y: -8 }}
                whileTap={{ scale: 0.9 }}
                className={`rounded-full focus:outline-none p-1 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
                aria-label={reaction.label}
              >
                <Image
                  src={reaction.icon}
                  alt={reaction.label}
                  // INCREASED SIZE: 48px (Much bigger than 15px)
                  width={36}
                  height={36}
                  className="hover:drop-shadow-md transition-all"
                />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={onMainClick}
        disabled={isLoading}
        // Button tactile feedback
        whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.05)" }}
        whileTap={{ scale: 0.95 }}
        className={`cursor-pointer rounded-[10px] font-montserrat font-medium flex gap-1 items-center justify-center px-4 transition-colors ${`text-[${textSize}px]`} ${`h-[${height}px]`} ${widthClass} ${
          isLoading
            ? "opacity-50 cursor-not-allowed"
            : selectedReactionId
            ? "bg-transparent"
            : ""
        }`}
      >
        <motion.div
          key={selectedReactionId || "default"}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          <Image
            src={currentIcon}
            alt={currentLabel}
            height={iconSize}
            width={iconSize}
          />
        </motion.div>
        <span className={currentColorClass}>{currentLabel}</span>
      </motion.button>
    </div>
  );
}
