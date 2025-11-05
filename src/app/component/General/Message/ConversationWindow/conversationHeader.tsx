"use client";

import Avatar from "@/app/component/ReusableComponent/Avatar";
import { OtherUser } from "../Utils/types";

export default function ConversationHeader({
  otherUser,
}: {
  otherUser: OtherUser | null;
}) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200 shadow-sm bg-gray-50">
      <Avatar
        avatarURL={otherUser?.avatarURL}
        altText={otherUser?.fullName || "User"}
        className="w-10 h-10 border border-gray-300"
      />
      <h2 className="font-semibold text-lg text-gray-800">
        {otherUser?.fullName || "Other User Name"}
      </h2>
    </div>
  );
}
