import React, { useState } from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { APP_DEVBOX_ID } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-label";
import BaseSystemMessage from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import {
  Play,
  Trash2,
  Plus,
  Server,
  Check,
  ArrowBigUpDash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { DevboxObjectSchema } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { flattenListAllResourcesResponse } from "@/lib/k8s/k8s-method/k8s-utils";
import { useProjectState } from "@/contexts/project/project-context";

interface DevboxDeployedMessageProps {
  target: CustomResourceTarget;
  payload: { tag: string };
}

const DeploymentItem: React.FC<{
  deployment: any;
  onDelete: (deploymentName: string) => void;
  isDeleting?: boolean;
  onClick?: (deploymentName: string) => void;
  onUpdate?: (deploymentName: string) => void;
  isUpdating?: boolean;
}> = ({ deployment, onDelete, isDeleting = false, onClick, onUpdate, isUpdating = false }) => {
  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdate) {
      onUpdate(deployment.metadata?.name);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(deployment.metadata?.name);
  };

  const handleClick = () => {
    if (onClick) {
      onClick(deployment.metadata?.name);
    }
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
    <div
      className="border rounded-lg p-2 hover:brightness-150 transition-colors cursor-pointer"
      onClick={handleClick}
    >
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
        </div>
        <div className="flex items-center gap-1">
          {/* Update button */}
          <Button
            size="sm"
            variant="ghost"
            className="p-0 border border-border-primary bg-background-tertiary hover:brightness-150"
            onClick={handleUpdate}
            disabled={isUpdating}
            title="Update"
          >
            {isUpdating ? (
              <Spinner className="h-3 w-3" />
            ) : (
              <ArrowBigUpDash className="h-3 w-3" />
            )}
            Update
          </Button>
          {/* Delete button */}
          <Button
            variant="destructive"
            className="p-0 h-8 w-8 hover:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete"
          >
            {isDeleting ? (
              <Spinner className="h-3 w-3" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const DevboxDeployedMessage: React.FC<DevboxDeployedMessageProps> = ({
  target,
  payload,
}) => {
  const { k8s, devbox, launchpad, project } = useTRPCClients();
  const queryClient = useQueryClient();
  const appendSystemMessageMutation = useAppendSystemMessageMutation();
  const { selectedProject } = useProjectState();
  const { resource } = useResourceStatus(target);
  const devboxObject = DevboxObjectSchema.parse(resource);
  const [deletingDeploymentId, setDeletingDeploymentId] = useState<
    string | null
  >(null);

  const {
    data: allResources,
    isLoading,
    error,
  } = useQuery({
    ...k8s.list.queryOptions({
      labelSelector: `${APP_DEVBOX_ID}=${devboxObject.name || ""}`,
      builtinResourceTypes: ["deployment", "statefulset"],
      customResourceTypes: [],
    }),
    enabled: !!devboxObject,
  });

  const addToProjectMutation = useMutation({
    ...project.addResources.mutationOptions(),
  });

  const deployMutation = useMutation({
    ...devbox.deploy.mutationOptions(),
    onSuccess: (response) => {
      console.log("[DevboxDeployedMessage] deployDevbox onSuccess", response);

      // Invalidate and refetch deployments
      queryClient.invalidateQueries({
        queryKey: k8s.list.pathKey(),
      });

      // Extract appName from response and append launchpad.detail system message
      if (response?.data?.appName) {
        const deploymentTarget = convertResourceTypeToTarget(
          "deployment",
          response.data.appName
        );
        console.log(
          "[DevboxDeployedMessage] Appending system message for deploymentTarget:",
          deploymentTarget
        );
        appendSystemMessageMutation.mutate({
          type: "launchpad.detail",
          target: deploymentTarget,
        });

        // Add the deployment to the project
        console.log("[DevboxDeployedMessage] Adding deployment to project:", {
          resources: [deploymentTarget],
          name: target.name || "",
        });
        addToProjectMutation.mutate({
          resources: [deploymentTarget],
          name: selectedProject || "",
        });
      } else {
        console.warn(
          "[DevboxDeployedMessage] No appName found in deployDevbox response",
          response
        );
      }
    },
    onError: (error) => {
      console.error("Failed to deploy devbox:", error);
    },
  });

  const deleteDeploymentMutation = useMutation({
    ...launchpad.delete.mutationOptions(),
    onSuccess: () => {
      // Invalidate and refetch deployments
      queryClient.invalidateQueries({
        queryKey: k8s.list.pathKey(),
      });
      setDeletingDeploymentId(null);
    },
    onError: (error) => {
      console.error("Failed to delete deployment:", error);
      setDeletingDeploymentId(null);
    },
  });

  // Show loading state
  if (isLoading) {
    return (
      <BaseSystemMessage
        headerTitle={{ icon: Server, name: "Devbox Resources" }}
      >
        <div className="flex items-center justify-center h-20">
          <div className="text-xs text-muted-foreground">
            Loading resources...
          </div>
        </div>
      </BaseSystemMessage>
    );
  }

  // Show error state
  if (error || !allResources) {
    return (
      <BaseSystemMessage
        headerTitle={{ icon: Server, name: "Devbox Resources" }}
      >
        <div className="flex items-center justify-center h-20">
          <span className="text-destructive text-xs">
            Failed to load devbox resources
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  const flattenedResources = flattenListAllResourcesResponse(allResources);
  const deployments = flattenedResources.filter(
    (resource) =>
      resource.kind === "Deployment" || resource.kind === "StatefulSet"
  );

  return (
    <BaseSystemMessage headerTitle={{ icon: Server, name: "Devbox Resources" }}>
      <div className="space-y-3">
        {(deployments.length > 0 || payload?.tag) && (
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              {payload?.tag
                ? `Deploy ${payload.tag} to...`
                : `Resources: ${deployments.length}`}
            </h3>
          </div>
        )}

        {deployments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-20 text-center">
            <Server className="h-6 w-6 text-muted-foreground mb-2" />
            <div className="text-xs text-muted-foreground">
              No deployments yet
            </div>
          </div>
        ) : (
          <div
            className={`space-y-2 ${
              deployments.length > 3 ? "max-h-48 overflow-y-auto" : ""
            }`}
          >
            {deployments.map((deployment) => (
              <DeploymentItem
                key={deployment.metadata?.uid || deployment.metadata?.name}
                deployment={deployment}
                onDelete={(deploymentName) => {
                  setDeletingDeploymentId(
                    deployment.metadata?.uid || deployment.metadata?.name
                  );
                  deleteDeploymentMutation.mutate({
                    name: deploymentName,
                  });
                }}
                isDeleting={
                  deletingDeploymentId ===
                  (deployment.metadata?.uid || deployment.metadata?.name)
                }
                onClick={(deploymentName) => {
                  // Find the deployment object to get its kind
                  const deploymentObj = deployments.find(
                    (d) => d.metadata?.name === deploymentName
                  );
                  const resourceKind =
                    deploymentObj?.kind?.toLowerCase() || "deployment";
                  const deploymentTarget = convertResourceTypeToTarget(
                    resourceKind,
                    deploymentName
                  );
                  appendSystemMessageMutation.mutate({
                    type: "launchpad.detail",
                    target: deploymentTarget,
                  });
                }}
              />
            ))}
          </div>
        )}

        {/* Add new deployment section - fixed at bottom */}
        <div
          className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 hover:border-muted-foreground/50 hover:bg-muted/20 transition-colors cursor-pointer"
          onClick={() => {
            if (payload?.tag) {
              deployMutation.mutate({
                devboxName: target.name || "",
                tag: payload.tag,
              });
            }
          }}
        >
          <div className="flex items-center justify-center gap-2">
            {deployMutation.isPending ? (
              <Spinner className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Plus className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">
              {deployMutation.isPending ? "Deploying..." : "Add new deployment"}
            </span>
          </div>
        </div>
      </div>
    </BaseSystemMessage>
  );
};

export default DevboxDeployedMessage;
