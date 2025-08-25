"use client";

import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, Eraser } from "lucide-react";
import { useCreateNewChatSessionMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { Spinner } from "@/components/ui/spinner";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useProjectState } from "@/contexts/project/project-context";

interface AiChatHeaderProps {
  title?: string;
  description?: string;
  className?: string;
}

export function AiChatHeader({
  title = "Chat",
  description = "Chat with Sealos Brain AI to help with your projects",
  className = "p-6 pb-0 shrink-0",
}: AiChatHeaderProps) {
  const { auth } = useAuthState();
  const { selectedProject } = useProjectState();
  const { mutate: createNewChatSession, isPending } =
    useCreateNewChatSessionMutation();

  return (
    <SheetHeader className={className}>
      <div className="flex items-center gap-2">
        <div>
          <SheetTitle>{title}</SheetTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() =>
              createNewChatSession({
                kubeconfig: auth!.kubeconfig,
                projectName: selectedProject!,
              })
            }
            disabled={isPending}
            size="icon"
            variant="ghost"
          >
            {isPending ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Eraser className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </SheetHeader>
  );
}
