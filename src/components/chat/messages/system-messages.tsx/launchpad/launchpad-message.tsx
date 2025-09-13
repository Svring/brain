import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { BaseResourceMessage } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { MessagePopover } from "@/components/chat/messages/system-messages.tsx/components/message-popover";
import { FileText, Container, BarChart3, Pencil, Globe } from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import LaunchpadMessageMenu from "./components/launchpad-message-menu";
import { LaunchpadObjectSchema } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";
import {
  BasicInfoSection,
  BasicInfoPopoverContent,
  ResourceSection,
  DeploymentSection,
  NetworkSection,
  AdvancedConfigSection,
  ResourcePopoverContent,
  DeploymentPopoverContent,
  NetworkPopoverContent,
  AdvancedConfigPopoverContent,
} from "./components/launchpad-message";

type ActiveSection =
  | "basic-info"
  | "resource"
  | "deployment"
  | "network"
  | "advanced-config"
  | null;

interface LaunchpadInfoMessageProps {
  target: BuiltinResourceTarget;
}

export const LaunchpadInfoMessageCard: React.FC<LaunchpadInfoMessageProps> = ({
  target,
}) => {
  const { launchpad } = useTRPCClients();
  const appendSystemMessageMutation = useAppendSystemMessageMutation();
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [closingSection, setClosingSection] = useState<ActiveSection>(null);

  // Fetch launchpad data using the target
  const {
    data: launchpadObjectData,
    isLoading,
    error,
  } = useQuery(launchpad.get.queryOptions(target));

  const actions: MessageAction[] = [];

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
      case "basic-info":
        return "Basic Information";
      case "resource":
        return "Resource Metrics";
      case "deployment":
        return "Deployment Configuration";
      case "network":
        return "Network Ports";
      case "advanced-config":
        return "Advanced Configuration";
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
      case "basic-info":
        return <BasicInfoPopoverContent target={target} />;
      case "resource":
        return <ResourcePopoverContent target={target} />;
      case "deployment":
        return <DeploymentPopoverContent target={target} />;
      case "network":
        return <NetworkPopoverContent target={target} />;
      case "advanced-config":
        return <AdvancedConfigPopoverContent target={target} />;
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
            Loading launchpad information...
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  const launchpadObject = LaunchpadObjectSchema.parse(launchpadObjectData);

  // Show error state
  if (error || !launchpadObject) {
    return (
      <BaseResourceMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load launchpad information
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  // Main content with basic info at top and reorganized sections below
  const mainContent = (
    <div className="space-y-2">
      {/* Basic Info Section - Full Width */}
      <BasicInfoSection
        target={target}
        onSectionClick={() => handleSectionClick("basic-info")}
      />

      {/* Resource and Deployment in one row */}
      <div className="flex gap-2">
        <div className="flex-1">
          <ResourceSection
            target={target}
            onSectionClick={() => handleSectionClick("resource")}
          />
        </div>
        <div className="flex-1">
          <DeploymentSection
            target={target}
            onSectionClick={() => handleSectionClick("deployment")}
          />
        </div>
      </div>

      {/* Network and Advanced Config in one row */}
      <div className="flex gap-2">
        <div className="flex-1">
          <NetworkSection
            target={target}
            onSectionClick={() => handleSectionClick("network")}
          />
        </div>
        <div className="flex-1">
          <AdvancedConfigSection
            target={target}
            onSectionClick={() => handleSectionClick("advanced-config")}
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
        headerSlot={<LaunchpadMessageMenu target={target} />}
      >
        {mainContent}
      </BaseResourceMessage>
    </MessagePopover>
  );
};

export default LaunchpadInfoMessageCard;
