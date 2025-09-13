"use client";

import React from "react";
import { Calendar, Image } from "lucide-react";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { LaunchpadObjectSchema } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";

interface BasicInfoSectionProps {
  target: BuiltinResourceTarget;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  target,
}) => {
  const { resource: launchpadResource } = useResourceStatus(target);
  const parsedLaunchpadObject = launchpadResource
    ? LaunchpadObjectSchema.parse(launchpadResource)
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
    <div className="p-2 border rounded-lg">
      <div className="flex gap-4">
        {/* Image */}
        <div className="flex-1 flex flex-col">
          <span className="font-medium text-sm">Image</span>
          <span className="text-xs text-muted-foreground truncate">
            {getImageName(parsedLaunchpadObject?.image?.imageName || "")}
          </span>
        </div>

        {/* Created At */}
        <div className="flex-1 flex flex-col">
          <span className="font-medium text-sm">Created</span>
          <span className="text-xs text-muted-foreground truncate">
            {parsedLaunchpadObject?.operationalStatus?.createdAt || "Unknown"}
          </span>
        </div>

        {/* Status */}
        <div className="flex-1 flex flex-col">
          <span className="font-medium text-sm">Status</span>
          <span className="text-xs text-muted-foreground truncate">
            {getUptime(parsedLaunchpadObject?.status || "")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
