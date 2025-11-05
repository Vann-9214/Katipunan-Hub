"use client";

import { Send } from "lucide-react";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function MessageInput({
  newMessage,
  setNewMessage,
  onSubmit,
}: MessageInputProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="p-4 border-t border-gray-200 bg-gray-50"
    >
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Write a comment..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full pl-4 pr-12 py-3 rounded-full bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFC9C9]"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#8B0E0E] text-white hover:bg-opacity-80 transition-all"
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
}
