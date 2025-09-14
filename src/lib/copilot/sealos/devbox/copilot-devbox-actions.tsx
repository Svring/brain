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
import { DevboxLifecycleActionMessage } from "@/components/copilot/sealos/devbox/devbox-lifecycle-action-message";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useQueryClient } from "@tanstack/react-query";
import { CircleCheckBigIcon } from "lucide-react";

export const activateDevboxActions = () => {
  // CRUD operations
  // createDevboxAction();
  updateDevboxAction();

  // Lifecycle management
  devboxLifecycleAction();

  // Data retrieval
  getDevboxDataAction();

  // // Release management
  // releaseDevboxAction();
  // deployDevboxAction();
};

export const createDevboxAction = () => {
  const { stage } = useLanggraphState();
  useCopilotAction({
    name: "createDevbox",
    description: "Create a new devbox with specified configuration",
    available: stage === "manage_resource" ? "enabled" : "disabled",
    // followUp: false,
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
  const { stage } = useLanggraphState();
  useCopilotAction({
    name: "updateDevbox",
    description: "Update a devbox configuration (resource, ports, etc.)",
    available: stage === "manage_resource" ? "enabled" : "disabled",
    // followUp: false,
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

export const devboxLifecycleAction = () => {
  const { stage } = useLanggraphState();
  useCopilotAction({
    name: "devboxLifecycle",
    description:
      "Manage devbox lifecycle (start, pause, restart, shutdown, delete)",
    available: stage === "manage_resource" ? "enabled" : "disabled",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        required: true,
        description: "Name of the devbox",
      },
      {
        name: "action",
        type: "string",
        required: true,
        description: "Lifecycle action to perform",
        enum: ["start", "pause", "restart", "shutdown", "delete"],
      },
    ],
    renderAndWaitForResponse: (props) => {
      return (
        <DevboxLifecycleActionMessage
          args={props.args as { devboxName: string }}
          respond={props.respond}
          status={props.status}
          action={
            props.args.action as
              | "start"
              | "pause"
              | "restart"
              | "shutdown"
              | "delete"
          }
        />
      );
    },
  });
};

export const getDevboxDataAction = () => {
  const { stage } = useLanggraphState();
  const { selectedResource } = useProjectState();
  const { devbox } = useTRPCClients();
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "getDevboxData",
    available: stage === "manage_resource" ? "enabled" : "disabled",
    description: "Get detailed information about the currently selected devbox",
    handler: async () => {
      if (!selectedResource || selectedResource.resourceType !== "devbox") {
        throw new Error("No devbox resource selected. Please select a devbox first.");
      }

      const result = await queryClient.fetchQuery(
        devbox.get.queryOptions(selectedResource as any)
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
                  Successfully retrieved devbox data for "{result.resourceName}"
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
