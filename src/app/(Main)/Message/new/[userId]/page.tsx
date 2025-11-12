"use client";

import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  supabase,
  getCurrentUserDetails,
  FullUser,
  getSortedUserPair,
} from "../../../../../../supabase/Lib/Message/auth"; // Adjust this path as needed

import Image from "next/image";

// --- Types ---
interface OtherUser {
  id: string;
  fullName: string;
  avatarURL: string | null;
}

// --- Main Component ---
export default function NewConversationWindow() {
  const params = useParams();
  const router = useRouter();
  const targetUserId = params.userId as string;

  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FullUser | null>(null);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);

  // 1. Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserDetails();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  // 2. **FIXED**: Fetch the "other user's" details
  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const fetchOtherUserData = async () => {
      try {
        const { data: accountData, error } = await supabase
          .from("Accounts")
          .select("id, fullName, avatarURL")
          .eq("id", targetUserId)
          .single();

        if (error) throw error; // RLS failure will be caught here

        if (accountData) {
          setOtherUser(accountData);
        } else {
          console.error("No user found with that ID");
        }
      } catch (error) {
        console.error("Error fetching other user data:", error);
      } finally {
        setLoading(false); // Fixes "Loading..." bug
      }
    };

    fetchOtherUserData();
  }, [targetUserId]);

  // 3. Handle sending the FIRST message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser?.id || !targetUserId) return;

    // 1. Get sorted IDs
    const { user_a_id, user_b_id } = getSortedUserPair(
      currentUser.id,
      targetUserId
    );

    // 2. Find or create the conversation
    // Your RLS policy for CONVERSATIONS (INSERT) allows this
    const { data: newConvo, error: convoError } = await supabase
      .from("Conversations")
      .upsert({
        user_a_id: user_a_id,
        user_b_id: user_b_id,
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (convoError || !newConvo) {
      console.error("Error creating conversation:", convoError);
      return;
    }

    // 3. Insert the first message
    // Your RLS policy for MESSAGES (INSERT) allows this
    const { error: msgError } = await supabase.from("Messages").insert({
      content: newMessage.trim(),
      sender_id: currentUser.id,
      conversation_id: newConvo.id,
    });

    if (msgError) {
      console.error("Error sending message:", msgError);
      return;
    }

    // 4. Redirect to the REAL chat page
    router.replace(`/Message/${newConvo.id}`);
  };

  // --- Render ---
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-200 shadow-sm bg-gray-50">
        <Image
          src={otherUser?.avatarURL || "/DefaultAvatar.svg"} // Use your local SVG as the fallback
          alt={otherUser?.fullName || "User"}
          width={40}
          height={40}
          className="rounded-full object-cover border border-gray-300"
        />
        <h2 className="font-semibold text-lg text-gray-800">
          {otherUser?.fullName || "Other User Name"}
        </h2>
      </div>

      {/* Message List (Empty) */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="text-center text-sm text-gray-500 p-8">
          Start a new conversation with {otherUser?.fullName || "this user"}.
        </div>
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-200 bg-gray-50"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full pl-4 pr-12 py-3 rounded-full bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFC9C9]"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#8B0E0E] text-white hover:bg-opacity-80 transition-all"
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
