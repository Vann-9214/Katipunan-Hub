"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, MessagesSquare, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSortedUserPair } from "../../../../../../supabase/Lib/Message/auth";
import { supabase } from "../../../../../../supabase/Lib/General/supabaseClient";
import { getCurrentUserDetails } from "../../../../../../supabase/Lib/General/getUser";
import type { User } from "../../../../../../supabase/Lib/General/user";
import Avatar from "@/app/component/ReusableComponent/Avatar";
import { OtherAccount, Conversation } from "../Utils/types";
import ConversationList from "./conversationList";
import SearchResultItem from "./searchResultItem";
import { motion, AnimatePresence, Variants } from "framer-motion";

// --- 1. Defined Variants with Type Safety ---
const sidebarVariants: Variants = {
  hidden: { x: -50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export default function ChatSidebar() {
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [searchResults, setSearchResults] = useState<OtherAccount[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleHeaderClick = () => {
    router.push("/Message");
    router.refresh();
  };

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserDetails();
      setCurrentUser(user);
      if (!user) {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const currentUserId = currentUser?.id;

  const fetchConversations = useCallback(async (userId: string) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("Conversations")
      .select(
        `
        id, user_a_id, user_b_id, last_message_at,
        user_a_is_favorite, user_b_is_favorite, 
        user_a_is_blocked_by_b, user_b_is_blocked_by_a,
        Messages(content, created_at, sender_id, read_at) 
      `
      )
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      setLoading(false);
      return;
    }

    const otherUserIds = data.map((convo) =>
      convo.user_a_id === userId ? convo.user_b_id : convo.user_a_id
    );
    const { data: accountsData } = await supabase
      .from("Accounts")
      .select("id, fullName, avatarURL")
      .in("id", otherUserIds);
    const accountsMap = new Map(
      (accountsData || []).map((acc) => [acc.id, acc])
    );

    const processedConversations: Conversation[] = data.map((convo) => {
      const isCurrentUserA = convo.user_a_id === userId;
      const otherUserId = isCurrentUserA ? convo.user_b_id : convo.user_a_id;
      const otherUser = accountsMap.get(otherUserId) || {
        id: otherUserId,
        fullName: "Unknown User",
        avatarURL: null,
      };

      const is_favorite = isCurrentUserA
        ? convo.user_a_is_favorite
        : convo.user_b_is_favorite;

      const lastMessage = Array.isArray(convo.Messages)
        ? [...convo.Messages].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0]?.content
        : null;

      const unreadCount = Array.isArray(convo.Messages)
        ? convo.Messages.filter(
            (msg) => msg.sender_id === otherUserId && msg.read_at === null
          ).length
        : 0;

      return {
        id: convo.id,
        last_message_at: convo.last_message_at,
        is_favorite: is_favorite,
        is_blocked: isCurrentUserA
          ? convo.user_b_is_blocked_by_a
          : convo.user_a_is_blocked_by_b,
        otherUser: otherUser,
        lastMessageContent: lastMessage || "",
        unreadCount: unreadCount,
      };
    });

    setConversations(processedConversations);
    setLoading(false);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (search.trim().length === 0) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      if (!currentUserId) return;
      setIsSearching(true);

      const { data, error } = await supabase
        .from("Accounts")
        .select("id, fullName, avatarURL")
        .ilike("fullName", `%${search}%`)
        .neq("id", currentUserId)
        .limit(10);

      if (error) {
        console.error("Error searching accounts:", error);
      }
      if (data) {
        setSearchResults(data as OtherAccount[]);
      }
      setIsSearching(false);
    };

    const delayDebounceFn = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    if (search.length === 0) {
      fetchConversations(currentUserId);
    }

    const channel = supabase
      .channel("chats_list_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Messages" },
        () => {
          fetchConversations(currentUserId);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Messages" },
        () => {
          fetchConversations(currentUserId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, fetchConversations, search]);

  const handleUserClick = async (targetUser: OtherAccount) => {
    if (!currentUser?.id) return;

    const { user_a_id, user_b_id } = getSortedUserPair(
      currentUser.id,
      targetUser.id
    );

    const { data: existingConvo, error } = await supabase
      .from("Conversations")
      .select("id")
      .eq("user_a_id", user_a_id)
      .eq("user_b_id", user_b_id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking for existing conversation:", error);
      return;
    }
    if (existingConvo) {
      router.push(`/Message/${existingConvo.id}`);
    } else {
      const { data: newConvo, error: createError } = await supabase
        .from("Conversations")
        .insert({
          user_a_id: user_a_id,
          user_b_id: user_b_id,
        })
        .select("id")
        .single();

      if (createError) {
        console.error("Error creating new conversation:", createError);
        return;
      }
      router.push(`/Message/${newConvo.id}`);
    }

    setSearch("");
  };

  const filteredConversations = conversations.filter((convo) =>
    convo.otherUser.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const favorites = filteredConversations.filter((c) => c.is_favorite);
  const chats = filteredConversations.filter((c) => !c.is_favorite);

  if (!currentUser && !loading) {
    return (
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-[380px] h-full bg-white rounded-[20px] flex flex-col p-4 justify-center items-center shadow-xl border border-gray-200"
      >
        <h1 className="text-xl font-bold text-red-500">
          Authentication Required
        </h1>
        <p className="text-center text-sm text-gray-600 mt-2">
          Please log in to view your chats.
        </p>
      </motion.aside>
    );
  }

  return (
    // --- EDITED: Gold Gradient Wrapper ---
    <motion.aside
      animate="visible"
      variants={sidebarVariants}
      className="w-[380px] h-full p-[2px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl"
    >
      {/* --- EDITED: Inner White Container --- */}
      <div className="w-full h-full bg-white rounded-[22px] flex flex-col overflow-hidden">
        {/* --- EDITED: Header (Maroon Gradient) --- */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-5 px-6 py-5 bg-gradient-to-b from-[#4e0505] to-[#3a0000] border-b border-[#EFBF04]/30 shrink-0 relative"
        >
          {/* Glow Effect */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/20 blur-2xl rounded-full pointer-events-none" />

          <h1 className="text-[28px] font-montserrat font-bold text-white tracking-wide flex-1">
            Chats
          </h1>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleHeaderClick}
            className="text-white/90 hover:text-[#EFBF04] transition-colors cursor-pointer relative z-10"
          >
            <MessagesSquare size={28} />
          </motion.div>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants} className="p-4 relative">
          <div className="relative flex items-center gap-2">
            <AnimatePresence>
              {search.length > 0 && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={() => setSearch("")}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 flex-shrink-0 transition-colors"
                >
                  <ArrowLeft size={18} />
                </motion.button>
              )}
            </AnimatePresence>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search chats or users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#EFBF04] focus:border-transparent font-montserrat text-sm transition-all shadow-sm"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          className="flex-1 overflow-y-auto px-3 space-y-4 custom-scrollbar"
          variants={listContainerVariants}
        >
          {isSearching ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-8 text-gray-500 flex flex-col items-center gap-2 font-montserrat text-sm"
            >
              <Loader2 className="animate-spin text-[#EFBF04]" />
              <span>Searching...</span>
            </motion.div>
          ) : search.length > 0 && searchResults.length > 0 ? (
            <div className="space-y-1">
              {searchResults.map((account) => (
                <motion.div key={account.id} variants={itemVariants}>
                  <SearchResultItem
                    account={account}
                    onClick={handleUserClick}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <>
              {loading ? (
                <motion.div
                  variants={itemVariants}
                  className="text-center py-8 text-gray-400 text-sm font-montserrat"
                >
                  Loading conversations...
                </motion.div>
              ) : (
                <div className="space-y-4 pb-4">
                  <motion.div variants={itemVariants}>
                    <ConversationList
                      title="Favorites"
                      conversations={favorites}
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <ConversationList title="All Chats" conversations={chats} />
                  </motion.div>

                  {filteredConversations.length === 0 && search.length > 0 && (
                    <motion.div
                      variants={itemVariants}
                      className="text-center py-8 text-gray-500 text-sm font-medium"
                    >
                      No chats found for &quot;{search}&quot;.
                    </motion.div>
                  )}
                  {conversations.length === 0 && search.length === 0 && (
                    <motion.div
                      variants={itemVariants}
                      className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm gap-2 opacity-70"
                    >
                      <MessagesSquare size={32} />
                      <span>No conversations yet.</span>
                    </motion.div>
                  )}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Footer: User Profile */}
        <motion.div
          variants={itemVariants}
          className="flex-shrink-0 flex items-center gap-3 p-4 bg-gray-50 border-t border-gray-100"
        >
          <Avatar
            avatarURL={currentUser?.avatarURL}
            altText={currentUser?.fullName || "User"}
            className="w-10 h-10 border border-white shadow-sm"
          />

          <div className="flex-1 overflow-hidden">
            <h3 className="font-bold text-[14px] text-gray-800 truncate font-montserrat">
              {currentUser?.fullName || "Your Name"}
            </h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs text-gray-500 truncate font-medium">
                Online
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
}
