// ChatPopup.tsx
"use client";

import { Search, Maximize2, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// Assuming this path is correct for your supabase setup
import {
  supabase,
  getCurrentUserDetails,
  FullUser,
} from "../../../../../supabase/Lib/General/auth";

// --- Types ---
interface ConversationItem {
  id: string;
  otherUserName: string;
  lastMessagePreview: string;
  avatarURL: string | null;
  timestamp: string; // Formatted time
  unreadCount: number; // Crucial for 'active' state
}

// Single Conversation Item Component
function PopupConversationItem({
  conversation,
}: {
  conversation: ConversationItem;
}) {
  const isActive = conversation.unreadCount > 0;
  const router = useRouter();

  // Handle click instead of navigating
  const handleClick = () => {
    // --- START OF FIX & DEBUGGING ---
    const navPath = `/Message/${conversation.id}`;
    console.log(
      `[DEBUG] PopupConversationItem: Clicked. Queuing navigation to: ${navPath}`
    );

    // FIX: Wrap in setTimeout to prevent race condition.
    // This lets the popup close state update *before* we navigate.
    setTimeout(() => {
      console.log(
        `[DEBUG] PopupConversationItem: Firing router.push() inside timeout.`
      );
      router.push(navPath);
    }, 50); // 50ms is a safe, small delay
    // --- END OF FIX & DEBUGGING ---
  };

  return (
    <div
      onClick={handleClick} // Replaced Link with a clickable div
      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors w-full relative group
          ${isActive ? "bg-gray-200" : "hover:bg-gray-100"}`}
    >
      <img
        src={
          conversation.avatarURL ||
          "https://placehold.co/100x100/EFEFEF/333?text=?"
        }
        alt={conversation.otherUserName}
        className="w-10 h-10 rounded-full object-cover border border-gray-300"
        onError={(e) =>
          (e.currentTarget.src =
            "https://placehold.co/100x100/EFEFEF/333?text=User")
        }
      />
      <div className="flex-1 overflow-hidden">
        <h3
          className={`font-semibold text-sm truncate ${
            isActive ? "text-gray-900" : "text-gray-700"
          }`}
        >
          {conversation.otherUserName}
        </h3>
        <p
          className={`text-xs truncate ${
            isActive ? "font-bold text-gray-800" : "text-gray-500"
          }`}
        >
          {conversation.lastMessagePreview}
        </p>
      </div>
      <div className="flex flex-col items-end h-full justify-between pt-1 pb-1">
        <span className="text-xs text-gray-500">{conversation.timestamp}</span>
        {isActive ? (
          <span className="bg-[#8B0E0E] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {conversation.unreadCount}
          </span>
        ) : (
          <MoreHorizontal
            size={16}
            className="text-gray-400 group-hover:text-gray-700 transition-colors"
          />
        )}
      </div>
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-1 rounded-r-lg bg-[#8B0E0E]"></span>
      )}
    </div>
  );
}

// Main Chat Popup Component
export default function ChatPopup() {
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FullUser | null>(null);
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

  // 2. Fetch conversations, last message, and unread count
  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    const fetchConversationsData = async (userId: string) => {
      setLoading(true);

      try {
        // 1. Fetch conversations (top 5)
        const { data: convoData, error: convoError } = await supabase
          .from("Conversations")
          .select(`id, user_a_id, user_b_id, last_message_at`)
          .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
          .order("last_message_at", { ascending: false })
          .limit(5);

        if (convoError) {
          console.error("Error fetching popup conversations:", convoError);
          setLoading(false);
          return;
        }

        // 2. Extract other user IDs and fetch accounts
        const otherUserIds = convoData.map((convo) =>
          convo.user_a_id === userId ? convo.user_b_id : convo.user_a_id
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
            convo.user_a_id === userId ? convo.user_b_id : convo.user_a_id;
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
            .maybeSingle(); // Use maybeSingle for safety

          const { count: unreadCount } = await supabase
            .from("Messages")
            .select("id", { count: "exact" })
            .eq("sender_id", otherUserId)
            .eq("conversation_id", convo.id)
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
        setLoading(false);
      }
    };

    fetchConversationsData(currentUserId);
  }, [currentUserId]);

  const filteredConversations = conversations.filter((convo) =>
    convo.otherUserName.toLowerCase().includes(search.toLowerCase())
  );

  // --- START OF FIX & DEBUGGING ---
  const handleSeeAllChats = () => {
    const navPath = "/Message";
    console.log(
      `[DEBUG] ChatPopup: Clicked 'See All'. Queuing navigation to: ${navPath}`
    );

    // FIX: Wrap in setTimeout to prevent race condition
    setTimeout(() => {
      console.log(`[DEBUG] ChatPopup: Firing router.push() inside timeout.`);
      router.push(navPath);
    }, 50);
  };
  // --- END OF FIX & DEBUGGING ---

  return (
    <div className="w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 z-40">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">Chats</h2>
        {/* This click is now fixed */}
        <div
          onClick={handleSeeAllChats}
          title="See all chats"
          className="cursor-pointer"
        >
          <Maximize2 className="w-5 h-5 text-[#8B0E0E] hover:text-[#FFC9C9]" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search User..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm rounded-full bg-gray-100 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#FFC9C9]"
          />
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
        {loading ? (
          <div className="text-center py-4 text-sm text-gray-500">
            Loading recent chats...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500">
            No chats found.
          </div>
        ) : (
          filteredConversations.map((item) => (
            <PopupConversationItem key={item.id} conversation={item} />
          ))
        )}
      </div>

      {/* Footer Link - This click is also fixed */}
      <button
        onClick={handleSeeAllChats}
        className="block w-full text-center py-2 text-sm font-medium text-gray-600 hover:text-[#8B0E0E] bg-gray-100 hover:bg-gray-200 transition-colors border-t border-gray-200"
      >
        See all in chats
      </button>
    </div>
  );
}
