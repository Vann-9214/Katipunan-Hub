"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import type {
  PostUI,
  NewPostPayload,
  UpdatePostPayload,
  AddPostsProps,
} from "../utils/types";
import { AddPostModal } from "./AddPostModal";

export type { AddPostsProps };

export default function AddPosts(props: AddPostsProps) {
  const {
    externalOpen,
    onExternalClose,
    initialPost,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (typeof externalOpen === "boolean") {
      setIsOpen(externalOpen);
    }
  }, [externalOpen]);

  // Handlers
  const handleClose = () => {
    setIsOpen(false);
    onExternalClose?.();
  };

  const handleOpen = () => {
    onExternalClose?.();
    setIsOpen(true);
  };

  const iconVariants: Variants = {
    rest: { rotate: 0, scale: 1 },
    hover: {
      rotate: 90,
      scale: 1.1,
      transition: { duration: 0.3, ease: "circOut" },
    },
  };

  // Render
  return (
    <>
      {/* Trigger Bar Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
        className="w-[590px] p-[2px] rounded-[24px] bg-gradient-to-br from-[#C5A005] via-[#FFD700] to-[#B8860B] shadow-lg mb-8 relative z-0"
      >
        {/* Inner Content Wrapper */}
        <div className="w-full rounded-[22px] overflow-hidden bg-transparent relative">
          {/* Maroon Background Section */}
          <div className="bg-gradient-to-b from-[#5D0000] to-[#3a0000] h-[80px] flex items-center px-6 gap-4 shadow-inner">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="shrink-0 relative group"
            >
              <div className="absolute inset-0 bg-[#FFD700]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Image
                src="/Cit Logo.svg"
                alt="Cit Logo"
                width={48}
                height={48}
                draggable={false}
                className="drop-shadow-md relative z-10"
              />
            </motion.div>

            {/* Animated Mock Input Button */}
            <motion.button
              type="button"
              onClick={handleOpen}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              variants={{
                rest: { y: 0, scale: 1 },
                hover: {
                  y: -2,
                  scale: 1.005,
                  boxShadow:
                    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                },
                tap: {
                  y: 0,
                  scale: 0.98,
                  boxShadow:
                    "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                },
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex-1 h-[46px] bg-white/95 hover:bg-white rounded-full px-5 flex items-center justify-between text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 shadow-sm group"
            >
              <span className="font-montserrat text-[14px] text-gray-500 font-medium group-hover:text-gray-700 truncate transition-colors duration-200">
                Create new official announcement...
              </span>

              {/* Decorative 'Plus' Icon */}
              <motion.div
                variants={iconVariants}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#EFBF04] group-hover:text-white transition-colors duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {mounted && isOpen && (
          <AddPostModal
            {...props}
            initialPost={initialPost ?? null}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}
