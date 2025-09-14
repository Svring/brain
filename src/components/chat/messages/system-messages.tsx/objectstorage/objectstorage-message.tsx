import React, { useState } from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQuery } from "@tanstack/react-query";
import { BaseResourceMessage } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useChatActions } from "@/contexts/chat/chat-context";
import { Pencil, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ObjectStorageObjectSchema } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";
import ObjectStorageMessageMenu from "./components/objectstorage-message-menu";
import {
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
  const { triggerScrollToBottom } = useChatActions();

  const {
    data: objectstorageObjectData,
    isLoading,
    error,
  } = useQuery(objectstorage.get.queryOptions(target));

  // Parse the object storage object with schema
  const objectstorageObject = objectstorageObjectData
    ? ObjectStorageObjectSchema.parse(objectstorageObjectData)
    : null;

  // console.log("objectstorageObject", objectstorageObject);

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
      case "policy":
        return "Storage Policy";
      case "access-config":
        return "Access Configuration";
      default:
        return "";
    }
  };

  // Get section content based on active section
  const getSectionContent = (): React.ReactNode => {
    if (!objectstorageObject) {
      return null;
    }

    switch (activeSection) {
      case "policy":
        return (
          <PolicyPopoverContent
            objectstorageObject={objectstorageObject}
            target={target}
          />
        );
      case "access-config":
        return (
          <AccessConfigPopoverContent
            objectstorageObject={objectstorageObject}
          />
        );
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

  // Main content with policy and access config sections
  const mainContent = (
    <div className="space-y-2">
      {/* Policy and Access Config in same row */}
      <div className="flex gap-2">
        <div className="flex-1">
          <PolicySection
            objectstorageObject={objectstorageObject!}
            target={target}
            onSectionClick={() => handleSectionClick("policy")}
          />
        </div>
        <div className="flex-1">
          <AccessConfigSection
            objectstorageObject={objectstorageObject!}
            onSectionClick={() => handleSectionClick("access-config")}
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
      headerSlot={<ObjectStorageMessageMenu target={target} />}
    >
      {activeSection ? sectionContent : mainContent}
    </BaseResourceMessage>
  );
};

export default ObjectStorageMessage;
