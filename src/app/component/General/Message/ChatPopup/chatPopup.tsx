"use client";

import { Search, Maximize2, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../../supabase/Lib/General/supabaseClient";
import { getCurrentUserDetails } from "../../../../../../supabase/Lib/General/getUser";
import type { User } from "../../../../../../supabase/Lib/General/user";
import { ConversationItem } from "../Utils/types";
import PopupConversationItem from "./popupConversationitem";
import { motion, Variants } from "framer-motion";

// ADDED List/Item Variants
const listVariants: Variants = {
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
  hidden: {
    opacity: 0,
    transition: {
      when: "afterChildren",
    },
  },
};

const itemVariants: Variants = {
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
  hidden: { opacity: 0, y: 10 },
};

// Main Chat Popup Component
export default function ChatPopup() {
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  // 1. Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserDetails();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  const currentUserId = currentUser?.id;

  // 2. Reusable Data Fetching Function (Refactored for Realtime)
  const fetchConversationsData = useCallback(
    async (isBackgroundUpdate = false) => {
      if (!currentUserId) {
        if (!isBackgroundUpdate) setLoading(false);
        return;
      }

      // Only show loading spinner on initial load, not on realtime updates
      if (!isBackgroundUpdate) setLoading(true);

      try {
        // 1. Fetch conversations (top 5)
        const { data: convoData, error: convoError } = await supabase
          .from("Conversations")
          .select(`id, user_a_id, user_b_id, last_message_at`)
          .or(`user_a_id.eq.${currentUserId},user_b_id.eq.${currentUserId}`)
          .order("last_message_at", { ascending: false })
          .limit(5);

        if (convoError) {
          console.error("Error fetching popup conversations:", convoError);
          if (!isBackgroundUpdate) setLoading(false);
          return;
        }

        // 2. Extract other user IDs and fetch accounts
        const otherUserIds = convoData.map((convo) =>
          convo.user_a_id === currentUserId ? convo.user_b_id : convo.user_a_id
        );
        const { data: accountsData } = await supabase
          .from("Accounts")
          .select("id, fullName, avatarURL")
          .in("id", otherUserIds);
        const accountsMap = new Map(
          (accountsData || []).map((acc) => [acc.id, acc])
        );

        // 3. Fetch last message content and unread count
        const conversationPromises = convoData.map(async (convo) => {
          const otherUserId =
            convo.user_a_id === currentUserId
              ? convo.user_b_id
              : convo.user_a_id;
          const otherUser = accountsMap.get(otherUserId) || {
            id: otherUserId,
            fullName: "Unknown User",
            avatarURL: null,
          };

          const { data: lastMsgData } = await supabase
            .from("Messages")
            .select("content, created_at")
            .eq("conversation_id", convo.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          // This query counts exactly how many messages are unread in THIS specific chat
          const { count: unreadCount } = await supabase
            .from("Messages")
            .select("id", { count: "exact", head: true })
            .eq("sender_id", otherUserId) // Messages from the OTHER person
            .eq("conversation_id", convo.id) // In THIS conversation
            .is("read_at", null);

          const lastMessage = lastMsgData?.content || "Start a chat...";
          const timestamp = lastMsgData?.created_at
            ? new Date(lastMsgData.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return {
            id: convo.id,
            otherUserName: otherUser.fullName,
            lastMessagePreview: lastMessage,
            avatarURL: otherUser.avatarURL,
            timestamp: timestamp,
            unreadCount: unreadCount || 0,
          } as ConversationItem;
        });

        const processedConversations = await Promise.all(conversationPromises);
        setConversations(processedConversations);
      } catch (err) {
        console.error("Error processing conversation data:", err);
      } finally {
        if (!isBackgroundUpdate) setLoading(false);
      }
    },
    [currentUserId]
  );

  // 3. Initial Load Effect
  useEffect(() => {
    fetchConversationsData();
  }, [fetchConversationsData]);

  // 4. Realtime Subscription Effect (NEW)
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("chat_popup_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Messages" },
        () => {
          // Call fetch with true to suppress the loading spinner
          fetchConversationsData(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, fetchConversationsData]);

  const filteredConversations = conversations.filter((convo) =>
    convo.otherUserName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSeeAllChats = () => {
    const navPath = "/Message";
    setTimeout(() => {
      router.push(navPath);
    }, 50);
  };

  return (
    // --- EDITED: OUTER WRAPPER (Gold Gradient) ---
    <div className="w-80 p-[2px] rounded-[20px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl border-none overflow-hidden transform transition-all duration-300 z-40">
      {/* --- EDITED: INNER WRAPPER (White) --- */}
      <div className="bg-white w-full h-full rounded-[18px] flex flex-col overflow-hidden">
        {/* --- EDITED: HEADER (Maroon Gradient) --- */}
        <div className="px-6 py-4 border-b border-[#EFBF04]/30 flex justify-between items-center bg-gradient-to-b from-[#4e0505] to-[#3a0000]">
          <h2 className="text-[20px] font-montserrat font-bold text-white tracking-wide">
            Chats
          </h2>
          <div
            onClick={handleSeeAllChats}
            title="See all chats"
            className="cursor-pointer p-1.5 rounded-full hover:bg-white/10 transition-colors group"
          >
            <Maximize2 className="w-4 h-4 text-white/80 group-hover:text-[#EFBF04]" />
          </div>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="p-4 border-b border-gray-100"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search User..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#EFBF04]/50 focus:border-[#EFBF04] transition-all"
            />
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </motion.div>

        {/* Conversation List */}
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="p-2 space-y-1 max-h-[350px] overflow-y-auto custom-scrollbar"
        >
          {loading ? (
            <div className="flex flex-col justify-center items-center py-8 space-y-2 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin text-[#EFBF04]" />
              <span className="text-xs font-medium">Loading chats...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-8 text-sm text-gray-400 italic"
            >
              {search.length > 0
                ? `No results for "${search}"`
                : "No chats found."}
            </motion.div>
          ) : (
            filteredConversations.map((item) => (
              <PopupConversationItem
                key={item.id}
                conversation={item}
                variants={itemVariants}
              />
            ))
          )}
        </motion.div>

        {/* Footer Link */}
        <button
          onClick={handleSeeAllChats}
          className="cursor-pointer block w-full text-center py-3 text-[14px] font-montserrat font-bold text-gray-600 hover:text-[#8B0E0E] bg-gray-50 hover:bg-gray-100 transition-colors border-t border-gray-100"
        >
          See all in chats
        </button>
      </div>
    </div>
  );
}
