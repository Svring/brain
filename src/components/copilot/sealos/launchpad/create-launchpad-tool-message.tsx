"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";
import { CircleCheckBigIcon, CircleSlash } from "lucide-react";
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
  const { addResourcesToProject } = useProjectAddResource();
  const { selectedProject, selectedProjectResources } = useProjectState();

  useMount(() => {
    // Add resources to project if creation was approved and result contains resource info
    if (isApproved && result.name) {
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

  return (
    <div className="w-full">
      <div className="flex items-center justify-center p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          {isApproved ? (
            <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          ) : (
            <CircleSlash className="h-4 w-4 text-theme-yellow" />
          )}
          <p className="text-sm">
            {isApproved
              ? "Launchpad created successfully"
              : "Launchpad creation rejected"}
          </p>
        </div>
      </div>
    </div>
  );
};
