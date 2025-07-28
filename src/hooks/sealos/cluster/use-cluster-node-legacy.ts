"use client";

import { useQueries } from "@tanstack/react-query";
import {
  listResourcesByLabelOptions,
  getCustomResourceOptions,
  getPodsByResourceTargetOptions,
  getSecretsByResourceTargetOptions,
} from "@/lib/k8s/k8s-method/k8s-query";
import _ from "lodash";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { CLUSTER_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { flattenResourceList } from "@/lib/k8s/k8s-method/k8s-utils";
import {
  K8sResourceSchema,
  K8sResource,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { ClusterResourceSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/cluster-schemas";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { convertClusterK8sToNodeData } from "@/lib/sealos/cluster/cluster-utils";
import { ClusterNodeData } from "@/lib/sealos/cluster/schemas/cluster-node-schemas";

const useClusterNode = (
  context: K8sApiContext,
  target: CustomResourceTarget
) => {
  const clusterLabel = `${CLUSTER_RELATE_RESOURCE_LABELS.APP_KUBERNETES_INSTANCE}=${target.name}`;

  const queries = useQueries({
    queries: [
      {
        ...getCustomResourceOptions(context, target),
        select: (data: any) => ClusterResourceSchema.parse(data),
      },
      {
        ...listResourcesByLabelOptions(context, clusterLabel, ["secret"]),
        select: (data: any) =>
          _.map(flattenResourceList(_.get(data, "builtin.secret")), (item) =>
            K8sResourceSchema.parse(item)
          ),
      },
      {
        ...listResourcesByLabelOptions(context, clusterLabel, ["service"]),
        select: (data: any) =>
          _.map(flattenResourceList(_.get(data, "builtin.service")), (item) =>
            K8sResourceSchema.parse(item)
          ),
      },
    ],
  });

  if (queries.some((query) => query.isLoading)) {
    return {
      data: undefined,
      isLoading: true,
    };
  }

  const [resourceQuery, secretsQuery, servicesQuery] = queries;
  const resourceData = resourceQuery.data;
  const secretsData = secretsQuery.data;
  const servicesData = servicesQuery.data;

  console.log("resourceData", resourceData);
  console.log("secretsData", secretsData);
  console.log("servicesData", servicesData);

  const nodeData = convertClusterK8sToNodeData(resourceData!);

  return {
    nodeData,
    isLoading: false,
  };
};

export default useClusterNode;
