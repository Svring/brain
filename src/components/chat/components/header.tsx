"use client";

import { Button } from "@/components/ui/button";
import { Eraser, ChevronRight } from "lucide-react";
import { useCreateNewChatSessionMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { Spinner } from "@/components/ui/spinner";
import { useProjectState } from "@/contexts/project/project-context";
import { useChatActions } from "@/contexts/chat/chat-context";
import Image from "next/image";
import { useChatState } from "@/contexts/chat/chat-context";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AiChatHeaderProps {
  title?: string;
  description?: string;
  className?: string;
}

export function AiChatHeader({
  title = "Chat",
  description = "Chat with Sealos Brain AI to help with your projects",
  className = "px-4 pt-2 shrink-0",
}: AiChatHeaderProps) {
  const { selectedResource } = useProjectState();
  const { selectedThreadId } = useChatState();
  const { closeSidebarChat } = useChatActions();
  const { reset } = useCopilotChatHeadless_c();
  const { isPending } = useCreateNewChatSessionMutation();

  const getIconUrl = () => {
    if (!selectedResource) return "https://sealos.run/logo.svg";

    switch (selectedResource.resourceType) {
      case "devbox":
        return "https://devbox.bja.sealos.run/logo.svg";

      case "cluster":
        return "https://dbprovider.bja.sealos.run/logo.svg";

      case "deployment":
      case "statefulset":
        return "https://applaunchpad.bja.sealos.run/logo.svg";

      case "objectstoragebucket":
        return "https://objectstorage.bja.sealos.run/logo.svg";

      default:
        return "https://sealos.run/logo.svg";
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="font-semibold text-foreground text-lg">{title}</h2>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => reset()}
              disabled={isPending}
              size="icon"
              className="h-8 w-8"
              variant="ghost"
            >
              {isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Eraser className="h-4 w-4" />
              )}
            </Button>
            <Separator orientation="vertical" className="h-4!" />
            {selectedResource && (
              <div className="flex items-center gap-2 text text-muted-foreground">
                <span>Selected: </span>
                <Image
                  src={getIconUrl()}
                  alt={`${selectedResource.resourceType} Icon`}
                  width={16}
                  height={16}
                  className="rounded-sm h-4 w-4 flex-shrink-0"
                  priority
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate max-w-[120px] cursor-help">
                        {selectedResource.name}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      className="bg-background-tertiary border border-border-primary"
                      side="bottom"
                      align="start"
                    >
                      <p>{selectedResource.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            {/* {selectedThreadId && (
              <div className="flex items-center gap-2 text text-muted-foreground">
                <span>{selectedThreadId.slice(0, 8)}</span>
              </div>
            )} */}
          </div>
        </div>
        <Button
          onClick={closeSidebarChat}
          size="icon"
          variant="ghost"
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
