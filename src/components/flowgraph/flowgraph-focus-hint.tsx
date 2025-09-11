"use client";

import { Focus, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatActions } from "@/contexts/chat/chat-context";

interface FlowgraphFocusHintProps {
  projectName: string;
}

export function FlowgraphFocusHint({ projectName }: FlowgraphFocusHintProps) {
  const { minimizeSidebar } = useChatActions();

  return (
    <div className="absolute top-9 inset-x-0 z-20 pointer-events-none">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-background-tertiary backdrop-blur-lg rounded-lg border border-border-primary shadow-lg pointer-events-auto">
          <Focus className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Focused on{" "}
            <span className="font-medium text-foreground">{projectName}</span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-2"
            onClick={minimizeSidebar}
          >
            <Unplug className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
