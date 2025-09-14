import React, { useState } from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { clusterClient } from "@/components/provider/trpc-provider";
import { BaseResourceMessage } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { EthernetPort, Pencil, ArrowLeft } from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useChatActions } from "@/contexts/chat/chat-context";
import { Button } from "@/components/ui/button";
import ClusterMessageMenu from "./components/cluster-message-menu";
import {
  BasicInfoSection,
  ResourceQuotaSection,
  ConnectSection,
  BackupSection,
  ResourceQuotaPopoverContent,
  ConnectPopoverContent,
  BackupPopoverContent,
} from "./components/cluster-message";

type ActiveSection = "resource" | "connect" | "backup" | null;

interface ClusterMessageProps {
  target: CustomResourceTarget;
}

export const ClusterMessage: React.FC<ClusterMessageProps> = ({ target }) => {
  const clusterTrpcClient = clusterClient.useTRPC();
  const appendSystemMessageMutation = useAppendSystemMessageMutation();
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const { triggerScrollToBottom } = useChatActions();

  // Fetch the cluster data using the target
  const {
    data: clusterObject,
    isLoading,
    error,
  } = useQuery(clusterTrpcClient.get.queryOptions(target));

  const actions: MessageAction[] = clusterObject
    ? [
        // {
        //   icon: EthernetPort,
        //   label: "View Connection",
        //   onClick: () => {
        //     appendSystemMessage({ type: "cluster.connection", target });
        //   },
        // },
      ]
    : [];

  // Handle section click
  const handleSectionClick = (section: ActiveSection) => {
    setActiveSection(section);
    // Trigger scroll to bottom when section changes
    triggerScrollToBottom();
  };

  // Handle back button click
  const handleBackClick = () => {
    setActiveSection(null);
    // Trigger scroll to bottom when going back
    triggerScrollToBottom();
  };

  // Get section title based on active section
  const getSectionTitle = () => {
    switch (activeSection) {
      case "resource":
        return "Resource Configuration";
      case "connect":
        return "Cluster Connection";
      case "backup":
        return "Cluster Backups";
      default:
        return "";
    }
  };

  // Get section content based on active section
  const getSectionContent = () => {
    switch (activeSection) {
      case "resource":
        return <ResourceQuotaPopoverContent target={target} />;
      case "connect":
        return <ConnectPopoverContent target={target} />;
      case "backup":
        return <BackupPopoverContent target={target} />;
      default:
        return null;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <BaseResourceMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">
            Loading cluster information...
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  // Show error state
  if (error || !clusterObject) {
    return (
      <BaseResourceMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load cluster information
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  // Main content with basic info at top, full-width resource quota, and two-column layout below
  const mainContent = (
    <div className="space-y-2">
      {/* Basic Info Section - Full Width */}
      <BasicInfoSection target={target} />

      {/* Resource Quota Section - Full Width */}
      <ResourceQuotaSection
        target={target}
        onSectionClick={() => handleSectionClick("resource")}
      />

      {/* Two-column layout for other sections */}
      <div className="flex gap-2">
        {/* Left Half - Connect */}
        <div className="w-1/2 space-y-2">
          <ConnectSection
            target={target}
            onSectionClick={() => handleSectionClick("connect")}
          />
        </div>

        {/* Right Half - Backup */}
        <div className="w-1/2 space-y-2">
          <BackupSection
            target={target}
            onSectionClick={() => handleSectionClick("backup")}
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
      headerSlot={<ClusterMessageMenu target={target} />}
    >
      {activeSection ? sectionContent : mainContent}
    </BaseResourceMessage>
  );
};

export default ClusterMessage;
