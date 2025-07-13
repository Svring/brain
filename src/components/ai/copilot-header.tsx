import { HeaderProps, useChatContext } from "@copilotkit/react-ui";
import { X } from "lucide-react";

export function CopilotHeader({}: HeaderProps) {
  const { setOpen } = useChatContext();

  return (
    <div className="">
      {/* <div className="flex-1" />
      <div className="w-24 flex justify-end bg-background">
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="bg-background"
        >
          <X size={16} className="text-foreground" />
        </button>
      </div> */}
    </div>
  );
}
