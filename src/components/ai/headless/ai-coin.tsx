import { StarBorder } from "@/components/ui/star-border";
import { cn } from "@/lib/utils";
import { Bird } from "lucide-react";

export default function AiCoin() {
  return (
    <StarBorder
      isRound
      className={cn("absolute w-12 h-12 p-2 right-2 bottom-2 ")}
    >
      <Bird className="w-full h-full" />
    </StarBorder>
  );
}
