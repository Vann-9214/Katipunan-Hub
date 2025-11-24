"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../../../supabase/Lib/General/supabaseClient";
import { getCurrentUserDetails } from "../../../../../../supabase/Lib/General/getUser";
import type { User } from "../../../../../../supabase/Lib/General/user";
import { OtherUser, Message } from "../Utils/types";
import ConversationHeader from "./conversationHeader";
import MessageBubble from "./messageBubble";
import MessageInput from "./messageInput";
import { motion, AnimatePresence, Variants } from "framer-motion";

/* --- Helper: Date Formatter --- */
const getDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffTime = startOfToday.getTime() - startOfDate.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    weekday: "short",
  };

  if (date.getFullYear() !== now.getFullYear()) {
    options.year = "numeric";
  }

  return date.toLocaleDateString("en-US", options);
};

/* --- Helper Component: Date Separator --- */
const DateSeparator = ({ date }: { date: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center py-6 my-2 opacity-80"
  >
    <div className="flex-grow h-[1px] bg-gray-300/70" />
    <span className="px-4 text-[11px] font-bold text-gray-400 font-montserrat uppercase tracking-widest">
      {date}
    </span>
    <div className="flex-grow h-[1px] bg-gray-300/70" />
  </motion.div>
);

/* --- Main Component --- */
export default function ConversationWindow() {
  const params = useParams();
  const conversationId = params.ConversationId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Animation Variants
  const loadingContainerVariants: Variants = {
    animate: {
      transition: { staggerChildren: 0.1 },
    },
  };

  const loadingLetterVariants: Variants = {
    initial: { y: 0 },
    animate: {
      y: [0, -10, 0],
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" },
    },
  };

  /* User Fetcher */
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserDetails();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  /* Auto Scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Data Fetcher */
  useEffect(() => {
    if (!conversationId || !currentUser?.id) {
      if (!conversationId) setLoading(false);
      return;
    }

    const fetchConversationData = async () => {
      try {
        // 1. Get Conversation
        const { data: convoData, error: convoError } = await supabase
          .from("Conversations")
          .select("user_a_id, user_b_id")
          .eq("id", conversationId)
          .single();

        if (convoError) throw convoError;
        if (!convoData) throw new Error("Conversation not found");

        const otherUserId =
          convoData.user_a_id === currentUser.id
            ? convoData.user_b_id
            : convoData.user_a_id;

        // 2. Fetch Messages & Other User Details
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

        if (accountResult.error) throw accountResult.error;
        if (messagesResult.error) throw messagesResult.error;

        if (accountResult.data) setOtherUser(accountResult.data);
        if (messagesResult.data) setMessages(messagesResult.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversationData();
  }, [conversationId, currentUser?.id]);

  /* --- ADDED: Mark Messages as Read Logic --- */
  useEffect(() => {
    if (!conversationId || !currentUser?.id) return;

    const markAsRead = async () => {
      // Update all messages in this conversation where:
      // 1. Sender is NOT me
      // 2. Read_at is NULL
      const { error } = await supabase
        .from("Messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_id", currentUser.id)
        .is("read_at", null);

      if (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    // Run immediately
    markAsRead();

    // We depend on [messages.length] so that if a NEW message arrives
    // while you are looking at the window, it gets marked read immediately.
  }, [conversationId, currentUser?.id, messages.length]);

  /* Send Handler */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser?.id || !conversationId) return;

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

    if (error || !newMessageData || newMessageData.length === 0) {
      setNewMessage(messagePayload.content);
      return;
    }

    const theMessage = newMessageData[0];
    setMessages((currentMessages) => [...currentMessages, theMessage]);
  };

  /* Render Loading State */
  if (loading) {
    const loadingText = "LOADING CONVERSATION...";
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white space-y-6">
        <motion.div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-4 h-4 bg-[#8B0E0E] rounded-full"
              animate={{
                y: [0, -15, 0],
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        <motion.div
          className="flex gap-[2px] overflow-hidden"
          variants={loadingContainerVariants}
          initial="initial"
          animate="animate"
        >
          {loadingText.split("").map((char, index) => (
            <motion.span
              key={index}
              variants={loadingLetterVariants}
              className="text-[#8B0E0E] font-montserrat font-bold text-sm tracking-widest"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <ConversationHeader otherUser={otherUser} />

      {/* Message List */}
      <motion.div
        key={conversationId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 p-4 space-y-1 overflow-y-auto"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {messages.map((msg, index) => {
            const showDateSeparator =
              index === 0 ||
              getDateLabel(messages[index - 1].created_at) !==
                getDateLabel(msg.created_at);

            return (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col w-full"
              >
                {showDateSeparator && (
                  <DateSeparator date={getDateLabel(msg.created_at)} />
                )}

                <MessageBubble
                  message={msg}
                  isCurrentUser={msg.sender_id === currentUser?.id}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </motion.div>

      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSubmit={handleSendMessage}
      />
    </div>
  );
}
