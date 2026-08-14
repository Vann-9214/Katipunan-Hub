import { MessageSquareText } from "lucide-react";

export default function DefaultMessagePage() {
  return (
    // Wraps the empty state in the same gold card style
    <div className="w-full h-full p-[2px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-xl opacity-60">
      <div className="w-full h-full bg-white rounded-[22px] flex flex-col items-center justify-center text-gray-400 space-y-4 bg-[url('/noise.png')]">
        <div className="w-24 h-24 bg-[#EFBF04]/10 rounded-full flex items-center justify-center mb-2">
          <MessageSquareText size={48} className="text-[#EFBF04]" />
        </div>
        <h2 className="text-2xl font-bold font-montserrat text-[#8B0E0E]">
          Select a conversation
        </h2>
        <p className="text-sm text-gray-500 font-ptsans max-w-xs text-center">
          Choose a person from the list on the left to start messaging or find
          new people to chat with.
        </p>
      </div>
    </div>
  );
}
