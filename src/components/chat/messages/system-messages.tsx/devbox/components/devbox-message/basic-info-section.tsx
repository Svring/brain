"use client";

import React from "react";
import { Image } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { DevboxObjectSchema } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";

interface BasicInfoSectionProps {
  target: CustomResourceTarget;
  onSectionClick: () => void;
}

// Basic Info Popover Content Component
export const BasicInfoPopoverContent: React.FC<{
  target: CustomResourceTarget;
}> = ({ target }) => {
  const { resource: devboxResource } = useResourceStatus(target);
  const parsedDevboxObject = devboxResource
    ? DevboxObjectSchema.parse(devboxResource)
    : null;

  if (!parsedDevboxObject) {
    return (
      <div className="bg-background-tertiary rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          Devbox information not available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Basic Information</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Runtime:</span>
              <span className="ml-2">{parsedDevboxObject.runtime}</span>
            </div>
            <div>
              <span className="text-muted-foreground">CreatedAt:</span>
              <span className="ml-2">
                {parsedDevboxObject.operationalStatus?.createdAt}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  target,
  onSectionClick,
}) => {
  const { resource: devboxResource } = useResourceStatus(target);
  const parsedDevboxObject = devboxResource
    ? DevboxObjectSchema.parse(devboxResource)
    : null;

  // Helper function to format image name (extract just the image name without full path)
  const getImageName = (image: string) => {
    if (!image) return "Unknown";
    const parts = image.split("/");
    return parts[parts.length - 1] || image;
  };

  // Helper function to format uptime (using status as a proxy for uptime info)
  const getUptime = (status: string) => {
    if (!status) return "Unknown";
    return status === "Running" ? "Active" : status;
  };

  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-secondary transition-colors"
      onClick={onSectionClick}
    >
      <div className="flex gap-2">
        {/* Image */}
        <div className="flex-1 flex flex-col">
          <span className="font-medium text-sm">Image</span>
          <span className="text-xs text-muted-foreground truncate">
            {getImageName(parsedDevboxObject?.image || "")}
          </span>
        </div>

        {/* Created At (using ID as a proxy since createdAt is not available) */}
        <div className="flex-1 flex flex-col">
          <span className="font-medium text-sm">ID</span>
          <span className="text-xs text-muted-foreground truncate">
            {parsedDevboxObject?.id || "Unknown"}
          </span>
        </div>

        {/* UpTime (using status as a proxy) */}
        <div className="flex-1 flex flex-col">
          <span className="font-medium text-sm">Status</span>
          <span className="text-xs text-muted-foreground truncate">
            {getUptime(parsedDevboxObject?.status || "")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
