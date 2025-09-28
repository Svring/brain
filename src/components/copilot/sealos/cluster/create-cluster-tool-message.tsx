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

  useMount(() => {
    // Add resources to project if creation was approved and result contains resource info
    if (isApproved && isSuccess && result.name) {
      try {
        const resourceName = result.name;

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
  const iconUrl = getClusterIconUrl(result.type);

  // Determine status display
  const getStatusDisplay = () => {
    if (!isApproved) {
      return {
        icon: <CircleSlash className="h-4 w-4 text-theme-yellow" />,
        text: "Rejected",
      };
    }

    if (!isSuccess) {
      return {
        icon: <Ban className="h-4 w-4 text-theme-red" />,
        text: "Failed",
      };
    }

    return {
      icon: <CircleCheckBigIcon className="h-4 w-4 text-theme-green" />,
      text: "Created",
    };
  };

  const { icon, text } = getStatusDisplay();

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background-secondary">
        <div className="flex items-center gap-2">
          <img
            src={iconUrl}
            alt={`${result.type} Icon`}
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
                {result.name && result.name.length > 15
                  ? `${result.name.slice(0, 15)}...`
                  : result.name}
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
              {result.type &&
                result.type.charAt(0).toUpperCase() + result.type.slice(1)}
            </span>
          </span>
          {result.cpu !== undefined && (
            <span className="text-sm text-muted-foreground">
              CPU:{" "}
              <span className="font-mono text-foreground">
                {result.cpu}Core
              </span>
            </span>
          )}
          {result.memory !== undefined && (
            <span className="text-sm text-muted-foreground">
              Memory:{" "}
              <span className="font-mono text-foreground">
                {result.memory}GB
              </span>
            </span>
          )}
        </div>
        {(result.storage !== undefined || result.replicas !== undefined) && (
          <div className="flex items-center gap-4">
            {result.storage !== undefined && (
              <span className="text-sm text-muted-foreground">
                Storage:{" "}
                <span className="font-mono text-foreground">
                  {result.storage}GB
                </span>
              </span>
            )}
            {result.replicas !== undefined && (
              <span className="text-sm text-muted-foreground">
                Replicas:{" "}
                <span className="font-mono text-foreground">
                  {result.replicas}
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
