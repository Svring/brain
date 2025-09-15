"use client";

import { useRef, useState, useEffect } from "react";
import { Plus, Spline } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFlowgraphResources } from "@/hooks/flowgraph/use-flowgraph-resources";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { useHover } from "@reactuses/core";
import { Env } from "@/schemas/forms/universal/env-schema";
import { deriveClusterEnvVariable } from "@/lib/sealos/services/env/cluster/cluster-env-utils";
import { deriveObjectStorageEnvVariable } from "@/lib/sealos/services/env/objectstorage/objectstorage-env-utils";
import { Spinner } from "@/components/ui/spinner";
import { useFlowgraphState } from "@/contexts/flowgraph/flowgraph-context";

interface NodeConnectProps {
  children: React.ReactNode;
  className?: string;
  onConnect?: () => void;
  target?: any;
}

// Simplified resource item component
function ResourceItem({
  resource,
  launchpadTarget,
}: {
  resource: any;
  launchpadTarget?: any;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { edges } = useFlowgraphState();
  const target = convertResourceObjectToTarget({
    kind: resource.kind,
    name: resource.name,
  });
  const { resource: fullResource } = useResourceStatus(target);
  const { resource: launchpadResource } = useResourceStatus(
    launchpadTarget || {}
  ) as { resource: any };
  const { launchpad } = useTRPCClients();
  const updateLaunchpadMutation = useMutation(
    launchpad.update.mutationOptions()
  );

  // Check if the resource is already connected to the launchpad target
  const isConnected = () => {
    if (!launchpadTarget) return false;

    // Generate node IDs using the same pattern as flowgraph-nodes-utils
    const resourceNodeId = `${resource.kind?.toLowerCase() || "unknown"}-${
      resource.name || ""
    }`;
    const launchpadNodeId = `${
      launchpadTarget.resourceType?.toLowerCase() || "unknown"
    }-${launchpadTarget.name || ""}`;

    // Check if there's an edge connecting the resource to the launchpad target
    return edges.some(
      (edge) =>
        (edge.source === resourceNodeId && edge.target === launchpadNodeId) ||
        (edge.source === launchpadNodeId && edge.target === resourceNodeId)
    );
  };

  const getEnvVarsToAdd = () => {
    if (!fullResource) return {};
    const envVars: Record<string, any> = {};

    if (resource.kind.toLowerCase() === "cluster" && fullResource.connection) {
      // Use cluster name to derive environment variables
      const clusterEnvVars = deriveClusterEnvVariable(resource.name);
      clusterEnvVars.forEach((envVar) => {
        envVars[envVar.name] = envVar;
      });

      // Add public connection variables if available
      const { publicConnection } = fullResource.connection;
      if (publicConnection) {
        const name = resource.name.toUpperCase();
        const publicVars = {
          [`${name}_PUBLIC_PORT`]: publicConnection.port?.toString(),
          [`${name}_PUBLIC_CONNECTION_STRING`]:
            publicConnection.connectionString,
        };
        Object.entries(publicVars).forEach(([key, value]) => {
          if (value) {
            envVars[key] = { name: key, value: value as string };
          }
        });
      }
    }

    if (
      resource.kind.toLowerCase() === "objectstoragebucket" &&
      fullResource.access
    ) {
      // Use object storage displayName to derive environment variables
      const objectStorageEnvVars = deriveObjectStorageEnvVariable(
        fullResource.displayName
      );
      console.log("objectStorageEnvVars", objectStorageEnvVars);
      objectStorageEnvVars.forEach((envVar) => {
        envVars[envVar.name] = envVar;
      });
    }

    return envVars;
  };

  const getTooltipContent = () => {
    if (!fullResource) return "Loading...";
    const envVars = getEnvVarsToAdd();
    const keys = Object.keys(envVars);

    if (keys.length === 0) {
      return (
        <div className="text-xs text-muted-foreground">
          No connection/access information available
        </div>
      );
    }

    return (
      <div className="space-y-1 text-xs">
        {keys.map((key) => {
          const envVar = envVars[key];
          const isSecret =
            key.includes("PASSWORD") || key.includes("SECRET_KEY");

          // Handle both value and valueFrom cases
          let displayValue: string;
          if (envVar.value) {
            // Direct value (for public connection variables)
            displayValue = isSecret ? "***" : envVar.value;
          } else if (envVar.valueFrom?.secretKeyRef) {
            // Secret reference (for utility function generated variables)
            displayValue = isSecret
              ? "***"
              : `from secret: ${envVar.valueFrom.secretKeyRef.name}`;
          } else {
            displayValue = "N/A";
          }

          return (
            <div key={key} className="break-words">
              <strong>{key}:</strong> {displayValue}
            </div>
          );
        })}
      </div>
    );
  };

  const handleResourceClick = async () => {
    if (
      !launchpadTarget ||
      !fullResource ||
      !launchpadResource ||
      isLoading ||
      isConnected()
    )
      return;

    const envVarsToAdd = getEnvVarsToAdd();
    if (Object.keys(envVarsToAdd).length === 0) return;

    setIsLoading(true);

    try {
      const currentEnv = (launchpadResource.env || []).reduce(
        (acc: Record<string, any>, envVar: any) => {
          if (envVar.name) {
            acc[envVar.name] = {
              name: envVar.name,
              value: envVar.value,
              valueFrom: envVar.valueFrom,
            };
          }
          return acc;
        },
        {}
      );

      const mergedEnv = { ...currentEnv, ...envVarsToAdd };
      const updatedEnv = Object.values(mergedEnv) as Env[];

      await updateLaunchpadMutation.mutateAsync({
        name: launchpadTarget.name,
        env: updatedEnv,
      });

      // Reload the page after successful update
      window.location.reload();
    } catch (error) {
      console.error("Failed to update launchpad:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center justify-between p-2 border rounded-md",
              isConnected()
                ? "opacity-50 cursor-not-allowed bg-muted/30"
                : isLoading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-muted/50"
            )}
            onClick={handleResourceClick}
          >
            <div>
              <span className="text-sm font-medium">{resource.name}</span>
              <span className="text-xs text-muted-foreground ml-2">
                ({resource.kind})
              </span>
            </div>
            {isConnected() ? (
              <span className="text-xs text-green-600 font-medium">
                Connected
              </span>
            ) : isLoading ? (
              <Spinner
                variant="bars"
                size={16}
                className="text-muted-foreground"
              />
            ) : (
              <Plus className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function NodeConnect({
  children,
  className,
  onConnect,
  target,
}: NodeConnectProps) {
  const ref = useRef<HTMLDivElement>(null);
  const plusRef = useRef<HTMLDivElement>(null);
  const isHovering = useHover(ref);
  const isPlusHovering = useHover(plusRef);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const { clusterResources, objectStorageBucketResources } =
    useFlowgraphResources();

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  // Show plus icon when hovering over the container OR the plus icon itself
  const shouldShowPlus = isHovering || isPlusHovering || isDialogOpen;

  // Add delay when hiding the icon
  useEffect(() => {
    if (shouldShowPlus) {
      setShowIcon(true);
    } else {
      const timer = setTimeout(() => {
        setShowIcon(false);
      }, 300); // 300ms delay before hiding

      return () => clearTimeout(timer);
    }
  }, [shouldShowPlus]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {children}
      {showIcon && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <div
              ref={plusRef}
              className="absolute -top-5 -left-5 z-50 pointer-events-auto"
              onClick={handlePlusClick}
            >
              <div className="flex items-center justify-center rounded-full shadow-lg transition-all duration-200 cursor-pointer hover:scale-115">
                <Spline className="w-8 h-8" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect Node</DialogTitle>
              <DialogDescription>
                Choose how you want to connect this node to other resources.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {clusterResources.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Cluster Resources
                  </h3>
                  <div className="space-y-2">
                    {clusterResources.map((resource, index) => (
                      <ResourceItem
                        key={`${resource.name}-${index}`}
                        resource={resource}
                        launchpadTarget={target}
                      />
                    ))}
                  </div>
                </div>
              )}
              {objectStorageBucketResources.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Object Storage Buckets
                  </h3>
                  <div className="space-y-2">
                    {objectStorageBucketResources.map((resource, index) => (
                      <ResourceItem
                        key={`${resource.name}-${index}`}
                        resource={resource}
                        launchpadTarget={target}
                      />
                    ))}
                  </div>
                </div>
              )}
              {clusterResources.length === 0 &&
                objectStorageBucketResources.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No available resources to connect to.
                    </p>
                  </div>
                )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
