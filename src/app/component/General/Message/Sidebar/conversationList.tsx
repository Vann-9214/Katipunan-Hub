"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Conversation } from "../Utils/types";
import ConversationItem from "./conversationItem";

export default function ConversationList({
  title,
  conversations,
}: {
  title: string;
  conversations: Conversation[];
}) {
  const [isOpen, setIsOpen] = useState(true);
  if (conversations.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-2 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded"
      >
        <span>
          {title} ({conversations.length})
        </span>
        <ChevronDown
          size={18}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="mt-2 space-y-1">
          {conversations.map((convo) => (
            <ConversationItem key={convo.id} conversation={convo} />
          ))}
        </div>
      )}
    </div>
  );
}
