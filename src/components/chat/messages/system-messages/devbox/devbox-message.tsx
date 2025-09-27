import React, { useState, useEffect } from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { devboxClient } from "@/components/provider/trpc-provider";
import { BaseResourceMessage } from "@/components/chat/messages/system-messages/components/base-resource-message";
import { MessageAction } from "@/components/chat/messages/system-messages/components/base-resource-message";
import { History, Globe, ArrowLeft } from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useChatActions } from "@/contexts/chat/chat-context";
import DevboxMessageMenu from "./components/devbox-message-menu";
import DevboxNodeIde from "@/components/flowgraph/node/sealos/devbox/devbox-node-ide";
import { Button } from "@/components/ui/button";
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
import { DevboxView } from "@/contexts/navigation/navigation-machine";

type ActiveSection = "resource" | "network" | "ssh" | "release" | null;

interface DevboxMessageProps {
  target: CustomResourceTarget;
  view?: DevboxView;
}

export const DevboxMessage: React.FC<DevboxMessageProps> = ({
  target,
  view,
}) => {
  const appendSystemMessageMutation = useAppendSystemMessageMutation();
  // Initialize activeSection based on the view parameter
  const getInitialSection = (): ActiveSection => {
    if (!view || view === "main") return null;
    return view as ActiveSection;
  };

  const [activeSection, setActiveSection] = useState<ActiveSection>(
    getInitialSection()
  );

  // Update activeSection when view prop changes
  useEffect(() => {
    const newSection = getInitialSection();
    setActiveSection(newSection);
  }, [view]);

  const devboxTrpcClient = devboxClient.useTRPC();

  const {
    data: devboxObject,
    isLoading,
    error,
  } = useQuery(devboxTrpcClient.get.queryOptions(target));

  const actions: MessageAction[] = [];

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
    setActiveSection(section);
    // Trigger scroll to bottom when section changes
    //triggerScrollToBottom();
  };

  // Handle back button click
  const handleBackClick = () => {
    setActiveSection(null);
    // Trigger scroll to bottom when going back
    //triggerScrollToBottom();
  };

  // Get section title based on active section
  const getSectionTitle = () => {
    switch (activeSection) {
      case "resource":
        return "Resource Metrics";
      case "ssh":
        return "SSH Connection";
      case "network":
        return "Network Ports";
      case "release":
        return "Devbox Releases";
      default:
        return "";
    }
  };

  // Get section content based on active section
  const getSectionContent = () => {
    switch (activeSection) {
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
        <div className="w-1/2 min-w-0 max-w-full space-y-2">
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
        <div className="w-1/2 min-w-0 max-w-full space-y-2">
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

  // Section view with header and back button
  const sectionContent = (
    <div className="space-y-3">
      {/* Header with title and back button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleBackClick}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-sm">{getSectionTitle()}</h3>
      </div>

      {/* Section content */}
      <div>{getSectionContent()}</div>
    </div>
  );

  return (
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
      {activeSection ? sectionContent : mainContent}
    </BaseResourceMessage>
  );
};

export default DevboxMessage;
