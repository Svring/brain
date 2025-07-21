import { StarBorder } from "@/components/ui/star-border";
import { cn } from "@/lib/utils";
import { Bird } from "lucide-react";
import { useAiActions } from "@/contexts/ai/ai-context";

export default function AiCoin() {
  const { openChat } = useAiActions();

  const handleClick = () => {
    openChat();
  };

  return (
    <StarBorder
      isRound
      className={cn(
        "absolute w-12 h-12 right-4 bottom-4 cursor-pointer hover:scale-105 transition-transform z-10"
      )}
      onClick={handleClick}
    >
      <Bird className="w-full h-full p-2" />
    </StarBorder>
  );
}
