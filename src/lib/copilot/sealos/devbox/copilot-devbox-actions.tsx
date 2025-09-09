import { useCopilotAction } from "@copilotkit/react-core";
import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import {
  AITool,
  AIToolContent,
  AIToolHeader,
  AIToolParameters,
  AIToolResult,
} from "@/components/shadcn-io/ai/tool";
import { AIResponse } from "@/components/shadcn-io/ai/response";
import { devboxCreateFormSchema } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { devboxUpdateFormSchema } from "@/schemas/forms/devbox/devbox-update-form-schema";
import { DevboxUpdateRuntimeSchema } from "@/lib/copilot/sealos/devbox/copilot-devbox-utils";
import { jsonSchemaToActionParameters } from "@copilotkit/shared";
import { zodToJsonSchema } from "zod-to-json-schema";
import { DevboxCreateFormData } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { DevboxCreateActionMessage } from "@/components/copilot/sealos/devbox/devbox-create-action-message";
import { DevboxUpdateActionMessage } from "@/components/copilot/sealos/devbox/devbox-update-action-message";

export const activateDevboxActions = () => {
  // CRUD operations
  createDevboxAction();
  updateDevboxAction();
  // deleteDevboxAction();

  // // Lifecycle management
  // startDevboxAction();
  // pauseDevboxAction();
  // restartDevboxAction();
  // shutdownDevboxAction();

  // // Release management
  // releaseDevboxAction();
  // deployDevboxAction();
};

export const createDevboxAction = () => {
  useCopilotAction({
    name: "createDevbox",
    description: "Create a new devbox with specified configuration",
    followUp: false,
    parameters: jsonSchemaToActionParameters(
      zodToJsonSchema(devboxCreateFormSchema) as any
    ),
    renderAndWaitForResponse: (props) => {
      return (
        <DevboxCreateActionMessage
          args={props.args as Partial<DevboxCreateFormData>}
          respond={props.respond}
          status={props.status}
        />
      );
    },
  });
};

export const updateDevboxAction = () => {
  useCopilotAction({
    name: "updateDevbox",
    description: "Update a devbox configuration (resource, ports, etc.)",
    followUp: false,
    parameters: jsonSchemaToActionParameters(
      zodToJsonSchema(DevboxUpdateRuntimeSchema) as any
    ),
    renderAndWaitForResponse: (props) => {
      return (
        <DevboxUpdateActionMessage
          args={props.args as { devboxName: string; [key: string]: any }}
          respond={props.respond}
          status={props.status}
        />
      );
    },
  });
};

export const deleteDevboxAction = () => {
  const { devbox } = useTRPCClients();
  const deleteDevboxMutation = useMutation({
    ...devbox.delete.mutationOptions(),
  });

  useCopilotAction({
    name: "deleteDevbox",
    description: "Delete a devbox by its name",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        required: true,
        description: "Name of the devbox to delete",
      },
    ],
    handler: async ({ devboxName }) => {
      const result = await deleteDevboxMutation.mutateAsync(devboxName);
      return `Devbox "${devboxName}" deleted successfully`;
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"deleteDevbox"}>
          <AIToolHeader
            description={"Delete a devbox by its name"}
            name={"deleteDevbox"}
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

export const startDevboxAction = () => {
  const { devbox } = useTRPCClients();
  const startDevboxMutation = useMutation({
    ...devbox.start.mutationOptions(),
  });

  useCopilotAction({
    name: "startDevbox",
    description: "Start a devbox",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        required: true,
        description: "Name of the devbox to start",
      },
    ],
    handler: async ({ devboxName }) => {
      const result = await startDevboxMutation.mutateAsync(devboxName);
      return `Devbox "${devboxName}" started successfully`;
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"startDevbox"}>
          <AIToolHeader
            description={"Start a devbox"}
            name={"startDevbox"}
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

export const pauseDevboxAction = () => {
  const { devbox } = useTRPCClients();
  const pauseDevboxMutation = useMutation({
    ...devbox.pause.mutationOptions(),
  });

  useCopilotAction({
    name: "pauseDevbox",
    description: "Pause a devbox",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        required: true,
        description: "Name of the devbox to pause",
      },
    ],
    handler: async ({ devboxName }) => {
      const result = await pauseDevboxMutation.mutateAsync(devboxName);
      return `Devbox "${devboxName}" paused successfully`;
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"pauseDevbox"}>
          <AIToolHeader
            description={"Pause a devbox"}
            name={"pauseDevbox"}
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

export const restartDevboxAction = () => {
  const { devbox } = useTRPCClients();
  const restartDevboxMutation = useMutation({
    ...devbox.restart.mutationOptions(),
  });

  useCopilotAction({
    name: "restartDevbox",
    description: "Restart a devbox",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        required: true,
        description: "Name of the devbox to restart",
      },
    ],
    handler: async ({ devboxName }) => {
      const result = await restartDevboxMutation.mutateAsync(devboxName);
      return `Devbox "${devboxName}" restarted successfully`;
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"restartDevbox"}>
          <AIToolHeader
            description={"Restart a devbox"}
            name={"restartDevbox"}
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

export const shutdownDevboxAction = () => {
  const { devbox } = useTRPCClients();
  const shutdownDevboxMutation = useMutation({
    ...devbox.shutdown.mutationOptions(),
  });

  useCopilotAction({
    name: "shutdownDevbox",
    description: "Shutdown a devbox",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        required: true,
        description: "Name of the devbox to shutdown",
      },
    ],
    handler: async ({ devboxName }) => {
      const result = await shutdownDevboxMutation.mutateAsync(devboxName);
      return `Devbox "${devboxName}" shutdown successfully`;
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"shutdownDevbox"}>
          <AIToolHeader
            description={"Shutdown a devbox"}
            name={"shutdownDevbox"}
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

export const releaseDevboxAction = () => {
  const { devbox } = useTRPCClients();
  const releaseDevboxMutation = useMutation({
    ...devbox.release.mutationOptions(),
  });

  useCopilotAction({
    name: "releaseDevbox",
    description: "Release a devbox with a specific tag",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        required: true,
        description: "Name of the devbox to release",
      },
      {
        name: "tag",
        type: "string",
        required: true,
        description: "Release tag for the devbox",
      },
      {
        name: "releaseDes",
        type: "string",
        required: false,
        description: "Optional description for the release",
      },
    ],
    handler: async ({ devboxName, tag, releaseDes }) => {
      const result = await releaseDevboxMutation.mutateAsync({
        devboxName,
        tag,
        releaseDes: releaseDes || "",
      });
      return `Devbox "${devboxName}" released with tag "${tag}" successfully`;
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"releaseDevbox"}>
          <AIToolHeader
            description={"Release a devbox with a specific tag"}
            name={"releaseDevbox"}
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

export const deployDevboxAction = () => {
  const { devbox } = useTRPCClients();
  const deployDevboxMutation = useMutation({
    ...devbox.deploy.mutationOptions(),
  });

  useCopilotAction({
    name: "deployDevbox",
    description:
      "Deploy a devbox release with fixed resource configuration (2 CPU cores, 2GB memory)",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        required: true,
        description: "Name of the devbox to deploy",
      },
      {
        name: "tag",
        type: "string",
        required: true,
        description: "Devbox release version tag to deploy",
      },
    ],
    handler: async ({ devboxName, tag }) => {
      const result = await deployDevboxMutation.mutateAsync({
        devboxName,
        tag,
      });
      return `Devbox "${devboxName}" deployed with tag "${tag}" successfully`;
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"deployDevbox"}>
          <AIToolHeader
            description={
              "Deploy a devbox release with fixed resource configuration (2 CPU cores, 2GB memory)"
            }
            name={"deployDevbox"}
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
