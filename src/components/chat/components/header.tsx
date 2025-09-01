"use client";

import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, Eraser } from "lucide-react";
import { useCreateNewChatSessionMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { Spinner } from "@/components/ui/spinner";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useProjectState } from "@/contexts/project/project-context";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { searchThreadsOptions } from "@/lib/langgraph/langgraph-method/langgraph-query";
import { useCopilotContext } from "@copilotkit/react-core";

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
  const { auth } = useAuthState();
  const { selectedProject, selectedResource } = useProjectState();
  const { mutate: createNewChatSession, isPending } =
    useCreateNewChatSessionMutation();
  const { setThreadId } = useCopilotContext();

  const { data: threads } = useQuery(
    searchThreadsOptions({
      resourceName: selectedResource?.name,
      projectName: selectedProject,
      kubeconfig: auth?.kubeconfig,
    })
  );

  // console.log("threads of", selectedResource?.name, threads);

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
    <SheetHeader className={`${className}`}>
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
                resourceName: selectedResource!.name,
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
          {selectedResource && (
            <div className="flex items-center gap-2 text text-muted-foreground">
              <Image
                src={getIconUrl()}
                alt={`${selectedResource.resourceType} Icon`}
                width={16}
                height={16}
                className="rounded-sm h-4 w-4 flex-shrink-0"
                priority
              />
              <span>{selectedResource.name}</span>
            </div>
          )}
        </div>
      </div>
    </SheetHeader>
  );
}
