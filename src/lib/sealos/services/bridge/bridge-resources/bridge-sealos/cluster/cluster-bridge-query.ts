import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { composeObjectFromTarget } from "@/lib/sealos/services/bridge/bridge-method/bridge-query-utils";
import { ClusterObjectSchema } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { composeClusterPublicConnectionString } from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";
import { composeClusterPrivateConnectionString } from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";

export const getClusterObject = async (
  context: K8sApiContext,
  target: CustomResourceTarget
) => {
  // Test the new composeObjectFromTarget function
  const clusterObject = await composeObjectFromTarget(context, target);

  const publicConnectionString = composeClusterPublicConnectionString(
    clusterObject,
    context.regionUrl
  );
  const privateConnectionString = composeClusterPrivateConnectionString(
    clusterObject,
    context.namespace
  );

  clusterObject.connection.privateConnection.connectionString =
    privateConnectionString;

  if (publicConnectionString) {
    clusterObject.connection.publicConnection.connectionString =
      publicConnectionString;
  }

  // console.log("clusterObject", clusterObject);
  return ClusterObjectSchema.parse(clusterObject);
  // return clusterObject;
};
