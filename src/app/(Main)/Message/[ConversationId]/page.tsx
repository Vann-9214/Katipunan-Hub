"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { useParams } from "next/navigation";
import {
  supabase,
  getCurrentUserDetails,
  FullUser,
} from "../../../../../supabase/Lib/General/auth"; // Adjust path as needed

// --- Types ---
interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
}

interface OtherUser {
  id: string;
  fullName: string;
  avatarURL: string | null;
}

// --- Main Component ---
export default function ConversationWindow() {
  const params = useParams();
  const conversationId = params.ConversationId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FullUser | null>(null);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // 1. Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserDetails();
      setCurrentUser(user);
      // --- DEBUG LOG ---
      console.log("1. Current User Fetched:", user);
    };
    fetchUser();
  }, []);

  // 2. Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Fetch messages and conversation details
  useEffect(() => {
    // --- DEBUG LOG ---
    console.log(
      "3. Firing main data useEffect. conversationId:",
      conversationId,
      "currentUser?.id:",
      currentUser?.id
    );

    if (!conversationId || !currentUser?.id) {
      if (!conversationId) setLoading(false); // No ID, so not loading

      // --- DEBUG LOG ---
      console.warn(
        "Returning early: No conversationId or current user ID yet."
      );
      return;
    }

    const fetchConversationData = async () => {
      try {
        // --- DEBUG LOG ---
        console.log("3a. Fetching convo data for ID:", conversationId);

        // A. Get conversation
        const { data: convoData, error: convoError } = await supabase
          .from("Conversations")
          .select("user_a_id, user_b_id")
          .eq("id", conversationId)
          .single();

        if (convoError) throw convoError;
        if (!convoData) throw new Error("Conversation not found");

        // --- DEBUG LOG ---
        console.log("3b. Convo data found:", convoData);

        // B. Identify other user
        const otherUserId =
          convoData.user_a_id === currentUser.id
            ? convoData.user_b_id
            : convoData.user_a_id;

        // --- DEBUG LOG ---
        console.log("3c. Identified otherUserId:", otherUserId);

        // C. Get other user's details AND all messages at the same time
        const [accountResult, messagesResult] = await Promise.all([
          supabase
            .from("Accounts")
            .select("id, fullName, avatarURL, role, course, studentID, year")
            .eq("id", otherUserId)
            .single(),
          supabase
            .from("Messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true }),
        ]);

        // --- !! IMPORTANT DEBUG LOGS !! ---
        console.log("3d. Account Query Result:", accountResult);
        console.log("3e. Messages Query Result:", messagesResult);

        if (accountResult.error) throw accountResult.error;
        if (messagesResult.error) throw messagesResult.error;

        // D. Set states
        if (accountResult.data) {
          // --- DEBUG LOG ---
          console.log("3f. Setting other user state with:", accountResult.data);
          setOtherUser(accountResult.data);
        } else {
          // --- DEBUG LOG ---
          console.warn(
            "3f. Account query returned NO DATA (data is null). This is likely the problem."
          );
        }

        if (messagesResult.data) {
          setMessages(messagesResult.data);
        }
      } catch (error) {
        // --- !! IMPORTANT DEBUG LOG !! ---
        console.error("--- !!! ERROR in fetchConversationData !!! ---:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversationData();

    // --- START OF FIX: Subscribe to Broadcast events ---
    // E. Subscribe to new messages via BROADCAST
    const channel = supabase
      .channel(`messages_${conversationId}`)
      .on(
        "broadcast", // Listen for "broadcast"
        { event: "new_message" }, // Match the custom event name
        (payload) => {
          console.log("Broadcast: New message received!", payload);

          // The data is inside "payload.payload"
          const newMessage = payload.payload as Message;

          // Add the new message to the state
          setMessages((currentMessages) => {
            // Avoid adding duplicates (e.g., if you sent it and received your own broadcast)
            if (currentMessages.find((m) => m.id === newMessage.id)) {
              return currentMessages;
            }
            // Add the new message from the other user
            return [...currentMessages, newMessage];
          });
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log(
            `Successfully subscribed to channel: messages_${conversationId}`
          );
        }
        if (status === "CHANNEL_ERROR" || err) {
          console.error("Failed to subscribe to channel:", err);
        }
      });
    // --- END OF FIX ---

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUser?.id]);

  // 4. Handle sending a message
  // 4. Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser?.id || !conversationId) return;

    // --- START OF FIX: This will give us a REAL error message ---

    // 1. Log the exact values we are sending
    console.log("--- DEBUGGING: ATTEMPTING TO SEND ---");
    console.log("currentUser.id:", currentUser.id);
    console.log("conversationId:", conversationId);

    const messagePayload = {
      content: newMessage.trim(),
      sender_id: currentUser.id,
      conversation_id: conversationId,
    };

    setNewMessage("");

    // 3. Insert the message into the database
    //    We changed .select().single() to just .select()
    const { data: newMessageData, error } = await supabase
      .from("Messages")
      .insert(messagePayload)
      .select(); // <-- THE CHANGE IS HERE!

    if (error) {
      // THIS WILL NO LONGER BE {}
      // This will now be a detailed PostgrestError.
      console.error("--- !!! REAL RLS INSERT ERROR !!! ---:", error);
      console.log("Error details:", error.message, error.code, error.details);

      setNewMessage(messagePayload.content);
      return;
    }

    // If the insert worked but the SELECT policy failed, we'd get this:
    if (!newMessageData || newMessageData.length === 0) {
      console.error("--- !!! REAL RLS SELECT ERROR !!! ---");
      console.error(
        "Insert succeeded, but .select() returned no data. Check your SELECT RLS policy."
      );
      setNewMessage(messagePayload.content);
      return;
    }

    // 4. Get the message from the array
    const theMessage = newMessageData[0];

    // 5. Add to your *own* screen instantly
    setMessages((currentMessages) => [...currentMessages, theMessage]);

    // 6. --- BROADCAST THE MESSAGE ---
    const channel = supabase.channel(`messages_${conversationId}`);
    channel.send({
      type: "broadcast",
      event: "new_message",
      payload: theMessage, // Send the full message object
    });

    // --- END OF FIX ---
  };

  // --- Render ---
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Loading conversation...
      </div>
    );
  }

  console.log("Rendering otherUser:", otherUser);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-200 shadow-sm bg-gray-50">
        <img
          src={
            otherUser?.avatarURL ||
            "https://placehold.co/100x100/EFEFEF/333?text=?"
          }
          alt={otherUser?.fullName || "User"}
          className="w-10 h-10 rounded-full object-cover border border-gray-300"
          onError={(e) =>
            (e.currentTarget.src =
              "https://placehold.co/100x100/EFEFEF/333?text=User")
          }
        />
        <h2 className="font-semibold text-lg text-gray-800">
          {otherUser?.fullName || "Other User Name"}{" "}
        </h2>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_id === currentUser?.id
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-xl ${
                msg.sender_id === currentUser?.id
                  ? "bg-[#8B0E0E] text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              <p>{msg.content}</p>
              <span className="text-xs opacity-70 mt-1 block text-right">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
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
