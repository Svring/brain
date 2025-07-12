"use client";

import {
  useCreateClusterMutation,
  useDeleteClusterMutation,
} from "../cluster-mutation";
import { createClusterContext, generateClusterName } from "../cluster-utils";
import type {
  ClusterCreateRequest,
  DbForm,
} from "../schemas/req-res-schemas/req-res-create-schemas";

/**
 * Create a cluster using the authenticated user's context.
 * Usage: createClusterAction({ dbForm: { ... } })
 */
export function createClusterAction(request: Partial<ClusterCreateRequest>) {
  const clusterContext = createClusterContext();
  const mutation = useCreateClusterMutation(clusterContext);

  // Provide sensible defaults for dbForm
  const defaultDbForm: DbForm = {
    dbType: "kafka",
    dbVersion: "kafka-3.3.2",
    dbName: generateClusterName(),
    replicas: 1,
    cpu: 1000,
    memory: 2048,
    storage: 10,
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
    terminationPolicy: "Delete",
  };

  return mutation.mutate({
    dbForm: { ...defaultDbForm, ...(request.dbForm || {}) },
    isEdit: request.isEdit ?? false,
  });
}

/**
 * Delete a cluster by name using the authenticated user's context.
 * Usage: deleteClusterAction(clusterName)
 */
export function deleteClusterAction(clusterName: string) {
  const clusterContext = createClusterContext();
  const mutation = useDeleteClusterMutation(clusterContext);
  return mutation.mutate({ name: clusterName });
}
