import { StarBorder } from "@/components/ui/star-border";
import { ButtonProps, useChatContext } from "@copilotkit/react-ui";
import { Cat } from "lucide-react";

export function CopilotButton({}: ButtonProps) {
  const { open, setOpen } = useChatContext();

  return (
    <div className="bottom-8 right-8 fixed" onClick={() => setOpen(!open)}>
      <button
        className={`${open ? "open" : ""}`}
        aria-label={open ? "Close Chat" : "Open Chat"}
      >
        <StarBorder className="w-12 h-12 p-0 flex items-center justify-center border border-text-foreground">
          <Cat size={24} />
        </StarBorder>
      </button>
    </div>
  );
}
