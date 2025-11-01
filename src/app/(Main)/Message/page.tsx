import { MessageSquareText } from "lucide-react";

export default function DefaultMessagePage() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
      <MessageSquareText size={64} />
      <h2 className="text-xl font-semibold mt-4">Select a chat</h2>
      <p className="text-sm">
        Choose a conversation from the list to start messaging.
      </p>
    </div>
  );
}
