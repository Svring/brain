import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { k8sClient } from "@/components/provider/trpc-provider";
import { APP_DEVBOX_ID } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-label";
import { BaseSystemMessage } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import {
  Play,
  Trash2,
  Plus,
  Server,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";

interface DevboxDeployedMessageProps {
  target: CustomResourceTarget;
}

const DeploymentItem: React.FC<{ deployment: any }> = ({
  deployment,
}: {
  deployment: any;
}) => {
  const handleRestart = () => {
    console.log("restart", deployment);
  };

  const handleDelete = () => {
    console.log("delete", deployment);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "running":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="border rounded-lg p-2 hover:brightness-150 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Server className="h-3 w-3 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-xs font-medium truncate">
              {deployment.metadata?.name || "Unknown"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(deployment.metadata?.creationTimestamp)}
            </span>
          </div>
          {/* Status indicator next to server icon */}
          {deployment.status?.phase === "Running" ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Spinner className="h-3 w-3 text-amber-500" />
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Status indicator */}
          <Badge
            variant={getStatusColor(deployment.status?.phase)}
            className="text-xs px-1.5 py-0.5"
          >
            {deployment.status?.phase || "Unknown"}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            className="p-0 border border-border-primary"
            onClick={handleRestart}
            title="Restart"
          >
            <Play className="h-4 w-4" />
            Restart
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="p-0 text-destructive hover:text-destructive"
            onClick={handleDelete}
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const DevboxDeployedMessage: React.FC<DevboxDeployedMessageProps> = ({
  target,
}) => {
  const k8sTrpcClient = k8sClient.useTRPC();

  const {
    data: allResources,
    isLoading,
    error,
  } = useQuery(
    k8sTrpcClient.listAllResources.queryOptions({
      labelSelector: `${APP_DEVBOX_ID}=${target.name}`,
      builtinResourceTypes: ["deployment"],
      customResourceTypes: [],
    })
  );

  // Show loading state
  if (isLoading) {
    return (
      <BaseSystemMessage target={target}>
        <div className="flex items-center justify-center h-20">
          <div className="text-xs text-muted-foreground">
            Loading deployments...
          </div>
        </div>
      </BaseSystemMessage>
    );
  }

  // Show error state
  if (error || !allResources) {
    return (
      <BaseSystemMessage target={target}>
        <div className="flex items-center justify-center h-20">
          <span className="text-destructive text-xs">
            Failed to load devbox deployments
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  const deployments = allResources.builtin?.deployment?.items || [];

  return (
    <BaseSystemMessage target={target}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">
            Deployments: {deployments.length}
          </h3>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => console.log("Create new deployment")}
            title="Create new deployment"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="max-h-60">
          <div className="space-y-2">
            {deployments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-20 text-center">
                <Server className="h-6 w-6 text-muted-foreground mb-2" />
                <div className="text-xs text-muted-foreground">
                  No deployments yet
                </div>
              </div>
            ) : (
              deployments.map((deployment) => (
                <DeploymentItem
                  key={deployment.metadata?.uid || deployment.metadata?.name}
                  deployment={deployment}
                />
              ))
            )}
            {/* Add new deployment placeholder */}
            <div
              className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 hover:border-muted-foreground/50 hover:bg-muted/20 transition-colors cursor-pointer"
              onClick={() => console.log("Create new deployment")}
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Add new deployment
                </span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </BaseSystemMessage>
  );
};

export default DevboxDeployedMessage;
