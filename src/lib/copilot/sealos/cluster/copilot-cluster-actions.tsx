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
import {
  generateClusterCpuOptions,
  generateClusterMemoryOptions,
  generateClusterStorageOptions,
} from "@/lib/sealos/resources/cluster/cluster-utils";
import { jsonSchemaToActionParameters } from "@copilotkit/shared";
import { zodToJsonSchema } from "zod-to-json-schema";
import { clusterCreateFormSchema } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { ClusterCreateActionMessage } from "@/components/copilot/sealos/cluster/cluster-create-action-message";
import { ClusterCreateFormData } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { ClusterUpdateRuntimeSchema } from "@/lib/copilot/sealos/cluster/copilot-cluster-utils";
import { ClusterUpdateActionMessage } from "@/components/copilot/sealos/cluster/cluster-update-action-message";
import { ClusterLifecycleActionMessage } from "@/components/copilot/sealos/cluster/cluster-lifecycle-action-message";

export const activateClusterActions = () => {
  // CRUD operations
  createClusterAction();
  updateClusterAction();
  // deleteClusterAction();

  // Lifecycle management
  clusterLifecycleAction();
};

export const createClusterAction = () => {
  useCopilotAction({
    name: "createCluster",
    description: "Create a new database cluster with specified configuration",
    // followUp: false,
    parameters: jsonSchemaToActionParameters(
      zodToJsonSchema(clusterCreateFormSchema) as any
    ),
    renderAndWaitForResponse: (props) => {
      return (
        <ClusterCreateActionMessage
          args={props.args as Partial<ClusterCreateFormData>}
          respond={props.respond}
          status={props.status}
        />
      );
    },
  });
};

export const updateClusterAction = () => {
  useCopilotAction({
    name: "updateCluster",
    description: "Update a cluster configuration (resource, etc.)",
    // followUp: false,
    parameters: jsonSchemaToActionParameters(
      zodToJsonSchema(ClusterUpdateRuntimeSchema) as any
    ),
    renderAndWaitForResponse: (props) => {
      return (
        <ClusterUpdateActionMessage
          args={props.args as { clusterName: string; [key: string]: any }}
          respond={props.respond}
          status={props.status}
        />
      );
    },
  });
};

export const deleteClusterAction = () => {
  const { cluster } = useTRPCClients();
  const deleteClusterMutation = useMutation({
    ...cluster.delete.mutationOptions(),
  });

  useCopilotAction({
    name: "deleteCluster",
    description: "Delete a cluster by its name",
    parameters: [
      {
        name: "clusterName",
        type: "string",
        required: true,
        description: "Name of the cluster to delete",
      },
    ],
    handler: async ({ clusterName }) => {
      const result = await deleteClusterMutation.mutateAsync({
        name: clusterName,
      });
      return `Cluster "${clusterName}" deleted successfully`;
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"deleteCluster"}>
          <AIToolHeader
            description={"Delete a cluster by its name"}
            name={"deleteCluster"}
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

export const clusterLifecycleAction = () => {
  useCopilotAction({
    name: "clusterLifecycle",
    description: "Manage cluster lifecycle (start, pause)",
    parameters: [
      {
        name: "clusterName",
        type: "string",
        required: true,
        description: "Name of the cluster",
      },
      {
        name: "action",
        type: "string",
        required: true,
        description: "Lifecycle action to perform",
        enum: ["start", "pause"],
      },
    ],
    renderAndWaitForResponse: (props) => {
      return (
        <ClusterLifecycleActionMessage
          args={props.args as { clusterName: string }}
          respond={props.respond}
          status={props.status}
          action={props.args.action as "start" | "pause"}
        />
      );
    },
  });
};

export const restartClusterAction = () => {
  // TODO: Implement restart cluster action
};

export const getClusterMonitorAction = () => {
  // TODO: Implement cluster monitoring action
};

export const backupClusterAction = () => {
  // TODO: Implement cluster backup action
};
