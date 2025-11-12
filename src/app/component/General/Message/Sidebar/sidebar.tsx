"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, MessagesSquare, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  supabase,
  getCurrentUserDetails,
  FullUser,
  getSortedUserPair,
} from "../../../../../../supabase/Lib/Message/auth";
import Avatar from "@/app/component/ReusableComponent/Avatar";

// --- NEW CLEAN IMPORTS ---
import { OtherAccount, Conversation } from "../Utils/types";
import ConversationList from "./conversationList";
import SearchResultItem from "./searchResultItem";

// --- Main Sidebar Component ---
export default function ChatSidebar() {
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FullUser | null>(null);

  const [searchResults, setSearchResults] = useState<OtherAccount[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleHeaderClick = () => {
    // This navigates to the base /Message page, deselecting any chat
    router.push("/Message");
    router.refresh();
  };

  // Effect to fetch and set the current user details
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

  // Effect to fetch conversations
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

  // Effect for searching users
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

  // Main conversation fetcher and realtime listener
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

  // Click handler for search results
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
      return; // Stop execution
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

  // Logic for filtering favorites and chats
  const filteredConversations = conversations.filter((convo) =>
    convo.otherUser.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const favorites = filteredConversations.filter((c) => c.is_favorite);
  const chats = filteredConversations.filter((c) => !c.is_favorite);

  // Loading/Auth block
  if (!currentUser && !loading) {
    return (
      <aside className="w-[350px] h-full bg-white border-r border-gray-200 flex flex-col p-4 justify-center items-center shadow-xl">
        <h1 className="text-xl font-bold text-red-500">
          Authentication Required
        </h1>
        <p className="text-center text-sm text-gray-600 mt-2">
          Please log in to view your chats.
        </p>
      </aside>
    );
  }

  // --- Render ---
  return (
    <aside className="w-[350px] h-full bg-white border-r border-gray-200 flex flex-col p-4 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-5 ">
        <h1 className="text-[36px] font-montserrat font-bold text-black">
          Chats
        </h1>
        <div
          onClick={handleHeaderClick}
          className="text-black transition-colors hover:text-gray-700 cursor-pointer"
        >
          <MessagesSquare size={36} />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative flex items-center gap-2">
        {search.length > 0 && (
          <button
            onClick={() => setSearch("")}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-600 flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search chats or users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black"
          />
          <Search
            size={24}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black/70 pointer-events-none"
          />
        </div>
      </div>

      {/* Conditional Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
        {isSearching ? (
          <div className="text-center py-8 text-gray-500">Searching...</div>
        ) : search.length > 0 && searchResults.length > 0 ? (
          <>
            {searchResults.map((account) => (
              <SearchResultItem
                key={account.id}
                account={account}
                onClick={handleUserClick}
              />
            ))}
          </>
        ) : (
          <>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading chats...
              </div>
            ) : (
              <>
                <ConversationList
                  title="Favorites (Most Recent)"
                  conversations={favorites}
                />
                <ConversationList
                  title="Chats (Most Recent)"
                  conversations={chats}
                />
                {filteredConversations.length === 0 && search.length > 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No chats found for &quot;{search}&quot;.
                  </div>
                )}
                {conversations.length === 0 && search.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No conversations found.
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Current User Footer */}
      <div className="flex-shrink-0 flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 shadow-lg">
        <Avatar
          avatarURL={currentUser?.avatarURL}
          altText={currentUser?.fullName || "User"}
          className="w-12 h-12"
        />

        <div className="flex-1 overflow-hidden">
          <h3 className="font-semibold text-gray-800 truncate">
            {currentUser?.fullName || "Your Name"}
          </h3>
          <p className="text-sm text-gray-600 truncate">
            {currentUser ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Your custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db; /* gray-300 */
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: #f3f4f6; /* gray-100 */
        }
      `}</style>
    </aside>
  );
}
