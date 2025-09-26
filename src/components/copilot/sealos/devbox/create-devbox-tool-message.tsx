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

interface CreateDevboxToolMessageProps {
  result: any;
}

export const CreateDevboxToolMessage: React.FC<
  CreateDevboxToolMessageProps
> = ({ result }) => {
  const isApproved = result.approved !== false;
  const { addResourcesToProject } = useProjectAddResource();
  const { selectedProject, selectedProjectResources } = useProjectState();

  // console.log("selectedProjectResources", selectedProjectResources);

  useMount(() => {
    // Add resources to project if creation was approved and result contains resource info
    if (isApproved && result.name) {
      try {
        const resourceName = result.name;

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
    } else {
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
              ? "Devbox created successfully"
              : "Devbox creation rejected"}
          </p>
        </div>
      </div>
    </div>
  );
};
