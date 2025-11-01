"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  MoreHorizontal,
  User,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  supabase,
  getCurrentUserDetails,
  FullUser,
  getSortedUserPair,
} from "../../../../../supabase/Lib/General/auth"; // Adjust this path as needed

// --- Types ---
interface OtherAccount {
  id: string;
  fullName: string;
  avatarURL: string | null;
}
interface Conversation {
  id: string;
  last_message_at: string;
  is_favorite: boolean;
  is_blocked: boolean;
  otherUser: OtherAccount;
  lastMessageContent: string;
  unreadCount: number;
}

// --- ConversationItem Component ---
function ConversationItem({ conversation }: { conversation: Conversation }) {
  const pathname = usePathname();
  const isActive = pathname === `/Message/${conversation.id}`;

  return (
    <Link
      href={`/Message/${conversation.id}`}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? "bg-[#FFE0A7] shadow-inner border border-[#FFC9C9]"
          : "hover:bg-gray-100"
      }`}
    >
      <img
        src={
          conversation.otherUser.avatarURL ||
          "https://placehold.co/100x100/EFEFEF/333?text=?"
        }
        alt={conversation.otherUser.fullName}
        className="w-12 h-12 rounded-full object-cover border-2 border-[#8B0E0E]"
        onError={(e) =>
          (e.currentTarget.src =
            "https://placehold.co/100x100/EFEFEF/333?text=User")
        }
      />
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 truncate">
            {conversation.otherUser.fullName}
          </h3>
          <span className="text-xs text-gray-500">
            {new Date(conversation.last_message_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p
            className={`text-sm truncate ${
              conversation.unreadCount > 0
                ? "font-bold text-[#8B0E0E]"
                : "text-gray-600"
            }`}
          >
            {conversation.lastMessageContent || "Start a chat..."}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="bg-[#8B0E0E] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// --- ConversationList Component ---
function ConversationList({
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

// --- SearchResultItem Component ---
function SearchResultItem({
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
      <img
        src={
          account.avatarURL || "https://placehold.co/100x100/EFEFEF/333?text=?"
        }
        alt={account.fullName}
        className="w-12 h-12 rounded-full object-cover border-2 border-[#8B0E0E]"
        onError={(e) =>
          (e.currentTarget.src =
            "https://placehold.co/100x100/EFEFEF/333?text=User")
        }
      />
      <div className="flex-1 overflow-hidden">
        <h3 className="font-semibold text-gray-800 truncate">
          {account.fullName}
        </h3>
      </div>
    </div>
  );
}

// --- Main Sidebar Component ---
export default function ChatSidebar() {
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FullUser | null>(null);

  const [searchResults, setSearchResults] = useState<OtherAccount[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

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

    // Your RLS policy for CONVERSATIONS (SELECT) allows this
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

    // Your RLS policy for ACCOUNTS (SELECT) allows this
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

      // Your RLS policy for MESSAGES (SELECT) allows this `Messages(...)` join
      const lastMessage = Array.isArray(convo.Messages)
        ? [...convo.Messages].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0]?.content
        : null;

      // Calculate unread count
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

      // Your RLS policy for ACCOUNTS (SELECT) allows this
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
        (payload) => {
          fetchConversations(currentUserId);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Messages" },
        (payload) => {
          fetchConversations(currentUserId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, fetchConversations, search]);

  // Click handler for search results
  // Click handler for search results
  const handleUserClick = async (targetUser: OtherAccount) => {
    if (!currentUser?.id) return;

    // 1. Get the sorted user IDs
    const { user_a_id, user_b_id } = getSortedUserPair(
      currentUser.id,
      targetUser.id
    );

    // 2. Check if a conversation already exists
    const { data: existingConvo, error } = await supabase
      .from("Conversations")
      .select("id")
      .eq("user_a_id", user_a_id)
      .eq("user_b_id", user_b_id)
      .single();

    if (existingConvo) {
      // 3A. If it exists, just navigate to it
      router.push(`/Message/${existingConvo.id}`);
    } else {
      // 3B. --- THIS IS THE FIX ---
      // If it doesn't exist, CREATE IT FIRST
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
        return; // Stop if we can't create the chat
      }

      // 4. Now navigate to the NEWLY created conversation
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
      <aside className="w-[350px] h-full bg-[#FFFBEB] border-r border-gray-200 flex flex-col p-4 justify-center items-center shadow-xl">
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
    <aside className="w-[350px] h-full bg-[#FFFBEB] border-r border-gray-200 flex flex-col p-4 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Chats</h1>
        <button className="p-2 rounded-full hover:bg-gray-200 text-[#8B0E0E] transition-colors">
          <Plus size={24} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative flex items-center gap-2">
        {search.length > 0 && (
          <button
            onClick={() => setSearch("")}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-600"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <input
          type="text"
          placeholder="Search chats or users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FFC9C9]"
        />
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>

      {/* Conditional Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
        {isSearching ? (
          // STATE 2A: SEARCHING... (Loading state)
          <div className="text-center py-8 text-gray-500">Searching...</div>
        ) : search.length > 0 && searchResults.length > 0 ? (
          // STATE 2B: SHOWING USER SEARCH RESULTS
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
          // STATE 1: VIEWING CHATS (Default state)
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
                  // This is the "good" code:
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
        {currentUser?.avatarURL ? (
          <img
            src={currentUser.avatarURL}
            alt={currentUser.fullName || "User"}
            className="w-12 h-12 rounded-full object-cover border-2 border-[#FFC9C9]"
          />
        ) : (
          <User className="w-12 h-12 rounded-full p-2 bg-[#FFC9C9] text-[#8B0E0E]" />
        )}
        <div className="flex-1 overflow-hidden">
          <h3 className="font-semibold text-gray-800 truncate">
            {currentUser?.fullName || "Your Name"}
          </h3>
          <p className="text-sm text-gray-600 truncate">
            {currentUser ? "Online" : "Offline"}
          </p>
        </div>
        <MoreHorizontal className="text-gray-400 cursor-pointer hover:text-gray-700" />
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
