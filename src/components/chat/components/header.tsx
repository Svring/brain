"use client";

import { useProjectState } from "@/contexts/project/project-context";
import { useState } from "react";
import { HeaderActions } from "./header/header-actions";
import {
  Link,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getResourceDefaultIcon } from "@/lib/sealos/sealos-utils";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { SystemMessageType } from "@/components/chat/messages/system-messages/systemp-message-types";
import { Separator } from "@/components/ui/separator";

interface AiChatHeaderProps {
  title?: string;
}

export function AiChatHeader({ title = "Chat" }: AiChatHeaderProps) {
  const { selectedResource, selectedProject } = useProjectState();
  const { stage } = useLanggraphState();
  const [isExpanded, setIsExpanded] = useState(false);

  const getIconUrl = () =>
    selectedResource
      ? getResourceDefaultIcon(selectedResource.resourceType) ||
        "https://sealos.run/logo.svg"
      : "/sealos-brain-icon-grayscale.svg";

  const getStageDisplay = () => {
    switch (stage) {
      case "propose_project":
        return "Propose";
      case "manage_project":
        return "Project";
      case "manage_resource":
        return "Resource";
      default:
        return "Unknown";
    }
  };

  const renderDetailCard = () => {
    if (!selectedResource) return null;

    const resourceType = selectedResource.resourceType?.toLowerCase() || "";

    // Get the appropriate detail component based on resource type
    let DetailComponent = null;

    switch (resourceType) {
      case "devbox":
        DetailComponent = SystemMessageType.devbox.detail(
          selectedResource as any
        );
        break;
      case "cluster":
        DetailComponent = SystemMessageType.cluster.detail(
          selectedResource as any
        );
        break;
      case "deployment":
        DetailComponent = SystemMessageType.launchpad.detail(
          selectedResource as any
        );
        break;
      case "statefulset":
        DetailComponent = SystemMessageType.launchpad.detail(
          selectedResource as any
        );
        break;
      case "objectstoragebucket":
        DetailComponent = SystemMessageType.objectstorage.detail(
          selectedResource as any
        );
        break;
      default:
        return null;
    }

    return (
      <div className="max-h-[500px] overflow-y-auto">{DetailComponent}</div>
    );
  };

  return (
    <div className="px-4 pt-2 shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-foreground text-lg">{title}</h2>

          <Separator
            orientation="vertical"
            className="h-4! w-px! bg-border-primary!"
          />

          {/* Resource Status Row - merged inline */}
          {(selectedResource || selectedProject) && (
            <div className="flex items-center">
              {selectedResource ? (
                <Popover open={isExpanded} onOpenChange={setIsExpanded}>
                  <PopoverTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-muted/50 transition-colors select-none"
                      )}
                    >
                      <div className="flex items-center">
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <Image
                        src={getIconUrl()}
                        alt={selectedResource?.resourceType || "Sealos Brain"}
                        width={16}
                        height={16}
                        className="rounded-sm"
                      />
                      <span className="text-muted-foreground truncate">
                        {selectedResource?.name}
                      </span>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-0 rounded-xl mr-3"
                    align="start"
                    side="bottom"
                    sideOffset={5}
                    style={{
                      width: "calc(35vw - 2rem)",
                      minWidth: "400px",
                    }}
                  >
                    {renderDetailCard()}
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="flex items-center gap-2 py-1.5">
                  {/* <Image
                    src={getIconUrl()}
                    alt="Sealos Brain"
                    width={16}
                    height={16}
                    className="grayscale rounded-sm"
                  /> */}
                  <span className="text-sm text-muted-foreground truncate">
                    {selectedProject}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <HeaderActions />
      </div>
    </div>
  );
}
