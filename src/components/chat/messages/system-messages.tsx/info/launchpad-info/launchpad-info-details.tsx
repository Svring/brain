import React from "react";

interface LaunchpadInfoDetailsProps {
  launchpadData: any;
}

export const LaunchpadInfoDetails: React.FC<LaunchpadInfoDetailsProps> = ({
  launchpadData,
}) => {
  const { resource, image, operationalStatus } = launchpadData;

  const formatValue = (value: any, type: "cpu" | "memory" | "storage") => {
    if (!value) return "N/A";
    if (type === "cpu") return `${value}m`;
    if (type === "memory") return `${value}MB`;
    if (type === "storage") return `${value}GB`;
    return value;
  };

  return (
    <div className="space-y-4">
      {/* Replicas and Created At Info */}
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

      {/* CPU and Memory Info */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">CPU</span>
          <span className="text-sm font-medium">
            {formatValue(resource?.cpu, "cpu")}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Memory</span>
          <span className="text-sm font-medium">
            {formatValue(resource?.memory, "memory")}
          </span>
        </div>
      </div>

      {/* Image Info */}
      {image && (
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Image</span>
          <span className="text-sm font-medium truncate">{image}</span>
        </div>
      )}
    </div>
  );
};
