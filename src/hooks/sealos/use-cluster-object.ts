import { useQuery } from "@tanstack/react-query";
import { clusterClient } from "@/components/provider/trpc-provider";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";

export const useClusterObject = (clusterName: string) => {
  const clusterTrpcClient = clusterClient.useTRPC();

  // Create target for the cluster
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("cluster", clusterName)
  );

  return useQuery(
    clusterTrpcClient.getCluster.queryOptions({
      target: target,
    })
  );
};
