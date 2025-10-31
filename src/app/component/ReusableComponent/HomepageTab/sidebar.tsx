"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronDown, Plus, MoreHorizontal, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// CORRECTED IMPORTS to use your local paths and components
import {
  supabase,
  getCurrentUserDetails,
  FullUser,
} from "../../../../../supabase/Lib/General/auth";

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

// Single Conversation Item Component
function ConversationItem({ conversation }: { conversation: Conversation }) {
  const pathname = usePathname();
  const isActive = pathname === `/chat/${conversation.id}`;

  return (
    <Link
      href={`/chat/${conversation.id}`}
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
            {/* Format timestamp to HH:MM */}
            {new Date(conversation.last_message_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p
          className={`text-sm truncate ${
            conversation.unreadCount > 0
              ? "font-bold text-[#8B0E0E]"
              : "text-gray-600"
          }`}
        >
          {conversation.lastMessageContent || "Start a chat..."}
        </p>
      </div>
      <MoreHorizontal className="text-gray-400" />
    </Link>
  );
}

// Collapsible List Component
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

// Main Sidebar Component
export default function ChatSidebar() {
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FullUser | null>(null);

  // Effect to fetch and set the current user details
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserDetails();
      setCurrentUser(user);
      if (!user) {
        setLoading(false); // Stop loading if no user is authenticated
      }
    };
    fetchUser();
  }, []);

  const currentUserId = currentUser?.id;

  const fetchConversations = useCallback(async (userId: string) => {
    setLoading(true);

    // 1. Fetch conversations (only runs if userId is valid)
    const { data, error } = await supabase
      .from("Conversations")
      .select(
        `
        id, user_a_id, user_b_id, last_message_at,
        user_a_is_favorite, user_b_is_favorite, 
        user_a_is_blocked_by_b, user_b_is_blocked_by_a,
        Messages(content, created_at)
      `
      )
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      setLoading(false);
      return;
    }

    // 2. Extract other user IDs and fetch their account details
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

    // 3. Process and map the data
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

      // Find the actual latest message content from the array of messages returned (needs sorting)
      const lastMessage = Array.isArray(convo.Messages)
        ? convo.Messages.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0]?.content
        : null;

      return {
        id: convo.id,
        last_message_at: convo.last_message_at,
        is_favorite: is_favorite,
        // Determine blocked status relative to the current user
        is_blocked: isCurrentUserA
          ? convo.user_b_is_blocked_by_a
          : convo.user_a_is_blocked_by_b,
        otherUser: otherUser,
        lastMessageContent: lastMessage || "",
        unreadCount: 0, // Placeholder
      };
    });

    setConversations(processedConversations);
    setLoading(false);
  }, []); // userId is no longer a dependency, we pass it directly

  useEffect(() => {
    if (!currentUserId) return; // Only run if the user is authenticated

    fetchConversations(currentUserId);

    // --- Setup Realtime Listener for new message inserts ---
    // Note: This listens to *all* messages and forces a refetch of the list, which might be heavy
    // for a high-traffic app. For simplicity, we keep it this way.
    const channel = supabase
      .channel("chats_list_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Messages" },
        (payload) => {
          // Refetch the list to update order/content when any new message is sent
          fetchConversations(currentUserId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, fetchConversations]); // Re-run when currentUserId is set/changes

  // Apply search filtering
  const filteredConversations = conversations.filter((convo) =>
    convo.otherUser.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const favorites = filteredConversations.filter((c) => c.is_favorite);
  const chats = filteredConversations.filter((c) => !c.is_favorite);

  // Show a login required message if no user is found
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
      <div className="relative">
        <input
          type="text"
          placeholder="Search User..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FFC9C9]"
        />
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-gray-500">Loading chats...</div>
      )}

      {/* Conversation Lists */}
      {!loading && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          <ConversationList
            title="Favorites (Most Recent)"
            conversations={favorites}
          />
          <ConversationList title="Chats (Most Recent)" conversations={chats} />
          {conversations.length === 0 && favorites.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No conversations found.
            </div>
          )}
        </div>
      )}

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
