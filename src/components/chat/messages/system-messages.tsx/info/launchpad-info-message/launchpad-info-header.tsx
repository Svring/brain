import React from "react";
import { CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket } from "lucide-react";

interface LaunchpadInfoHeaderProps {
  launchpadData: any;
}

export const LaunchpadInfoHeader: React.FC<LaunchpadInfoHeaderProps> = ({
  launchpadData,
}) => {
  const { name, kind, status, resource, image, operationalStatus } =
    launchpadData;
  // Helper function to get status string from different status objects
  const getStatusString = (status: any): string => {
    if (typeof status === "string") return status;

    // Handle deployment status
    if (status?.paused) return "Stopped";
    if (
      status?.unavailableReplicas !== undefined &&
      status.unavailableReplicas > 0
    )
      return "Error";
    if (status?.readyReplicas === status?.replicas) return "Running";
    if (status?.replicas !== undefined) return "Pending";

    // Handle statefulset status
    if (status?.readyReplicas === status?.replicas) return "Running";
    if (status?.replicas !== undefined) return "Pending";

    return "Unknown";
  };

  const statusString = getStatusString(status);

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "running":
        return "default";
      case "pending":
        return "secondary";
      case "stopped":
        return "outline";
      case "error":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <CardHeader className="">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Rocket className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground leading-none">
                  {kind.charAt(0).toUpperCase() + kind.slice(1)}
                </span>
                {statusString && (
                  <Badge variant={getStatusVariant(statusString)}>
                    {statusString}
                  </Badge>
                )}
              </div>
              <span className="text-lg font-bold text-foreground leading-tight truncate">
                {name}
              </span>
            </div>
          </div>
        </div>
        <Badge>{statusString}</Badge>
      </div>

      {/* Replicas and Created At Info */}
      <div className="pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-6">
          {resource && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Replicas</span>
              <span className="text-sm font-medium">
                {resource.replicas || "N/A"}
              </span>
            </div>
          )}
          {operationalStatus && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Created At</span>
              <span className="text-sm font-medium truncate">
                {operationalStatus.createdAt}
              </span>
            </div>
          )}
        </div>
        {image && (
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Image</span>
            <span className="text-sm font-medium truncate">{image}</span>
          </div>
        )}
      </div>
    </CardHeader>
  );
};
