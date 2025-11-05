"use client";

import { OtherAccount } from "../Utils/types";
import Avatar from "@/app/component/ReusableComponent/Avatar";

export default function SearchResultItem({
  account,
  onClick,
}: {
  account: OtherAccount;
  onClick: (account: OtherAccount) => void;
}) {
  return (
    <div
      onClick={() => onClick(account)}
      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-100"
    >
      <Avatar
        avatarURL={account.avatarURL}
        altText={account.fullName}
        className="w-12 h-12 border-2 border-black"
      />
      <div className="flex-1 overflow-hidden">
        <h3 className="font-semibold text-gray-800 truncate">
          {account.fullName}
        </h3>
      </div>
    </div>
  );
}
