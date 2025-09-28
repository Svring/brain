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

interface CreateLaunchpadToolMessageProps {
  result: any;
}

export const CreateLaunchpadToolMessage: React.FC<
  CreateLaunchpadToolMessageProps
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
          (resource) => resource.kind === "deployment" && resource.name === resourceName
        );
        
        if (!resourceExists) {
          const target = convertResourceTypeToTarget("deployment", resourceName);
          addResourcesToProject(selectedProject!, [target]);
        } else {
          console.log("Launchpad resource already exists in project, skipping add to project");
        }
      } catch (error) {
        console.warn("Failed to add launchpad resource to project:", error);
      }
    }
  });

  const iconUrl = "https://applaunchpad.bja.sealos.run/logo.svg";

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
            alt="Launchpad Icon"
            width={32}
            height={32}
            className="rounded-lg h-8 w-8 flex-shrink-0 p-1 bg-muted"
          />
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground leading-none">
                Launchpad
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
            Image:{" "}
            <span className="font-mono text-foreground">
              {result.image && result.image.length > 20
                ? `${result.image.slice(0, 20)}...`
                : result.image}
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
        {(result.replicas !== undefined || (result.ports && result.ports.length > 0)) && (
          <div className="flex items-center gap-4">
            {result.replicas !== undefined && (
              <span className="text-sm text-muted-foreground">
                Replicas:{" "}
                <span className="font-mono text-foreground">
                  {result.replicas}
                </span>
              </span>
            )}
            {result.ports && result.ports.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ports:</span>
                <div className="flex items-center gap-1">
                  {result.ports.map((port: number, index: number) => (
                    <span key={index} className="font-mono text-sm text-foreground">
                      {port}
                      {index < result.ports.length - 1 && ","}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {result.env && result.env.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Environment:{" "}
              <span className="font-mono text-foreground">
                {result.env.length} variables
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
