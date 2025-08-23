"use client";

import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import { useCreateNewChatSessionMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AiChatHeaderProps {
  title?: string;
  description?: string;
  className?: string;
}

export function AiChatHeader({
  title = "AI Assistant",
  description = "Chat with Sealos Brain AI to help with your projects",
  className = "p-6 pb-0 shrink-0",
}: AiChatHeaderProps) {
  const { mutate: createNewChatSession, isPending } =
    useCreateNewChatSessionMutation();
  const { sendSystemMessage } = useAppendSystemMessageMutation();

  const handleNewChat = () => {
    createNewChatSession();
  };

  const handleCreateResource = (resourceType: string) => {
    sendSystemMessage({
      type: `manage.${resourceType}Create` as any,
      payload: {},
    });
  };

  return (
    <SheetHeader className={className}>
      <div className="flex items-center gap-4">
        <div>
          <SheetTitle>{title}</SheetTitle>
          {/* <SheetDescription>{description}</SheetDescription> */}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleNewChat}
            disabled={isPending}
            size="sm"
            variant="outline"
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isPending ? "Creating..." : "New Chat"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="shrink-0">
                New Resource
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleCreateResource("devbox")}>
                Devbox
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateResource("cluster")}>
                Database Cluster
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleCreateResource("deployment")}
              >
                Deployment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </SheetHeader>
  );
}
