"use client";

import React, { useState, useMemo } from "react";
import { Network } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { NetworkChart } from "../../../components/network-chart";
import { Button } from "@/components/ui/button";
import { DevboxUpdateForm } from "@/components/forms/devbox/devbox-update-form";
import { DevboxUpdateFormData } from "@/schemas/forms/devbox/devbox-update-form-schema";
import { useDevboxUpdate } from "@/hooks/sealos/devbox/use-devbox-update";
import { useChatActions } from "@/contexts/chat/chat-context";

interface NetworkSectionProps {
  target: CustomResourceTarget;
  onSectionClick: () => void;
}

// Network Popover Content Component
export const NetworkPopoverContent: React.FC<{
  target: CustomResourceTarget;
}> = ({ target }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { resource: devboxObject } = useResourceStatus(target);
  const { triggerScrollToBottom } = useChatActions();

  // Update devbox using the custom hook
  const { updateDevbox, isLoading: isUpdating } = useDevboxUpdate({
    onSuccess: () => {
      setIsEditing(false);
    },
  });

  const handleFormSubmit = async (data: DevboxUpdateFormData) => {
    try {
      await updateDevbox({
        name: devboxObject?.name || target.name!,
        ports: data.ports,
      });
    } catch (error) {
      console.error("Error updating devbox ports:", error);
    }
  };

  // Memoize the form content to prevent unnecessary re-renders
  const formContent = useMemo(() => (
    <DevboxUpdateForm
      key={`network-edit-${target.name}`}
      defaultValues={{
        name: devboxObject?.name || target.name!,
        ports: devboxObject?.ports || [],
      }}
      onSubmit={handleFormSubmit}
      isLoading={isUpdating}
      hideDefaultButton={true}
    />
  ), [devboxObject?.name, devboxObject?.ports, target.name, isUpdating]);

  if (isEditing) {
    return (
      <div className="w-full rounded-lg">
        <div className="space-y-3">
          {formContent}
        </div>
        
        {/* Cancel and Confirm Buttons - Fixed at bottom */}
        <div className="flex gap-2 mt-3 pt-3 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => {
              setIsEditing(false);
              //triggerScrollToBottom();
            }}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            form="devbox-update-form"
            variant="default" 
            size="sm" 
            className="flex-1"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Confirm"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg space-y-3">
      <NetworkChart target={target} />
      
      {/* Edit Button - Full Row */}
      <div className="w-full">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => {
            setIsEditing(true);
            //triggerScrollToBottom();
          }}
        >
          Edit Ports
        </Button>
      </div>
    </div>
  );
};

export const NetworkSection: React.FC<NetworkSectionProps> = ({
  target,
  onSectionClick,
}) => {
  const { resource: devboxObject } = useResourceStatus(target);
  const portsCount = devboxObject?.ports?.length || 0;

  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-tertiary transition-colors"
      onClick={onSectionClick}
    >
      <div className="flex items-center gap-2">
        <Network className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">Network</span>
          <span className="text-xs text-muted-foreground">
            {portsCount} ports
          </span>
        </div>
      </div>
    </div>
  );
};

export default NetworkSection;
