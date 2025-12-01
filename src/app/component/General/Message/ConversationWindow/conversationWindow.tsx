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
import { motion, AnimatePresence } from "framer-motion";

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
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex items-center justify-center py-6 my-2"
  >
    <span className="px-4 py-1 bg-gray-100 text-[10px] font-bold text-gray-500 font-montserrat uppercase tracking-widest rounded-full shadow-sm border border-gray-200">
      {date}
    </span>
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

  // --- ADDED: File State ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  /* Mark Messages as Read Logic */
  useEffect(() => {
    if (!conversationId || !currentUser?.id) return;

    const markAsRead = async () => {
      const { error } = await supabase.rpc("mark_messages_read", {
        p_conversation_id: conversationId,
      });

      if (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    markAsRead();
  }, [conversationId, currentUser?.id, messages.length]);

  /* Realtime Subscription */
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat_room:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((current) => {
            if (current.some((msg) => msg.id === newMsg.id)) {
              return current;
            }
            return [...current, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  /* --- ADDED: Upload Helper --- */
  const uploadFile = async (file: File) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("chat_attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("chat_attachments")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  /* Send Handler (Updated) */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (!newMessage.trim() && !selectedFile) ||
      !currentUser?.id ||
      !conversationId
    )
      return;

    setIsUploading(true);

    let imageUrl = null;
    if (selectedFile) {
      imageUrl = await uploadFile(selectedFile);
      if (!imageUrl) {
        setIsUploading(false);
        alert("Failed to upload file. Please try again.");
        return;
      }
    }

    const messagePayload = {
      content: newMessage.trim(),
      sender_id: currentUser.id,
      conversation_id: conversationId,
      image_url: imageUrl,
      file_name: selectedFile ? selectedFile.name : null,
    };

    // Optimistically clear input
    setNewMessage("");
    setSelectedFile(null);

    const { data: newMessageData, error } = await supabase
      .from("Messages")
      .insert(messagePayload)
      .select();

    setIsUploading(false);

    if (error || !newMessageData || newMessageData.length === 0) {
      // Revert state on error (simple implementation)
      setNewMessage(messagePayload.content);
      return;
    }

    const theMessage = newMessageData[0];
    setMessages((currentMessages) => [...currentMessages, theMessage]);
  };

  return (
    <div className="w-full h-full p-[2px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl">
      <div className="w-full h-full bg-white rounded-[22px] flex flex-col overflow-hidden shadow-inner relative">
        <ConversationHeader otherUser={otherUser} />

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white gap-6 relative overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-64 h-64 bg-red-500/5 rounded-full blur-3xl"
            />
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full border-[3px] border-[#EFBF04]/30 border-t-[#8B0E0E]"
              />
              <motion.div
                animate={{ scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 m-auto w-3 h-3 bg-[#EFBF04] rounded-full shadow-[0_0_10px_#EFBF04]"
              />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-1 z-10"
            >
              <h3 className="font-montserrat font-bold text-[#8B0E0E] tracking-widest text-sm">
                INITIALIZING CHAT
              </h3>
              <p className="font-ptsans text-xs text-gray-400">
                Fetching your messages...
              </p>
            </motion.div>
          </div>
        ) : (
          <motion.div
            key={conversationId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex-1 p-4 md:p-6 space-y-1 overflow-y-auto custom-scrollbar bg-gray-50/30"
          >
            <div
              className="fixed inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(#8B0E0E 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />

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
                    className="flex flex-col w-full relative z-10"
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
        )}

        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSubmit={handleSendMessage}
          // --- ADDED: Pass new props ---
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          isUploading={isUploading}
        />
      </div>
    </div>
  );
}
