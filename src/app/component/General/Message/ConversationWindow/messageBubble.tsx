"use client";

import { Message } from "../Utils/types";

export default function MessageBubble({
  message,
  isCurrentUser,
}: {
  message: Message;
  isCurrentUser: boolean;
}) {
  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs md:max-w-md p-3 rounded-xl ${
          isCurrentUser
            ? "bg-[#8B0E0E] text-white rounded-br-none"
            : "bg-gray-200 text-gray-800 rounded-bl-none"
        }`}
      >
        <p>{message.content}</p>
        <span className="text-xs opacity-70 mt-1 block text-right">
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
