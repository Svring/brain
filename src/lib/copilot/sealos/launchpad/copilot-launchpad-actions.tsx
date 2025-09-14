"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { jsonSchemaToActionParameters } from "@copilotkit/shared";
import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";
import {
  launchpadCreateFormSchema,
  LaunchpadCreateFormData,
} from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { launchpadUpdateFormSchema } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { LaunchpadCreateActionMessage } from "@/components/copilot/sealos/launchpad/launchpad-create-action-message";
import { LaunchpadUpdateActionMessage } from "@/components/copilot/sealos/launchpad/launchpad-update-action-message";
import { LaunchpadLifecycleActionMessage } from "@/components/copilot/sealos/launchpad/launchpad-lifecycle-action-message";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useQueryClient } from "@tanstack/react-query";
import { CircleCheckBigIcon } from "lucide-react";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export function activateLaunchpadActions() {
  // CRUD operations
  // createLaunchpadAction();
  updateLaunchpadAction();

  // Lifecycle management (includes delete)
  launchpadLifecycleAction();

  // Data retrieval
  getLaunchpadDataAction();
}

function createLaunchpadAction() {
  const { stage } = useLanggraphState();
  useCopilotAction({
    name: "createLaunchpad",
    description: "Create a new launchpad with specified configuration",
    available: stage === "manage_resource" ? "enabled" : "disabled",
    // followUp: false,
    parameters: jsonSchemaToActionParameters(
      zodToJsonSchema(launchpadCreateFormSchema) as any
    ),
    renderAndWaitForResponse: (props) => {
      return (
        <LaunchpadCreateActionMessage
          args={props.args as Partial<LaunchpadCreateFormData>}
          respond={props.respond}
          status={props.status}
        />
      );
    },
  });
}

function updateLaunchpadAction() {
  const { stage } = useLanggraphState();
  const { selectedResource } = useProjectState();

  // Check if the selected resource is a launchpad (deployment or statefulset)
  const isLaunchpadResource =
    selectedResource?.resourceType === "deployment" ||
    selectedResource?.resourceType === "statefulset";
  const isAvailable = stage === "manage_resource" && isLaunchpadResource;

  useCopilotAction({
    name: "updateLaunchpad",
    description: "Update a launchpad configuration (resource, ports, etc.)",
    // followUp: false,
    available: isAvailable ? "enabled" : "disabled",
    parameters: jsonSchemaToActionParameters(
      zodToJsonSchema(
        z.object({
          launchpadName: z.string().min(1, "Launchpad name is required"),
          resource: launchpadUpdateFormSchema.shape.resource,
        })
      ) as any
    ),
    renderAndWaitForResponse: (props) => {
      return (
        <LaunchpadUpdateActionMessage
          args={props.args as any}
          respond={props.respond || (() => {})}
          status={props.status}
        />
      );
    },
  });
}

export const launchpadLifecycleAction = () => {
  const { stage } = useLanggraphState();
  const { selectedResource } = useProjectState();

  // Check if the selected resource is a launchpad (deployment or statefulset)
  const isLaunchpadResource =
    selectedResource?.resourceType === "deployment" ||
    selectedResource?.resourceType === "statefulset";
  const isAvailable = stage === "manage_resource" && isLaunchpadResource;

  useCopilotAction({
    name: "launchpadLifecycle",
    description: "Manage launchpad lifecycle (start, pause, delete)",
    available: isAvailable ? "enabled" : "disabled",
    parameters: [
      {
        name: "launchpadName",
        type: "string",
        required: true,
        description: "Name of the launchpad",
      },
      {
        name: "action",
        type: "string",
        required: true,
        description: "Lifecycle action to perform",
        enum: ["start", "pause", "delete"],
      },
    ],
    renderAndWaitForResponse: (props) => {
      return (
        <LaunchpadLifecycleActionMessage
          args={props.args as { launchpadName: string }}
          respond={props.respond}
          status={props.status}
          action={props.args.action as "start" | "pause" | "delete"}
        />
      );
    },
  });
};

export const getLaunchpadDataAction = () => {
  const { stage } = useLanggraphState();
  const { selectedResource } = useProjectState();
  const { launchpad } = useTRPCClients();
  const queryClient = useQueryClient();

  // Check if the selected resource is a launchpad (deployment or statefulset)
  const isLaunchpadResource =
    selectedResource?.resourceType === "deployment" ||
    selectedResource?.resourceType === "statefulset";
  const isAvailable = stage === "manage_resource" && isLaunchpadResource;

  useCopilotAction({
    name: "getLaunchpadData",
    available: isAvailable ? "enabled" : "disabled",
    description:
      "Get detailed information about the currently selected launchpad",
    handler: async () => {
      if (
        !selectedResource ||
        (selectedResource.resourceType !== "deployment" &&
          selectedResource.resourceType !== "statefulset")
      ) {
        throw new Error(
          "No launchpad resource selected. Please select a launchpad first."
        );
      }

      const result = await queryClient.fetchQuery(
        launchpad.get.queryOptions(selectedResource as any)
      );

      return {
        resourceName: selectedResource.name,
        data: result,
      };
    },
    render: ({ result, status }) => {
      if (status === "complete" && result) {
        return (
          <div className="w-full">
            <div className="flex items-center justify-between p-2 border rounded-lg">
              <div className="flex items-center gap-2">
                <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
                <p className="text-sm">
                  Successfully retrieved launchpad data for "
                  {result.resourceName}"
                </p>
              </div>
            </div>
          </div>
        );
      }
      return <div />;
    },
  });
};
