import { HeaderProps, useChatContext } from "@copilotkit/react-ui";
import { useCopilotChat } from "@copilotkit/react-core";
import { Plus } from "lucide-react";

export function CopilotHeader({}: HeaderProps) {
  const { setOpen } = useChatContext();
  const { reset } = useCopilotChat();

  return (
    <div className="">
      <div />
      {/* <button
        type="button"
        onClick={() => reset()}
        className="ml-auto"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            reset();
          }
        }}
        tabIndex={0}
        aria-label="New Chat"
      >
        <Plus size={20} className="text-foreground" />
      </button> */}
    </div>
  );
}
