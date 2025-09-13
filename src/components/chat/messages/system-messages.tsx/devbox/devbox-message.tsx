import React, { useState } from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { devboxClient } from "@/components/provider/trpc-provider";
import { BaseResourceMessage } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { MessagePopover } from "@/components/chat/messages/system-messages.tsx/components/message-popover";
import { History, Globe } from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import DevboxMessageMenu from "./components/devbox-message-menu";
import DevboxNodeIde from "@/components/flowgraph/node/sealos/devbox/devbox-node-ide";
import {
  BasicInfoSection,
  CpuMemorySection,
  SshSection,
  NetworkSection,
  ReleaseSection,
  CpuMemoryPopoverContent,
  SshPopoverContent,
  NetworkPopoverContent,
  ReleasePopoverContent,
} from "./components/devbox-message";

type ActiveSection = "resource" | "network" | "ssh" | "release" | null;

interface DevboxMessageProps {
  target: CustomResourceTarget;
}

export const DevboxMessage: React.FC<DevboxMessageProps> = ({ target }) => {
  const appendSystemMessageMutation = useAppendSystemMessageMutation();
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [closingSection, setClosingSection] = useState<ActiveSection>(null);

  const devboxTrpcClient = devboxClient.useTRPC();

  const {
    data: devboxObject,
    isLoading,
    error,
  } = useQuery(devboxTrpcClient.get.queryOptions(target));

  const actions: MessageAction[] = devboxObject
    ? [
        // {
        //   icon: History,
        //   label: "Release History",
        //   onClick: () => {
        //     appendSystemMessage({ type: "devbox.release", target });
        //   },
        // },
        // {
        //   icon: Globe,
        //   label: "Ports",
        //   onClick: () => {
        //     appendSystemMessage({ type: "devbox.network", target });
        //   },
        // },
      ]
    : [];

  // Show loading state
  if (isLoading) {
    return (
      <BaseResourceMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">
            Loading devbox information...
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  // Show error state
  if (error || !devboxObject) {
    return (
      <BaseResourceMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load devbox information
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  // Handle section click
  const handleSectionClick = (section: ActiveSection) => {
    // If clicking the same section that's already active and popover is open, close it
    if (activeSection === section && isPopoverOpen) {
      setIsPopoverOpen(false);
      setActiveSection(null);
    } else {
      // If clicking a different section or popover is closed, open with new section
      setActiveSection(section);
      setIsPopoverOpen(true);
    }
  };

  // Get popover title based on active section
  const getPopoverTitle = () => {
    switch (activeSection) {
      case "resource":
        return "Resource Metrics";
      case "ssh":
        return "SSH Connection";
      case "network":
        return "Network Ports";
      case "release":
        return "Devbox Releases";
      // default:
      //   return "Devbox Details";
    }
  };

  // Dynamic popover content based on active section
  const getPopoverContent = () => {
    // Use closingSection if popover is closing, otherwise use activeSection
    const currentSection = closingSection || activeSection;
    
    if (!currentSection) {
      return null;
    }

    // Use extracted popover content components
    switch (currentSection) {
      case "resource":
        return <CpuMemoryPopoverContent target={target} />;
      case "ssh":
        return <SshPopoverContent target={target} />;
      case "network":
        return <NetworkPopoverContent target={target} />;
      case "release":
        return <ReleasePopoverContent target={target} />;
      default:
        return null;
    }
  };

  // Main content with basic info at top and two-column layout below
  const mainContent = (
    <div className="space-y-2">
      {/* Basic Info Section - Full Width */}
      <BasicInfoSection target={target} />
      
      {/* Two-column layout for other sections */}
      <div className="flex gap-2">
        {/* Left Half - CPU/Memory and SSH */}
        <div className="w-1/2 space-y-2">
          <CpuMemorySection
            target={target}
            onSectionClick={() => handleSectionClick("resource")}
          />
          <SshSection
            target={target}
            onSectionClick={() => handleSectionClick("ssh")}
          />
        </div>

        {/* Right Half - Network and Release */}
        <div className="w-1/2 space-y-2">
          <NetworkSection
            target={target}
            onSectionClick={() => handleSectionClick("network")}
          />
          <ReleaseSection
            target={target}
            onSectionClick={() => handleSectionClick("release")}
          />
        </div>
      </div>
    </div>
  );

  return (
    <MessagePopover
      popoverTitle={getPopoverTitle()}
      popoverContent={getPopoverContent()}
      showTrigger={false}
      disableOutsideClick={true}
      open={isPopoverOpen}
      onOpenChange={(open) => {
        setIsPopoverOpen(open);
        // If popover is being closed externally, preserve content during close animation
        if (!open) {
          setClosingSection(activeSection);
          setActiveSection(null);
          // Clear closingSection after animation completes
          setTimeout(() => setClosingSection(null), 200);
        }
      }}
    >
      <BaseResourceMessage
        target={target}
        actions={actions}
        headerSlot={
          <div className="flex items-center gap-2">
            <DevboxNodeIde object={devboxObject} />
            <DevboxMessageMenu target={target} />
          </div>
        }
      >
        {mainContent}
      </BaseResourceMessage>
    </MessagePopover>
  );
};

export default DevboxMessage;
