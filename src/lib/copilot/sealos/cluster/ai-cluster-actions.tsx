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
  useStopClusterMutation,
  useDeleteClusterMutation,
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
  const createCluster = useCreateClusterMutation(context);

  useCopilotAction({
    name: "createCluster",
    description: "Create a new database cluster",
    parameters: [
      {
        name: "dbType",
        type: "string",
        required: true,
        description: "Database type (e.g., postgresql, mongodb, redis, kafka)",
      },
      {
        name: "dbVersion",
        type: "string",
        required: true,
        description: "Database version (e.g., 14.0, 6.0, 7.0)",
      },
      {
        name: "dbName",
        type: "string",
        required: true,
        description: "Database name",
      },
      {
        name: "replicas",
        type: "number",
        required: false,
        description: "Number of replicas (default: 1, max: 3)",
      },
      {
        name: "cpu",
        type: "number",
        required: false,
        description: "CPU in millicores (default: 1000)",
      },
      {
        name: "memory",
        type: "number",
        required: false,
        description: "Memory in MB (default: 1024)",
      },
      {
        name: "storage",
        type: "number",
        required: false,
        description: "Storage in GB (default: 3)",
      },
      {
        name: "terminationPolicy",
        type: "string",
        required: false,
        description: "Termination policy: 'Delete' or 'WipeOut' (default: 'Delete')",
      },
    ],
    handler: ({
      dbType,
      dbVersion,
      dbName,
      replicas,
      cpu,
      memory,
      storage,
      terminationPolicy,
    }) => {
      // Validate dbType against allowed values
      const validDbTypes = [
        "postgresql",
        "mongodb",
        "apecloud-mysql",
        "redis",
        "kafka",
        "qdrant",
        "nebula",
        "weaviate",
        "milvus",
        "pulsar",
        "clickhouse",
      ] as const;
      
      if (!validDbTypes.includes(dbType as any)) {
        throw new Error(`Invalid database type: ${dbType}. Valid types are: ${validDbTypes.join(", ")}`);
      }

      const createRequest: CreateClusterRequest = {
        dbForm: {
          terminationPolicy: (terminationPolicy as "Delete" | "WipeOut") || "Delete",
          name: dbName,
          type: dbType as any, // Cast to ClusterType
          version: dbVersion,
          resource: {
            cpu: `${cpu ?? 1000}m`,
            memory: `${memory ?? 1024}Mi`,
            storage: `${storage ?? 3}Gi`,
            replicas: replicas ?? 1,
          },
        },
      };
      
      return createCluster.mutateAsync(createRequest);
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"createCluster"}>
          <AIToolHeader
            description={"Create a new database cluster"}
            name={"createCluster"}
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

export const updateClusterAction = async () => {};

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
      {
        name: "dbType",
        type: "string",
        required: true,
        description: "Database type (e.g., kafka, postgresql, mongodb)",
      },
    ],
    handler: ({ dbName, dbType }) => {
      return startCluster.mutateAsync({ dbName, dbType });
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

export const stopClusterAction = (context: SealosApiContext) => {
  const pauseCluster = useStopClusterMutation(context);

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
      {
        name: "dbType",
        type: "string",
        required: true,
        description: "Database type (e.g., kafka, postgresql, mongodb)",
      },
    ],
    handler: ({ dbName, dbType }) => {
      return pauseCluster.mutateAsync({ dbName, dbType });
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

export const restartClusterAction = async () => {};

export const getClusterMonitorAction = async () => {};

export const backupClusterAction = async () => {};
