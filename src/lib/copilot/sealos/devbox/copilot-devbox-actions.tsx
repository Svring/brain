import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { DevboxApiContext } from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listDevboxOptions,
  getDevboxOptions,
  getDevboxReleasesOptions,
} from "@/lib/sealos/resources/devbox/devbox-method/devbox-query";
import {
  useDeleteDevboxMutation,
  useCreateDevboxMutation,
  useManageDevboxLifecycleMutation,
  useReleaseDevboxMutation,
  useDeployDevboxMutation,
} from "@/lib/sealos/resources/devbox/devbox-method/devbox-mutation";
import { useCopilotAction } from "@copilotkit/react-core";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  AITool,
  AIToolContent,
  AIToolHeader,
  AIToolParameters,
  AIToolResult,
} from "@/components/shadcn-io/ai/tool";
import { AIResponse } from "@/components/shadcn-io/ai/response";

export const activateDevboxActions = (
  k8sContext: K8sApiContext,
  devboxContext: DevboxApiContext
) => {
  listDevboxAction(k8sContext);
  getDevboxAction(k8sContext);
  createDevboxAction(devboxContext);
  deleteDevboxAction(devboxContext);
  startDevboxAction(devboxContext);
  stopDevboxAction(devboxContext);
  restartDevboxAction(devboxContext);
  releaseDevboxAction(devboxContext);
  deployDevboxAction(devboxContext);
  listDevboxReleasesAction(devboxContext);
};

export const createDevboxAction = (context: DevboxApiContext) => {};

export const listDevboxAction = (context: K8sApiContext) => {
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "listDevboxes",
    description: "List all devboxes",
    handler: () => {
      return queryClient.fetchQuery(listDevboxOptions(context));
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"listDevboxes"}>
          <AIToolHeader
            description={"List all devboxes"}
            name={"listDevboxes"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult
                // error={error}
                result={<AIResponse>{result}</AIResponse>}
              />
            )}
          </AIToolContent>
        </AITool>
      );
    },
  });
};

export const getDevboxAction = (context: K8sApiContext) => {
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "getDevbox",
    description: "Get a specific devbox by name",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        required: true,
        description: "Name of the devbox",
      },
    ],
    handler: ({ devboxName }) => {
      const target = CustomResourceTargetSchema.parse({
        ...convertResourceTypeToTarget("devbox"),
        name: devboxName,
      });
      return queryClient.fetchQuery(getDevboxOptions(context, target));
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"getDevbox"}>
          <AIToolHeader
            description={"Get a specific devbox by name"}
            name={"getDevbox"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult
                result={<AIResponse>{result}</AIResponse>}
              />
            )}
          </AIToolContent>
        </AITool>
      );
    },
  });
};

export const deleteDevboxAction = (context: DevboxApiContext) => {
  const deleteDevbox = useDeleteDevboxMutation(context);

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
    handler: ({ devboxName }) => {
      deleteDevbox.mutateAsync(devboxName);
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
              <AIToolResult
                result={<AIResponse>{result}</AIResponse>}
              />
            )}
          </AIToolContent>
        </AITool>
      );
    },
  });
};

export const startDevboxAction = (context: DevboxApiContext) => {
  const manageDevboxLifecycle = useManageDevboxLifecycleMutation(context);

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
    handler: ({ devboxName }) => {
      manageDevboxLifecycle.mutateAsync({ devboxName, action: "start" });
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
              <AIToolResult
                result={<AIResponse>{result}</AIResponse>}
              />
            )}
          </AIToolContent>
        </AITool>
      );
    },
  });
};

export const stopDevboxAction = (context: DevboxApiContext) => {
  const manageDevboxLifecycle = useManageDevboxLifecycleMutation(context);

  useCopilotAction({
    name: "stopDevbox",
    description: "Stop a devbox",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        required: true,
        description: "Name of the devbox to stop",
      },
    ],
    handler: ({ devboxName }) => {
      manageDevboxLifecycle.mutateAsync({ devboxName, action: "stop" });
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"stopDevbox"}>
          <AIToolHeader
            description={"Stop a devbox"}
            name={"stopDevbox"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult
                result={<AIResponse>{result}</AIResponse>}
              />
            )}
          </AIToolContent>
        </AITool>
      );
    },
  });
};

export const restartDevboxAction = (context: DevboxApiContext) => {
  const manageDevboxLifecycle = useManageDevboxLifecycleMutation(context);

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
    handler: ({ devboxName }) => {
      manageDevboxLifecycle.mutateAsync({ devboxName, action: "restart" });
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
              <AIToolResult
                result={<AIResponse>{result}</AIResponse>}
              />
            )}
          </AIToolContent>
        </AITool>
      );
    },
  });
};

export const deployDevboxAction = (context: DevboxApiContext) => {
  const deployDevbox = useDeployDevboxMutation(context);

  useCopilotAction({
    name: "deployDevbox",
    description: "Deploy a devbox release with specified configuration",
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
      {
        name: "cpu",
        type: "number",
        required: false,
        description: "CPU allocation in millicores (default: 2000)",
      },
      {
        name: "memory",
        type: "number",
        required: false,
        description: "Memory allocation in MB (default: 4096)",
      },
    ],
    handler: ({ devboxName, tag, cpu, memory }) => {
      const deployRequest = {
        devboxName,
        tag,
        cpu: cpu ?? 2000,
        memory: memory ?? 4096,
      };
      deployDevbox.mutateAsync(deployRequest);
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"deployDevbox"}>
          <AIToolHeader
            description={"Deploy a devbox release with specified configuration"}
            name={"deployDevbox"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult
                result={<AIResponse>{result}</AIResponse>}
              />
            )}
          </AIToolContent>
        </AITool>
      );
    },
  });
};

export const updateDevboxAction = async () => {};

export const getDevboxMonitorAction = async () => {};

export const releaseDevboxAction = (context: DevboxApiContext) => {
  const releaseDevbox = useReleaseDevboxMutation(context);

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
    handler: ({ devboxName, tag, releaseDes }) => {
      releaseDevbox.mutateAsync({
        devboxName,
        tag,
        releaseDes: releaseDes || "",
      });
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
              <AIToolResult
                result={<AIResponse>{result}</AIResponse>}
              />
            )}
          </AIToolContent>
        </AITool>
      );
    },
  });
};

export const listDevboxReleasesAction = (context: DevboxApiContext) => {
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "listDevboxReleases",
    description: "List all releases for a specific devbox",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        required: true,
        description: "Name of the devbox to get releases for",
      },
    ],
    handler: ({ devboxName }) => {
      return queryClient.fetchQuery(
        getDevboxReleasesOptions(context, devboxName)
      );
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"listDevboxReleases"}>
          <AIToolHeader
            description={"List all releases for a specific devbox"}
            name={"listDevboxReleases"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult
                result={<AIResponse>{result}</AIResponse>}
              />
            )}
          </AIToolContent>
        </AITool>
      );
    },
  });
};

export const openDevboxTerminalAction = async () => {};
