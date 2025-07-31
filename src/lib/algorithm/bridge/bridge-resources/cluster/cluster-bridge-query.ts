import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { composeObjectFromTarget } from "@/lib/algorithm/bridge/bridge-method/bridge-query-utils";

export const getClusterObject = async (
  context: K8sApiContext,
  target: CustomResourceTarget
) => {
  // Test the new composeObjectFromTarget function
  const clusterObject = await composeObjectFromTarget(context, target);

  // console.log("clusterObject", clusterObject);
  return clusterObject;
};
