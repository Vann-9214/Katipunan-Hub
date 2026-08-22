"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
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

  const [isCommunicationBlocked] = useState(false);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // --- File State ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- Reply State ---
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  /* User Fetcher & Initial Load */
  useEffect(() => {
    const mockInitialMessages: Message[] = [
      {
        id: "msg-1",
        conversation_id: conversationId,
        sender_id: "usr_maria_03",
        content:
          "Hello! I saw your request for Data Structures tutoring. What topics would you like to focus on?",
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        read_at: new Date().toISOString(),
      },
      {
        id: "msg-2",
        conversation_id: conversationId,
        sender_id: "usr_mock_wildcat_01",
        content:
          "Hi Maria! I'd love to review Graph algorithms, especially BFS/DFS and Dijkstra's algorithm.",
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read_at: new Date().toISOString(),
      },
      {
        id: "msg-3",
        conversation_id: conversationId,
        sender_id: "usr_maria_03",
        content: "Sounds great! See you tomorrow at the PLC hub.",
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        read_at: null,
      },
    ];

    getCurrentUserDetails().then((user) => {
      setCurrentUser(user);
      setOtherUser({
        id: "usr_maria_03",
        fullName: "Maria Santos (PLC Tutor)",
        avatarURL: "/Cit Logo.svg",
        role: "Tutor",
        course: "BS Computer Science",
        studentID: "21-9876-543",
        year: "4th Year",
      });
      setMessages(mockInitialMessages);
      setLoading(false);
    });
  }, [conversationId]);

  /* --- Upload Helper (UI Mode) --- */
  const uploadFile = async (file: File) => {
    return URL.createObjectURL(file);
  };

  /* Send Handler */
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

    // Determine specific text for sidebar
    let finalContent = newMessage.trim();
    if (!finalContent && selectedFile) {
      const isImage = selectedFile.type.startsWith("image/");
      finalContent = isImage ? "Sent a photo" : "Sent an attachment";
    }

    const theMessage: Message = {
      id: `msg-${Date.now()}`,
      content: finalContent,
      sender_id: currentUser.id,
      conversation_id: conversationId,
      image_url: imageUrl,
      file_name: selectedFile ? selectedFile.name : null,
      reply_to_id: replyingTo?.id || null,
      created_at: new Date().toISOString(),
      read_at: null,
    };

    setMessages((currentMessages) => [...currentMessages, theMessage]);
    setIsUploading(false);
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

                // Find replied message if it exists
                const replyMessage = msg.reply_to_id
                  ? messages.find((m) => m.id === msg.reply_to_id)
                  : undefined;

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
                      onReply={(m) => setReplyingTo(m)}
                      replyMessage={replyMessage}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </motion.div>
        )}

        {/* --- CHANGE 3: CONDITIONAL INPUT RENDERING --- */}
        {isCommunicationBlocked ? (
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-200 font-montserrat text-sm font-medium flex flex-col items-center gap-2">
              <span className="text-xl">🚫</span>
              <span>You cannot reply to this conversation.</span>
            </div>
          </div>
        ) : (
          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSubmit={handleSendMessage}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            isUploading={isUploading}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
          />
        )}
      </div>
    </div>
  );
}
