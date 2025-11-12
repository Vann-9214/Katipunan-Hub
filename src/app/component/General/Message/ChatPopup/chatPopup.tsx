"use client";

import { Search, Maximize2 } from "lucide-react"; // Icons for this component
import { useState, useEffect } from "react"; // Only hooks needed here
import { useRouter } from "next/navigation";
// Assuming this path is correct for your supabase setup
import {
  supabase,
  getCurrentUserDetails,
  FullUser,
} from "../../../../../../supabase/Lib/Message/auth";

// --- NEW IMPORTS ---
import { ConversationItem } from "../Utils/types";
import PopupConversationItem from "./popupConversationitem";

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
          .select("id, fullName, avatarURL") // Make sure you're selecting avatarURL here!
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
            avatarURL: otherUser.avatarURL, // This now passes the URL to the item
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
      <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-[32px] font-montserrat font-bold text-gray-800">
          Chats
        </h2>
        {/* This click is now fixed */}
        <div
          onClick={handleSeeAllChats}
          title="See all chats"
          className="cursor-pointer"
        >
          <Maximize2 className="w-5 h-5 text-black hover:text-black/70" />
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
            className="w-full pl-10 pr-3 py-2 text-sm rounded-full bg-gray-100 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
          />
          <Search
            size={24}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black/70"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="p-2 space-y-1 max-h-[350px] overflow-y-auto">
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
            // --- Use the imported component ---
            <PopupConversationItem key={item.id} conversation={item} />
          ))
        )}
      </div>

      {/* Footer Link - This click is also fixed */}
      <button
        onClick={handleSeeAllChats}
        className="cursor-pointer block w-full text-center py-2 text-[16px] font-montserrat font-medium text-gray-600 hover:text-[#8B0E0E] bg-gray-100 hover:bg-gray-200 transition-colors border-t border-gray-200"
      >
        See all in chats
      </button>
    </div>
  );
}
