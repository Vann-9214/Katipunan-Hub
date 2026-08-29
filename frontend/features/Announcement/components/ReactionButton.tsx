"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { reactionsList, getReactionIcon } from "../utils/reactionsConfig";
import { motion, AnimatePresence } from "framer-motion";

interface ReactionButtonProps {
  selectedReactionId: string | null;
  isLoading?: boolean;
  onReactionSelect: (id: string) => void;
  onMainButtonClick: () => void;
  size?: "sm" | "md";
}

export default function ReactionButton({
  selectedReactionId,
  isLoading = false,
  onReactionSelect,
  onMainButtonClick,
  size = "md",
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
    showTimeoutRef.current = setTimeout(() => setShowPicker(true), 350);
  };

  const handleMouseLeave = () => {
    clearTimeouts();
    hideTimeoutRef.current = setTimeout(() => setShowPicker(false), 250);
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
    : "text-white/90";

  const isSmall = size === "sm";

  return (
    <div
      className="relative flex-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Reaction Picker Flyout */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            key="reaction-picker-flyout"
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.85 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.35 }}
            onMouseEnter={handlePickerMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 h-[48px] px-2 gap-1.5 flex items-center justify-center bg-[#2a0404]/95 backdrop-blur-md rounded-full shadow-2xl z-30 border border-[#EFBF04]/40"
          >
            {reactionsList.map((reaction) => (
              <motion.button
                key={reaction.id}
                type="button"
                onClick={() => onPickerSelect(reaction.id)}
                disabled={isLoading}
                whileHover={{ scale: 1.3, y: -6 }}
                whileTap={{ scale: 0.9 }}
                className={`rounded-full p-1 focus:outline-none transition-transform ${
                  isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
                aria-label={reaction.label}
              >
                <Image
                  src={reaction.icon}
                  alt={reaction.label}
                  width={isSmall ? 26 : 30}
                  height={isSmall ? 26 : 30}
                  className="drop-shadow-md hover:drop-shadow-lg"
                />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger Button */}
      <motion.button
        type="button"
        onClick={onMainClick}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full cursor-pointer rounded-xl font-montserrat font-semibold flex items-center justify-center gap-2 transition-all select-none ${
          isSmall
            ? "py-1 px-2 text-xs text-white/70 hover:text-white"
            : "py-2 px-4 text-sm bg-white/10 hover:bg-white/20 text-white border border-white/10"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <motion.div
          key={selectedReactionId || "default"}
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 450, damping: 15 }}
          className="shrink-0 flex items-center justify-center"
        >
          <Image
            src={currentIcon}
            alt={currentLabel}
            width={isSmall ? 16 : 20}
            height={isSmall ? 16 : 20}
            className={
              !selectedReactionId
                ? "invert brightness-0 opacity-80"
                : "drop-shadow"
            }
          />
        </motion.div>
        <span className={currentColorClass}>{currentLabel}</span>
      </motion.button>
    </div>
  );
}
