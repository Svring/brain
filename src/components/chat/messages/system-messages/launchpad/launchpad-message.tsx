import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { BaseResourceMessage } from "@/components/chat/messages/system-messages/components/base-resource-message";
import { MessageAction } from "@/components/chat/messages/system-messages/components/base-resource-message";
import {
  FileText,
  Container,
  BarChart3,
  Pencil,
  Globe,
  ArrowLeft,
} from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { Button } from "@/components/ui/button";
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
import { LaunchpadView } from "@/contexts/navigation/navigation-machine";

type ActiveSection =
  | "basic-info"
  | "resource"
  | "deployment"
  | "network"
  | "advanced-config"
  | null;

interface LaunchpadInfoMessageProps {
  target: BuiltinResourceTarget;
  view?: LaunchpadView;
}

export const LaunchpadInfoMessageCard: React.FC<LaunchpadInfoMessageProps> = ({
  target,
  view,
}) => {
  const { launchpad } = useTRPCClients();
  const appendSystemMessageMutation = useAppendSystemMessageMutation();
  
  // Initialize activeSection based on the view parameter
  const getInitialSection = (): ActiveSection => {
    if (!view || view === "main") return null;
    return view as ActiveSection;
  };
  
  const [activeSection, setActiveSection] = useState<ActiveSection>(getInitialSection());
  
  // Update activeSection when view prop changes
  useEffect(() => {
    const newSection = getInitialSection();
    setActiveSection(newSection);
  }, [view]);

  const { triggerScrollToBottom } = useChatActions();

  // Fetch launchpad data using the target
  const {
    data: launchpadObjectData,
    isLoading,
    error,
  } = useQuery(launchpad.get.queryOptions(target));

  const actions: MessageAction[] = [];

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
      default:
        return "";
    }
  };

  // Get section content based on active section
  const getSectionContent = () => {
    switch (activeSection) {
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
      headerSlot={<LaunchpadMessageMenu target={target} />}
    >
      {activeSection ? sectionContent : mainContent}
    </BaseResourceMessage>
  );
};

export default LaunchpadInfoMessageCard;
