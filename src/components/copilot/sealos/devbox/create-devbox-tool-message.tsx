"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";
import { CircleCheckBigIcon, CircleSlash, Ban } from "lucide-react";
import { useMount } from "@reactuses/core";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useProjectAddResource } from "@/hooks/brain/use-project-add-resource";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useProjectState } from "@/contexts/project/project-context";
import {
  DEVBOX_RUNTIME_ICONS,
  DEVBOX_DEFAULT_ICON,
} from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-icons";

interface CreateDevboxToolMessageProps {
  result: any;
}

export const CreateDevboxToolMessage: React.FC<
  CreateDevboxToolMessageProps
> = ({ result }) => {
  const isApproved = result.approved !== false;
  const isSuccess = result.success !== false;
  const { addResourcesToProject } = useProjectAddResource({
    disableToast: true,
  });
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
            resource.kind === "devbox" && resource.name === resourceName
        );

        if (!resourceExists) {
          const target = convertResourceTypeToTarget("devbox", resourceName);
          addResourcesToProject(selectedProject!, [target]);
        } else {
          console.log(
            "Devbox resource already exists in project, skipping add to project"
          );
        }
      } catch (error) {
        console.warn("Failed to add devbox resource to project:", error);
      }
    }
  });

  // Get icon URL directly from runtime mapping
  const iconUrl =
    DEVBOX_RUNTIME_ICONS[
      payload.runtime as keyof typeof DEVBOX_RUNTIME_ICONS
    ] || DEVBOX_DEFAULT_ICON;

  // Determine status display
  const getStatusDisplay = () => {
    if (!isApproved) {
      return {
        icon: <CircleSlash className="h-4 w-4 text-theme-yellow" />,
        text: "Devbox creation rejected",
      };
    }

    if (!isSuccess) {
      return {
        icon: <Ban className="h-4 w-4 text-theme-red" />,
        text: "Devbox creation failed",
      };
    }

    return {
      icon: <CircleCheckBigIcon className="h-4 w-4 text-theme-green" />,
      text: "Devbox created successfully",
    };
  };

  const { icon, text } = getStatusDisplay();

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background-secondary">
        <div className="flex items-center gap-2">
          <img
            src={iconUrl}
            alt="Devbox Icon"
            width={32}
            height={32}
            className="rounded-lg h-8 w-8 flex-shrink-0 p-1 bg-muted"
          />
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground leading-none">
                Devbox
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
            Runtime:{" "}
            <span className="font-mono text-foreground">
              {payload.runtime &&
                payload.runtime.charAt(0).toUpperCase() +
                  payload.runtime.slice(1)}
            </span>
          </span>
          {payload.cpu && (
            <span className="text-sm text-muted-foreground">
              CPU:{" "}
              <span className="font-mono text-foreground">
                {payload.cpu}Core
              </span>
            </span>
          )}
          {payload.memory && (
            <span className="text-sm text-muted-foreground">
              Memory:{" "}
              <span className="font-mono text-foreground">
                {payload.memory}GB
              </span>
            </span>
          )}
        </div>
        {payload.ports && payload.ports.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ports:</span>
            <div className="flex items-center gap-1">
              {payload.ports.map((port: any, index: number) => (
                <span key={index} className="font-mono text-sm text-foreground">
                  {port.number || port}
                  {index < payload.ports.length - 1 && ","}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
