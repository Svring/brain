"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";
import { CircleCheckBigIcon, CircleSlash, Ban } from "lucide-react";
import { useMount } from "@reactuses/core";
import { useProjectAddResource } from "@/hooks/brain/use-project-add-resource";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useProjectState } from "@/contexts/project/project-context";
import { getClusterIconUrl } from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";

interface CreateClusterToolMessageProps {
  result: any;
}

export const CreateClusterToolMessage: React.FC<
  CreateClusterToolMessageProps
> = ({ result }) => {
  const isApproved = result.approved !== false;
  const isSuccess = result.success !== false;
  const { addResourcesToProject } = useProjectAddResource({ disableToast: true });
  const { selectedProject, selectedProjectResources } = useProjectState();

  // Extract payload from result.payload
  const payload = result.payload || {};

  useMount(() => {
    // Add resources to project if creation was approved and result contains resource info
    if (isApproved && isSuccess && payload.name) {
      try {
        const resourceName = payload.name;

        // Check if resource already exists in selectedProjectResources
        const resourceExists = selectedProjectResources?.some(
          (resource) =>
            resource.kind === "cluster" && resource.name === resourceName
        );

        if (!resourceExists) {
          const target = convertResourceTypeToTarget("cluster", resourceName);
          addResourcesToProject(selectedProject!, [target]);
        } else {
          console.log(
            "Cluster resource already exists in project, skipping add to project"
          );
        }
      } catch (error) {
        console.warn("Failed to add cluster resource to project:", error);
      }
    }
  });

  // Get icon URL directly from type
  const iconUrl = getClusterIconUrl(payload.type);

  // Determine status display
  const getStatusDisplay = () => {
    if (!isApproved) {
      return {
        icon: <CircleSlash className="h-4 w-4 text-theme-yellow" />,
        text: "Cluster creation rejected",
      };
    }

    if (!isSuccess) {
      return {
        icon: <Ban className="h-4 w-4 text-theme-red" />,
        text: "Cluster creation failed",
      };
    }

    return {
      icon: <CircleCheckBigIcon className="h-4 w-4 text-theme-green" />,
      text: "Cluster created successfully",
    };
  };

  const { icon, text } = getStatusDisplay();

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background-secondary">
        <div className="flex items-center gap-2">
          <img
            src={iconUrl}
            alt={`${payload.type} Icon`}
            width={32}
            height={32}
            className="rounded-lg h-8 w-8 flex-shrink-0 p-1 bg-muted"
          />
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground leading-none">
                Cluster
              </span>
              <span className="text-lg font-bold text-foreground leading-tight">
                {payload.name && payload.name.length > 15
                  ? `${payload.name.slice(0, 15)}...`
                  : payload.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm text-muted-foreground">{text}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Type:{" "}
            <span className="font-mono text-foreground">
              {payload.type &&
                payload.type.charAt(0).toUpperCase() + payload.type.slice(1)}
            </span>
          </span>
          {payload.cpu !== undefined && (
            <span className="text-sm text-muted-foreground">
              CPU:{" "}
              <span className="font-mono text-foreground">
                {payload.cpu}Core
              </span>
            </span>
          )}
          {payload.memory !== undefined && (
            <span className="text-sm text-muted-foreground">
              Memory:{" "}
              <span className="font-mono text-foreground">
                {payload.memory}GB
              </span>
            </span>
          )}
        </div>
        {(payload.storage !== undefined || payload.replicas !== undefined) && (
          <div className="flex items-center gap-4">
            {payload.storage !== undefined && (
              <span className="text-sm text-muted-foreground">
                Storage:{" "}
                <span className="font-mono text-foreground">
                  {payload.storage}GB
                </span>
              </span>
            )}
            {payload.replicas !== undefined && (
              <span className="text-sm text-muted-foreground">
                Replicas:{" "}
                <span className="font-mono text-foreground">
                  {payload.replicas}
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
