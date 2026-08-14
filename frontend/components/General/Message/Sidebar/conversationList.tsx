// src/app/component/General/Message/Sidebar/conversationList.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Conversation } from "../Utils/types";
import ConversationItem from "./conversationItem";
import { motion, AnimatePresence } from "framer-motion";

export default function ConversationList({
  title,
  conversations,
  onUpdate,
  currentUserId,
}: {
  title: string;
  conversations: Conversation[];
  onUpdate: () => void;
  currentUserId: string | undefined;
}) {
  const [isOpen, setIsOpen] = useState(true);
  if (conversations.length === 0) return null;

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-2 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded transition-colors"
      >
        <span>
          {title} ({conversations.length})
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-1">
              {conversations.map((convo) => (
                <ConversationItem
                  key={convo.id}
                  conversation={convo}
                  onUpdate={onUpdate}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
