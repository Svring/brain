import React, { useState } from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { clusterClient } from "@/components/provider/trpc-provider";
import { BaseResourceMessage } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { MessagePopover } from "@/components/chat/messages/system-messages.tsx/components/message-popover";
import { EthernetPort, Pencil } from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [closingSection, setClosingSection] = useState<ActiveSection>(null);

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
        return "Resource Configuration";
      case "connect":
        return "Cluster Connection";
      case "backup":
        return "Cluster Backups";
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
        headerSlot={<ClusterMessageMenu target={target} />}
      >
        {mainContent}
      </BaseResourceMessage>
    </MessagePopover>
  );
};

export default ClusterMessage;
