import { StarBorder } from "@/components/ui/star-border";
import { cn } from "@/lib/utils";
import { Coins } from "lucide-react";

export function AiCoin() {
  return (
    <StarBorder isRound className={cn("w-12 h-12 p-2 right-2 bottom-2 ")}>
      <Coins className="w-full h-full" />
    </StarBorder>
  );
}
