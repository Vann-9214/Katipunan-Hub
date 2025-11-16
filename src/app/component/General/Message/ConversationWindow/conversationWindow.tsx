"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../../../supabase/Lib/General/supabaseClient";
import { getCurrentUserDetails } from "../../../../../../supabase/Lib/General/getUser";
import type { User } from "../../../../../../supabase/Lib/General/user";

// --- CLEANED IMPORTS ---
import { OtherUser, Message } from "../Utils/types";
import ConversationHeader from "./conversationHeader";
import MessageBubble from "./messageBubble";
import MessageInput from "./messageInput";

// --- Main Component ---
export default function ConversationWindow() {
  const params = useParams();
  const conversationId = params.ConversationId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // 1. Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserDetails();
      setCurrentUser(user);
      console.log("1. Current User Fetched:", user);
    };
    fetchUser();
  }, []);

  // 2. Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Fetch messages and conversation details (NO REALTIME)
  useEffect(() => {
    console.log(
      "3. Firing main data useEffect. conversationId:",
      conversationId,
      "currentUser?.id:",
      currentUser?.id
    );

    if (!conversationId || !currentUser?.id) {
      if (!conversationId) setLoading(false);
      console.warn(
        "Returning early: No conversationId or current user ID yet."
      );
      return;
    }

    const fetchConversationData = async () => {
      try {
        console.log("3a. Fetching convo data for ID:", conversationId);

        // A. Get conversation
        const { data: convoData, error: convoError } = await supabase
          .from("Conversations")
          .select("user_a_id, user_b_id")
          .eq("id", conversationId)
          .single();

        if (convoError) throw convoError;
        if (!convoData) throw new Error("Conversation not found");

        console.log("3b. Convo data found:", convoData);

        // B. Identify other user
        const otherUserId =
          convoData.user_a_id === currentUser.id
            ? convoData.user_b_id
            : convoData.user_a_id;

        console.log("3c. Identified otherUserId:", otherUserId);

        // C. Get other user's details AND all messages
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

        console.log("3d. Account Query Result:", accountResult);
        console.log("3e. Messages Query Result:", messagesResult);

        if (accountResult.error) throw accountResult.error;
        if (messagesResult.error) throw messagesResult.error;

        // D. Set states
        if (accountResult.data) {
          console.log("3f. Setting other user state with:", accountResult.data);
          setOtherUser(accountResult.data);
        } else {
          console.warn("3f. Account query returned NO DATA (data is null).");
        }

        if (messagesResult.data) {
          setMessages(messagesResult.data);
        }
      } catch (error) {
        console.error("--- !!! ERROR in fetchConversationData !!! ---:");
        if (error instanceof Error) {
          console.error("Error Message:", error.message);
        } else {
          console.error("An unknown error occurred:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConversationData();
  }, [conversationId, currentUser?.id]);

  // 4. Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser?.id || !conversationId) return;

    console.log("--- DEBUGGING: ATTEMPTING TO SEND ---");
    console.log("currentUser.id:", currentUser.id);
    console.log("conversationId:", conversationId);

    const messagePayload = {
      content: newMessage.trim(),
      sender_id: currentUser.id,
      conversation_id: conversationId,
    };

    setNewMessage("");

    const { data: newMessageData, error } = await supabase
      .from("Messages")
      .insert(messagePayload)
      .select();

    if (error) {
      console.error("--- !!! REAL RLS INSERT ERROR !!! ---:", error);
      setNewMessage(messagePayload.content); // Put message back
      return;
    }

    if (!newMessageData || newMessageData.length === 0) {
      console.error(
        "--- !!! REAL RLS SELECT ERROR !!! ---",
        "Insert succeeded, but .select() returned no data. Check your SELECT RLS policy."
      );
      setNewMessage(messagePayload.content); // Put message back
      return;
    }

    const theMessage = newMessageData[0];
    setMessages((currentMessages) => [...currentMessages, theMessage]);
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
      {/* Header --- REPLACED --- */}
      <ConversationHeader otherUser={otherUser} />

      {/* Message List --- REPLACED --- */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isCurrentUser={msg.sender_id === currentUser?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input --- REPLACED --- */}
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSubmit={handleSendMessage}
      />
    </div>
  );
}
