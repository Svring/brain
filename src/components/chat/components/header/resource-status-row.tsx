"use client";

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
import { SystemMessageType } from "@/components/chat/messages/system-messages.tsx/systemp-message-types";

interface ResourceStatusRowProps {
  selectedResource: any;
  selectedProject: string | null;
  isDetailPopoverOpen: boolean;
  onDetailPopoverChange: (open: boolean) => void;
}

export function ResourceStatusRow({
  selectedResource,
  selectedProject,
  isDetailPopoverOpen,
  onDetailPopoverChange,
}: ResourceStatusRowProps) {
  const { stage } = useLanggraphState();
  console.log("stage", stage);

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
        return "Project Mode";
      case "manage_resource":
        return "Resource Mode";
      default:
        return "Unknown";
    }
  };

  const renderDetailCard = () => {
    if (!selectedResource) return null;

    const resourceType = selectedResource.resourceType.toLowerCase();

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

  if (!selectedResource && !selectedProject) {
    return null;
  }

  return (
    <div className="mt-2">
      {selectedResource ? (
        <Popover
          open={isDetailPopoverOpen}
          onOpenChange={onDetailPopoverChange}
        >
          <PopoverTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors select-none"
              )}
            >
              <div className="flex items-center">
                {isDetailPopoverOpen ? (
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
              <span className="text-sm text-muted-foreground truncate">
                {selectedResource?.name}
              </span>
              <Link className="h-3 w-3 text-theme-blue" />
              <span className="text-sm truncate text-theme-blue">
                Connected
              </span>
              <span className="text-xs text-theme-blue ml-auto">
                {getStageDisplay()}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="p-0 rounded-xl"
            align="start"
            side="bottom"
            sideOffset={5}
            style={{
              width: "var(--radix-popover-trigger-width)",
            }}
          >
            {renderDetailCard()}
          </PopoverContent>
        </Popover>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-muted/30">
          <Image
            src={getIconUrl()}
            alt="Sealos Brain"
            width={16}
            height={16}
            className="grayscale rounded-sm"
          />
          <span className="text-sm text-muted-foreground truncate">
            {selectedProject}
          </span>
          <Link className="h-3 w-3 text-theme-blue" />
          <span className="text-sm truncate text-theme-blue">Connected</span>
          <span className="text-xs text-theme-blue ml-auto">
            {getStageDisplay()}
          </span>
        </div>
      )}
    </div>
  );
}
