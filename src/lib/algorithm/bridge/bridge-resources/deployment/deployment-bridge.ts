import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { composeObjectFromTarget } from "@/lib/algorithm/bridge/bridge-method/bridge-query-utils";
import { getDeploymentRelatedResources } from "@/lib/algorithm/relevance/deployment/deployment-relevance";
import { enrichPortsWithService } from "@/lib/sealos/service/service-method/service-utils";
import { enrichPortsWithIngress } from "@/lib/sealos/ingress/ingress-method/ingress-utils";

export const getDeploymentObject = async (
  context: K8sApiContext,
  target: BuiltinResourceTarget
) => {
  // Test the new composeObjectFromTarget function
  const deploymentObject = await composeObjectFromTarget(context, target);
  console.log("deploymentObject", deploymentObject);
  const relatedServices = await getDeploymentRelatedResources(
    context,
    deploymentObject.name,
    ["service"],
    []
  );
  console.log("relatedServices", relatedServices);
  deploymentObject.ports = enrichPortsWithService(
    deploymentObject.ports,
    relatedServices as any[]
  );

  const relatedIngresses = await getDeploymentRelatedResources(
    context,
    deploymentObject.name,
    ["ingress"],
    []
  );
  console.log("relatedIngresses", relatedIngresses);
  deploymentObject.ports = enrichPortsWithIngress(
    deploymentObject.ports,
    relatedIngresses as any[]
  );
  return deploymentObject;
};
