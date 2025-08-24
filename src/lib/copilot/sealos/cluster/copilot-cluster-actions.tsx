import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { useQueryClient } from "@tanstack/react-query";
import {
  listClusterOptions,
  getClusterOptions,
  getClusterLogsOptions,
} from "@/lib/sealos/resources/cluster/cluster-method/cluster-query";
import {
  useCreateClusterMutation,
  useStartClusterMutation,
  usePauseClusterMutation,
  useDeleteClusterMutation,
  useUpdateClusterMutation,
} from "@/lib/sealos/resources/cluster/cluster-method/cluster-mutation";
import { useCopilotAction } from "@copilotkit/react-core";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import type { CreateClusterRequest } from "@/lib/sealos/resources/cluster/cluster-api/cluster-open-api-schemas";
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
import ClusterCreateMessage, {
  clusterFormSchema,
} from "@/components/chat/messages/system-messages.tsx/cluster/cluster-create-message";

export const activateClusterActions = (
  k8sContext: K8sApiContext,
  sealosContext: SealosApiContext
) => {
  listClusterAction(k8sContext);
  getClusterAction(k8sContext);
  createClusterAction(sealosContext);
  deleteClusterAction(sealosContext);
  startClusterAction(sealosContext);
  stopClusterAction(sealosContext);
  getClusterLogAction(k8sContext, sealosContext);
};

export const createClusterAction = (context: SealosApiContext) => {
  useCopilotAction({
    name: "createCluster",
    description: "Create a new database cluster with specified configuration",
    followUp: false,
    parameters: jsonSchemaToActionParameters(
      zodToJsonSchema(clusterFormSchema) as any
    ),
    handler: ({
      name,
      type,
      version,
      cpu,
      memory,
      storage,
      replicas,
      terminationPolicy,
    }) => {
      // This will be handled by the UI component
      return `Creating cluster "${name}" with ${type} version ${version}`;
    },
    render: ({ status, args }) => {
      // Always render the component, but pass undefined for incomplete parameters
      return (
        <ClusterCreateMessage
          payload={{
            name: typeof args.name === "string" ? args.name : undefined,
            type: typeof args.type === "string" ? args.type : undefined,
            version:
              typeof args.version === "string" ? args.version : undefined,
            cpu: typeof args.cpu === "string" ? parseInt(args.cpu) : undefined,
            memory:
              typeof args.memory === "string"
                ? parseInt(args.memory)
                : undefined,
            storage:
              typeof args.storage === "string"
                ? parseInt(args.storage)
                : undefined,
            replicas:
              typeof args.replicas === "string"
                ? parseInt(args.replicas)
                : undefined,
            terminationPolicy:
              typeof args.terminationPolicy === "string"
                ? (args.terminationPolicy as "Delete" | "WipeOut")
                : undefined,
          }}
        />
      );
    },
  });
};

export const listClusterAction = (context: K8sApiContext) => {
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "listClusters",
    description: "List all database clusters",
    handler: async () => {
      return await queryClient.fetchQuery(listClusterOptions(context));
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"listClusters"}>
          <AIToolHeader
            description={"List all database clusters"}
            name={"listClusters"}
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

export const getClusterAction = (context: K8sApiContext) => {
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "getCluster",
    description: "Get a specific cluster by name",
    parameters: [
      {
        name: "clusterName",
        type: "string",
        required: true,
        description: "Name of the cluster",
      },
    ],
    handler: ({ clusterName }) => {
      const target = CustomResourceTargetSchema.parse({
        ...convertResourceTypeToTarget("cluster"),
        name: clusterName,
      });
      return queryClient.fetchQuery(getClusterOptions(context, target));
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"getCluster"}>
          <AIToolHeader
            description={"Get a specific cluster by name"}
            name={"getCluster"}
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

export const deleteClusterAction = (context: SealosApiContext) => {
  const deleteCluster = useDeleteClusterMutation(context);

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
    handler: ({ clusterName }) => {
      return deleteCluster.mutateAsync({ name: clusterName });
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

export const updateClusterAction = (context: SealosApiContext) => {
  const updateCluster = useUpdateClusterMutation(context);

  useCopilotAction({
    name: "updateCluster",
    description: "Update an existing database cluster configuration",
    parameters: [
      {
        name: "clusterName",
        type: "string",
        required: true,
        description: "Name of the existing cluster to update",
      },
      {
        name: "replicas",
        type: "number",
        enum: Array.from({ length: 10 }, (_, i) => i + 1),
        required: false,
        description: "Number of replicas (1-10, leave empty to keep current)",
      },
      {
        name: "cpu",
        type: "string",
        enum: generateClusterCpuOptions(),
        required: false,
        description:
          "CPU in millicores (500m to 8000m, leave empty to keep current)",
      },
      {
        name: "memory",
        type: "string",
        enum: generateClusterMemoryOptions(),
        required: false,
        description: "Memory (512Mi to 32Gi, leave empty to keep current)",
      },
      {
        name: "storage",
        type: "string",
        enum: generateClusterStorageOptions(),
        required: false,
        description: "Storage (3Gi to 300Gi, leave empty to keep current)",
      },
    ],
    handler: ({ clusterName, replicas, cpu, memory, storage }) => {
      // Only include fields that are actually provided
      const resourceUpdates: any = {};

      if (replicas !== undefined) {
        resourceUpdates.replicas = replicas;
      }
      if (cpu !== undefined) {
        resourceUpdates.cpu = cpu;
      }
      if (memory !== undefined) {
        resourceUpdates.memory = memory;
      }
      if (storage !== undefined) {
        resourceUpdates.storage = storage;
      }

      // If no resource updates provided, throw error
      if (Object.keys(resourceUpdates).length === 0) {
        throw new Error(
          "At least one resource field must be specified for update"
        );
      }

      const updateRequest = {
        resource: resourceUpdates,
      };

      return updateCluster.mutateAsync({ clusterName, request: updateRequest });
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"updateCluster"}>
          <AIToolHeader
            description={"Update an existing database cluster configuration"}
            name={"updateCluster"}
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

export const getClusterLogAction = (
  k8sContext: K8sApiContext,
  clusterContext: SealosApiContext
) => {
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "getClusterLogs",
    description: "Get log files for a specific cluster",
    parameters: [
      {
        name: "clusterName",
        type: "string",
        required: true,
        description: "Name of the cluster to get logs for",
      },
    ],
    handler: ({ clusterName }) => {
      const target = CustomResourceTargetSchema.parse({
        ...convertResourceTypeToTarget("cluster"),
        name: clusterName,
      });
      return queryClient.fetchQuery(
        getClusterLogsOptions(k8sContext, clusterContext, target)
      );
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"getClusterLogs"}>
          <AIToolHeader
            description={"Get log files for a specific cluster"}
            name={"getClusterLogs"}
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

export const startClusterAction = (context: SealosApiContext) => {
  const startCluster = useStartClusterMutation(context);

  useCopilotAction({
    name: "startCluster",
    description: "Start a database cluster",
    parameters: [
      {
        name: "dbName",
        type: "string",
        required: true,
        description: "Name of the database to start",
      },
    ],
    handler: ({ dbName }) => {
      return startCluster.mutateAsync({ dbName });
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"startCluster"}>
          <AIToolHeader
            description={"Start a database cluster"}
            name={"startCluster"}
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

export const stopClusterAction = (context: SealosApiContext) => {
  const pauseCluster = usePauseClusterMutation(context);

  useCopilotAction({
    name: "stopCluster",
    description: "Stop (pause) a database cluster",
    parameters: [
      {
        name: "dbName",
        type: "string",
        required: true,
        description: "Name of the database to stop",
      },
    ],
    handler: ({ dbName }) => {
      return pauseCluster.mutateAsync({ dbName });
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"stopCluster"}>
          <AIToolHeader
            description={"Stop (pause) a database cluster"}
            name={"stopCluster"}
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

export const restartClusterAction = async () => {};

export const getClusterMonitorAction = async () => {};

export const backupClusterAction = async () => {};
