import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listClusterOptions,
  getClusterOptions,
  getClusterLogFilesOptions,
} from "@/lib/sealos/cluster/cluster-method/cluster-query";
import {
  useCreateClusterMutation,
  useStartClusterMutation,
  usePauseClusterMutation,
  useDeleteClusterMutation,
} from "@/lib/sealos/cluster/cluster-method/cluster-mutation";
import { useCopilotAction } from "@copilotkit/react-core";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

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
        description: "Database type (e.g., kafka, postgresql, mongodb)",
      },
      {
        name: "dbVersion",
        type: "string",
        required: true,
        description: "Database version (e.g., kafka-3.3.2)",
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
        description: "Number of replicas (default: 1)",
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
        description: "Storage in GB (default: 10)",
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
    }) => {
      const createRequest = {
        dbForm: {
          dbType,
          dbVersion,
          dbName,
          replicas: replicas ?? 1,
          cpu: cpu ?? 1000,
          memory: memory ?? 1024,
          storage: storage ?? 10,
          labels: {},
          autoBackup: {
            start: false,
            type: "day",
            week: [],
            hour: "0",
            minute: "0",
            saveTime: 7,
            saveType: "d",
          },
          terminationPolicy: "Delete" as const,
        },
        isEdit: false,
      };
      return createCluster.mutateAsync(createRequest);
    },
  });
};

export const listClusterAction = (context: K8sApiContext) => {
  const { data } = useQuery(listClusterOptions(context));

  useCopilotAction({
    name: "listClusters",
    description: "List all database clusters",
    handler: () => data,
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
        getClusterLogFilesOptions(k8sContext, clusterContext, target)
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
  });
};

export const restartClusterAction = async () => {};

export const getClusterMonitorAction = async () => {};

export const backupClusterAction = async () => {};
