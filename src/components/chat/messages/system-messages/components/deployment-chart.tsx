import React, { useState } from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { APP_DEVBOX_ID } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-label";
import { useLaunchpadLifecycle } from "@/hooks/sealos/launchpad/use-launchpad-lifecycle";
import { Trash2, Plus, Server, ArrowBigUpDash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { DevboxObjectSchema } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { flattenListAllResourcesResponse } from "@/lib/k8s/k8s-method/k8s-utils";
import { useDevboxDeploy } from "@/hooks/sealos/devbox/use-devbox-deploy";
import { useDevboxRelease } from "@/hooks/sealos/devbox/use-devbox-release";

interface DeploymentChartProps {
  target: CustomResourceTarget;
  payload?: { tag: string };
  onClose?: () => void;
}

const DeploymentItem: React.FC<{
  deployment: any;
  onDelete: (deploymentName: string) => void;
  isDeleting?: boolean;
  onClick?: (deploymentName: string) => void;
  onUpdate?: (deploymentName: string) => void;
  isUpdating?: boolean;
  releaseImage?: string;
}> = ({
  deployment,
  onDelete,
  isDeleting = false,
  onClick,
  onUpdate,
  isUpdating = false,
  releaseImage,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(deployment.metadata?.name);
  };

  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdate) {
      onUpdate(deployment.metadata?.name);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(deployment.metadata?.name);
    }
  };

  // Check if deployment's image matches the release image
  const deploymentImage =
    deployment.spec?.template?.spec?.containers?.[0]?.image;
  const isDeployed = Boolean(releaseImage && deploymentImage === releaseImage);

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

  return (
    <div
      className="border rounded-lg p-2 transition-colors"
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
            className="h-8 px-2 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors shrink-0"
            size="sm"
            variant="outline"
            onClick={handleUpdate}
            disabled={isUpdating || isDeployed}
            title={isDeployed ? "Current release" : "Update"}
          >
            {isUpdating ? (
              <Spinner className="h-3 w-3 mr-1" />
            ) : (
              <ArrowBigUpDash className="h-3 w-3 mr-1" />
            )}
            <span className="text-xs">
              {isDeployed ? "Deployed" : "Update"}
            </span>
            <span className="sr-only">
              {isDeployed ? "Current release" : "Update deployment"}
            </span>
          </Button>
          {/* Delete button */}
          <Button
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors shrink-0"
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete"
          >
            {isDeleting ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="sr-only">Delete deployment</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export const DeploymentChart: React.FC<DeploymentChartProps> = ({
  target,
  payload,
  onClose,
}) => {
  const { k8s } = useTRPCClients();
  const queryClient = useQueryClient();
  const { resource } = useResourceStatus(target);
  const devboxObject = DevboxObjectSchema.parse(resource);
  const [deletingDeploymentId, setDeletingDeploymentId] = useState<
    string | null
  >(null);
  const [updatingDeploymentId, setUpdatingDeploymentId] = useState<
    string | null
  >(null);

  // Use launchpad lifecycle hook for deletion
  const { executeAction, isPending } = useLaunchpadLifecycle({
    onSuccess: () => {
      setDeletingDeploymentId(null);
    },
    onError: () => {
      setDeletingDeploymentId(null);
    },
  });

  // Use the devbox deploy hook
  const { handleDeploy, handleUpdateDeploy, deployDevbox } = useDevboxDeploy(
    devboxObject.name || ""
  );

  // Use the devbox release hook to get release information
  const { releases: releasesData, isLoading: isLoadingReleases } =
    useDevboxRelease(devboxObject.name || "");

  // Enhanced handleDeploy that also appends system message
  const handleDeployWithMessage = async (releaseTag: string) => {
    try {
      await handleDeploy(releaseTag);

      // Invalidate and refetch deployments
      queryClient.invalidateQueries({
        queryKey: k8s.list.pathKey(),
      });

      // Close the dialog after successful deployment
      if (onClose) {
        onClose();
      }

      // Note: The system message will be handled by the hook's success callback
      // which adds the deployment to the project and triggers the message
    } catch (error) {
      console.error("Deploy failed:", error);
    }
  };

  // Handle update deployment
  const handleUpdateDeployment = async (deploymentName: string) => {
    if (!payload?.tag) {
      console.error("No release tag available for update");
      return;
    }

    try {
      setUpdatingDeploymentId(deploymentName);

      // Find the release data for the specified tag
      const releases = Array.isArray(releasesData) ? releasesData : [];
      const release = releases.find((r: any) => r.tag === payload.tag);

      if (release && release.image) {
        // Use the image from the release data to update the deployment
        await handleUpdateDeploy(deploymentName, release.image);
      } else {
        // Fallback to deploying the release if no image found
        await handleDeploy(payload.tag);
      }

      // Invalidate and refetch deployments
      queryClient.invalidateQueries({
        queryKey: k8s.list.pathKey(),
      });

      // Close the dialog after successful update
      if (onClose) {
        onClose();
      }

      setUpdatingDeploymentId(null);
    } catch (error) {
      console.error("Update failed:", error);
      setUpdatingDeploymentId(null);
    }
  };

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

  // Handle delete deployment
  const handleDeleteDeployment = async (deploymentName: string) => {
    try {
      setDeletingDeploymentId(deploymentName);
      await executeAction("delete", deploymentName);
    } catch (error) {
      console.error("Failed to delete deployment:", error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-20">
        <div className="text-xs text-muted-foreground">
          Loading resources...
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !allResources) {
    return (
      <div className="flex items-center justify-center h-20">
        <span className="text-destructive text-xs">
          Failed to load devbox resources
        </span>
      </div>
    );
  }

  const flattenedResources = flattenListAllResourcesResponse(allResources);
  const deployments = flattenedResources.filter(
    (resource) =>
      resource.kind === "Deployment" || resource.kind === "StatefulSet"
  );

  console.log("releasesData", releasesData);

  // Check if the passed tag exists in releases
  const releases = Array.isArray(releasesData) ? releasesData : [];
  const tagExists = payload?.tag
    ? releases.some((release: any) => release.tag === payload.tag)
    : true;
  const isTagLoading = isLoadingReleases && payload?.tag;

  // Get the release image for the specified tag
  const releaseImage = payload?.tag
    ? releases.find((r: any) => r.tag === payload.tag)?.image
    : undefined;

  // Show loading state for tag validation
  if (isTagLoading) {
    return (
      <div className="flex items-center justify-center h-20">
        <div className="text-xs text-muted-foreground">
          Loading release information...
        </div>
      </div>
    );
  }

  // Show empty state if tag doesn't exist
  if (payload?.tag && !tagExists) {
    return (
      <div className="flex flex-col items-center justify-center h-20 text-center">
        <Server className="h-6 w-6 text-muted-foreground mb-2" />
        <div className="text-xs text-muted-foreground">
          Release "{payload.tag}" not found
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          No deployments available for this release
        </div>
      </div>
    );
  }

  console.log("deployments", deployments);

  return (
    <div className="space-y-3">
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
              onDelete={handleDeleteDeployment}
              isDeleting={
                deletingDeploymentId === deployment.metadata?.name ||
                isPending("delete")
              }
              onUpdate={handleUpdateDeployment}
              isUpdating={updatingDeploymentId === deployment.metadata?.name}
              releaseImage={releaseImage}
              // onClick={(deploymentName) => {
              //   // Find the deployment object to get its kind
              //   const deploymentObj = deployments.find(
              //     (d) => d.metadata?.name === deploymentName
              //   );
              //   const resourceKind =
              //     deploymentObj?.kind?.toLowerCase() || "deployment";
              //   const deploymentTarget = convertResourceTypeToTarget(
              //     resourceKind,
              //     deploymentName
              //   );
              //   appendSystemMessageMutation.mutate({
              //     type: "launchpad.detail",
              //     target: deploymentTarget,
              //   });
              // }}
            />
          ))}
        </div>
      )}

      {/* Add new deployment section - fixed at bottom */}
      <div
        className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 hover:border-muted-foreground/50 hover:bg-muted/20 transition-colors cursor-pointer"
        onClick={() => {
          if (payload?.tag) {
            handleDeployWithMessage(payload.tag);
          }
        }}
      >
        <div className="flex items-center justify-center gap-2">
          {deployDevbox.isPending ? (
            <Spinner className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Plus className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground">
            {deployDevbox.isPending ? "Deploying..." : "Add new deployment"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeploymentChart;
