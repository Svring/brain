import React, { useState } from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQuery } from "@tanstack/react-query";
import { BaseResourceMessage } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { MessagePopover } from "@/components/chat/messages/system-messages.tsx/components/message-popover";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { Pencil } from "lucide-react";
import ObjectStorageMessageMenu from "./components/objectstorage-message-menu";
import {
  BasicInfoSection,
  PolicySection,
  AccessConfigSection,
  PolicyPopoverContent,
  AccessConfigPopoverContent,
} from "./components/objectstorage-message";

type ActiveSection = "policy" | "access-config" | null;

interface ObjectStorageMessageProps {
  target: CustomResourceTarget;
}

export const ObjectStorageMessage: React.FC<ObjectStorageMessageProps> = ({
  target,
}) => {
  const { objectstorage } = useTRPCClients();
  const appendSystemMessageMutation = useAppendSystemMessageMutation();
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [closingSection, setClosingSection] = useState<ActiveSection>(null);

  const {
    data: objectstorageObject,
    isLoading,
    error,
  } = useQuery(objectstorage.get.queryOptions(target));

  // console.log("objectstorageObject", objectstorageObject);

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
      case "policy":
        return "Storage Policy";
      case "access-config":
        return "Access Configuration";
    }
  };

  // Dynamic popover content based on active section
  const getPopoverContent = () => {
    // Use closingSection if popover is closing, otherwise use activeSection
    const currentSection = closingSection || activeSection;
    
    if (!currentSection || !objectstorageObject) {
      return null;
    }

    // Use extracted popover content components
    switch (currentSection) {
      case "policy":
        return <PolicyPopoverContent objectstorageObject={objectstorageObject} target={target} />;
      case "access-config":
        return <AccessConfigPopoverContent objectstorageObject={objectstorageObject} />;
      default:
        return null;
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <BaseResourceMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">
            Loading object storage information...
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  // Handle error state
  if (error || !objectstorageObject) {
    return (
      <BaseResourceMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load object storage information
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  // Main content with basic info at top and sectioned layout below
  const mainContent = (
    <div className="space-y-2">
      {/* Basic Info Section - Full Width */}
      <BasicInfoSection objectstorageObject={objectstorageObject as any} />
      
      {/* Policy and Access Config in same row */}
      <div className="flex gap-2">
        <PolicySection
          objectstorageObject={objectstorageObject as any}
          target={target}
          onSectionClick={() => handleSectionClick("policy")}
        />
        <AccessConfigSection
          objectstorageObject={objectstorageObject as any}
          onSectionClick={() => handleSectionClick("access-config")}
        />
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
        headerSlot={<ObjectStorageMessageMenu target={target} />}
      >
        {mainContent}
      </BaseResourceMessage>
    </MessagePopover>
  );
};

export default ObjectStorageMessage;
