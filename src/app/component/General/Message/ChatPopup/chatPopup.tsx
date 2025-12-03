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
          .select(
            `id, user_a_id, user_b_id, last_message_at, user_a_is_blocked_by_b, user_b_is_blocked_by_a`
          )
          .or(`user_a_id.eq.${currentUserId},user_b_id.eq.${currentUserId}`)
          .order("last_message_at", { ascending: false })
          .limit(10); // Fetched slightly more to filter blocked

        if (convoError) {
          console.error("Error fetching popup conversations:", convoError);
          if (!isBackgroundUpdate) setLoading(false);
          return;
        }

        // 2. Filter blocked conversations
        const visibleConversations = convoData.filter((convo) => {
          const isUserA = currentUserId === convo.user_a_id;
          // Filter if I BLOCKED THEM
          const blockedByMe = isUserA
            ? convo.user_b_is_blocked_by_a
            : convo.user_a_is_blocked_by_b;
          return !blockedByMe;
        });

        // 3. Extract other user IDs and fetch accounts
        const otherUserIds = visibleConversations.map((convo) =>
          convo.user_a_id === currentUserId ? convo.user_b_id : convo.user_a_id
        );
        const { data: accountsData } = await supabase
          .from("Accounts")
          .select("id, fullName, avatarURL")
          .in("id", otherUserIds);
        const accountsMap = new Map(
          (accountsData || []).map((acc) => [acc.id, acc])
        );

        // 4. Fetch last message content and unread count
        const conversationPromises = visibleConversations.map(async (convo) => {
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
            user_a_id: convo.user_a_id,
            user_b_id: convo.user_b_id,
            otherUserName: otherUser.fullName,
            lastMessagePreview: lastMessage,
            avatarURL: otherUser.avatarURL,
            timestamp: timestamp,
            unreadCount: unreadCount || 0,
          } as ConversationItem;
        });

        const processedConversations = await Promise.all(conversationPromises);
        // Take top 5 after filtering
        setConversations(processedConversations.slice(0, 5));
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
          fetchConversationsData(true);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Conversations" },
        () => {
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

  const handleUpdate = () => {
    fetchConversationsData(true);
  };

  return (
    // --- WRAPPER (Gold Gradient) ---
    <div className="w-[340px] p-[2px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl transform transition-all duration-300 z-50">
      {/* --- INNER WRAPPER (White) --- */}
      <div className="bg-white w-full h-full rounded-[22px] flex flex-col overflow-hidden shadow-inner">
        {/* --- HEADER (Maroon Gradient) --- */}
        <div className="relative px-6 py-4 border-b border-[#EFBF04]/30 flex justify-between items-center bg-gradient-to-b from-[#4e0505] to-[#3a0000] overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#EFBF04]/20 blur-2xl rounded-full pointer-events-none" />

          <h2 className="relative z-10 text-[18px] font-montserrat font-bold text-white tracking-wide">
            Messages
          </h2>
          <div
            onClick={handleSeeAllChats}
            title="See all chats"
            className="relative z-10 cursor-pointer p-2 rounded-full hover:bg-white/10 transition-colors group"
          >
            <Maximize2 className="w-4 h-4 text-white/80 group-hover:text-[#EFBF04] transition-colors" />
          </div>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="p-3 border-b border-gray-100 bg-gray-50/50"
        >
          <div className="relative group">
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-[13px] rounded-xl bg-white border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EFBF04]/20 focus:border-[#EFBF04] transition-all shadow-sm group-hover:border-[#EFBF04]/50"
            />
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#EFBF04] transition-colors"
            />
          </div>
        </motion.div>

        {/* Conversation List */}
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="p-2 space-y-1 max-h-[360px] min-h-[150px] overflow-y-auto custom-scrollbar"
        >
          {loading ? (
            <div className="flex flex-col justify-center items-center py-10 space-y-3 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin text-[#EFBF04]" />
              <span className="text-xs font-medium tracking-wide">
                Syncing chats...
              </span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <motion.div
              // FIX: Use explicit initial/animate instead of variants to ensure it shows up
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-10 text-gray-400"
            >
              <div className="p-3 bg-gray-50 rounded-full mb-2">
                <Search size={20} className="opacity-50" />
              </div>
              <span className="text-sm font-medium italic">
                {search.length > 0
                  ? `No results for "${search}"`
                  : "No chats yet."}
              </span>
            </motion.div>
          ) : (
            filteredConversations.map((item) => (
              <PopupConversationItem
                key={item.id}
                conversation={item}
                variants={itemVariants}
                currentUserId={currentUserId}
                onUpdate={handleUpdate}
              />
            ))
          )}
        </motion.div>

        {/* Footer Link */}
        <div
          onClick={handleSeeAllChats}
          className="cursor-pointer group relative p-3 text-center border-t border-gray-100 hover:bg-gray-50 transition-colors bg-white"
        >
          <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-[#8B0E0E] transition-colors flex items-center justify-center gap-2">
            View All Messages
            <Maximize2
              size={12}
              className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
            />
          </span>
        </div>
      </div>
    </div>
  );
}
