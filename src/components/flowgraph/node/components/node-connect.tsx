"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
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
    launchpad.updateLaunchpad.mutationOptions()
  );

  const getEnvVarsToAdd = () => {
    if (!fullResource) return {};
    const envVars: Record<string, any> = {};
    const name = resource.name.toUpperCase();

    if (resource.kind.toLowerCase() === "cluster" && fullResource.connection) {
      const { privateConnection, publicConnection } = fullResource.connection;
      if (privateConnection) {
        const privateVars = {
          [`${name}_HOST`]: privateConnection.host,
          [`${name}_PORT`]: privateConnection.port,
          [`${name}_USERNAME`]: privateConnection.username,
          [`${name}_PASSWORD`]: privateConnection.password,
          [`${name}_CONNECTION_STRING`]: privateConnection.connectionString,
        };
        Object.entries(privateVars).forEach(([key, value]) => {
          if (value) {
            envVars[key] = { name: key, value: value as string };
          }
        });
      }
      if (publicConnection) {
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
      const { access } = fullResource;
      const accessVars = {
        [`${name}_BUCKET`]: access.bucket,
        [`${name}_EXTERNAL`]: access.external,
        [`${name}_INTERNAL`]: access.internal,
        [`${name}_ACCESS_KEY`]: access.accessKey,
        [`${name}_SECRET_KEY`]: access.secretKey,
      };
      Object.entries(accessVars).forEach(([key, value]) => {
        if (value) {
          envVars[key] = { name: key, value: value as string };
        }
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
        {keys.map((key) => (
          <div key={key} className="break-words">
            <strong>{key}:</strong>{" "}
            {key.includes("PASSWORD") || key.includes("SECRET_KEY")
              ? "***"
              : envVars[key].value}
          </div>
        ))}
      </div>
    );
  };

  const handleResourceClick = async () => {
    if (!launchpadTarget || !fullResource || !launchpadResource) return;

    const envVarsToAdd = getEnvVarsToAdd();
    if (Object.keys(envVarsToAdd).length === 0) return;

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
      request: { env: updatedEnv },
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50 cursor-pointer"
            onClick={handleResourceClick}
          >
            <div>
              <span className="text-sm font-medium">{resource.name}</span>
              <span className="text-xs text-muted-foreground ml-2">
                ({resource.kind})
              </span>
            </div>
            <Plus className="w-4 h-4 text-muted-foreground" />
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
  const isHovering = useHover(ref);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { clusterResources, objectStorageBucketResources } =
    useFlowgraphResources();

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      {children}
      {isHovering && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <div
              className="absolute -top-4 -left-6 z-50 pointer-events-auto"
              onClick={handlePlusClick}
            >
              <div className="flex items-center justify-center rounded-full shadow-lg transition-all duration-150 cursor-pointer">
                <Plus className="w-8 h-8" />
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
