import { StarBorder } from "@/components/ui/star-border";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";
import { useChatActions, useChatState } from "@/contexts/chat/chat-context";

export default function AiCoin() {
  const { openSidebarChat } = useChatActions();
  const { sidebarChatOpen } = useChatState();

  // Hide the coin when the sidebar chat is open
  if (sidebarChatOpen) return null;

  const handleClick = () => {
    openSidebarChat();
  };

  return (
    <StarBorder
      isRound
      className={cn(
        "absolute w-12 h-12 right-4 bottom-4 cursor-pointer hover:scale-105 transition-transform z-10"
      )}
      onClick={handleClick}
    >
      <MessageCircle className="w-full h-full p-3" />
    </StarBorder>
  );
}
