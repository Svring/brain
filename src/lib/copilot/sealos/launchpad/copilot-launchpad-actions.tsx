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

export function activateLaunchpadActions() {
  // CRUD operations
  createLaunchpadAction();
  updateLaunchpadAction();

  // Lifecycle management (includes delete)
  launchpadLifecycleAction();
}

function createLaunchpadAction() {
  useCopilotAction({
    name: "createLaunchpad",
    description: "Create a new launchpad with specified configuration",
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
  useCopilotAction({
    name: "updateLaunchpad",
    description: "Update a launchpad configuration (resource, ports, etc.)",
    // followUp: false,
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
  useCopilotAction({
    name: "launchpadLifecycle",
    description: "Manage launchpad lifecycle (start, pause, delete)",
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
