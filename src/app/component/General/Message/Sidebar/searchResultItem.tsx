"use client";

import { OtherAccount } from "../Utils/types";
import Avatar from "@/app/component/ReusableComponent/Avatar";
import { motion } from "framer-motion";

export default function SearchResultItem({
  account,
  onClick,
}: {
  account: OtherAccount;
  onClick: (account: OtherAccount) => void;
}) {
  return (
    <motion.div
      onClick={() => onClick(account)}
      whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.05)" }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
    >
      <Avatar
        avatarURL={account.avatarURL}
        altText={account.fullName}
        className="w-12 h-12"
      />
      <div className="flex-1 overflow-hidden">
        <h3 className="font-semibold text-gray-800 truncate">
          {account.fullName}
        </h3>
      </div>
    </motion.div>
  );
}
