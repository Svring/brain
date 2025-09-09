"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { jsonSchemaToActionParameters } from "@copilotkit/shared";
import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";
import { launchpadCreateFormSchema } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { launchpadUpdateFormSchema } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { LaunchpadCreateActionMessage } from "@/components/copilot/sealos/launchpad/launchpad-create-action-message";
import { LaunchpadUpdateActionMessage } from "@/components/copilot/sealos/launchpad/launchpad-update-action-message";
import { LaunchpadCreateFormData } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import {
  AITool,
  AIToolContent,
  AIToolHeader,
  AIToolParameters,
  AIToolResult,
} from "@/components/shadcn-io/ai/tool";
import { AIResponse } from "@/components/shadcn-io/ai/response";

export function activateLaunchpadActions() {
  // CRUD operations
  createLaunchpadAction();
  updateLaunchpadAction();
  // deleteLaunchpadAction();

  // Lifecycle management
  // startLaunchpadAction();
  // pauseLaunchpadAction();
  // checkReadyLaunchpadAction();
}

function createLaunchpadAction() {
  useCopilotAction({
    name: "createLaunchpad",
    description: "Create a new launchpad with specified configuration",
    followUp: false,
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
    followUp: false,
    parameters: jsonSchemaToActionParameters(
      zodToJsonSchema(launchpadUpdateFormSchema.extend({
        launchpadName: z.string().min(1, "Launchpad name is required"),
      })) as any
    ),
    renderAndWaitForResponse: (props) => {
      return (
        <LaunchpadUpdateActionMessage
          args={props.args as Partial<LaunchpadUpdateFormData> & { launchpadName: string }}
          respond={props.respond}
          status={props.status}
        />
      );
    },
  });
}

export const deleteLaunchpadAction = () => {
  const { launchpad } = useTRPCClients();
  const deleteLaunchpadMutation = useMutation({
    ...launchpad.delete.mutationOptions(),
  });

  useCopilotAction({
    name: "deleteLaunchpad",
    description: "Delete a launchpad",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Name of the launchpad to delete",
        required: true,
      },
    ],
    handler: async ({ name }) => {
      const result = await deleteLaunchpadMutation.mutateAsync({ name });
      return `Launchpad '${name}' deleted successfully.`;
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"deleteLaunchpad"}>
          <AIToolHeader
            description={"Delete a launchpad"}
            name={"deleteLaunchpad"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult result={<AIResponse>{result}</AIResponse>} />
            )}
          </AIToolContent>
        </AITool>
      );
    },
  });
};
