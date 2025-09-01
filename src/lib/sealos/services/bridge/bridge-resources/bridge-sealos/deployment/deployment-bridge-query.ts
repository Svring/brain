import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { composeObjectFromTarget } from "@/lib/sealos/services/bridge/bridge-method/bridge-query-utils";
import { getDeploymentRelatedResources } from "@/lib/sealos/resources/deployment/deployment-method/deployment-query";
import { enrichPortsWithService } from "@/lib/sealos/resources/service/service-method/service-utils";
import { enrichPortsWithIngress } from "@/lib/sealos/resources/ingress/ingress-method/ingress-utils";
import {
  DeploymentObjectSchema,
  DeploymentObject,
} from "@/lib/sealos/resources/deployment/deployment-object-schema";
import _ from "lodash";

export const getDeploymentObject = async (
  context: K8sApiContext,
  target: BuiltinResourceTarget
): Promise<DeploymentObject> => {
  const deploymentObject = await composeObjectFromTarget(context, target);
  const relatedResources = await getDeploymentRelatedResources(
    context,
    deploymentObject.name,
    ["service", "ingress"],
    []
  );

  // console.log("relatedResources", relatedResources);

  // Ensure ports array exists
  if (!deploymentObject.ports) {
    deploymentObject.ports = [];
  }

  // Enrich ports with service information first
  deploymentObject.ports = enrichPortsWithService(
    relatedResources.filter((resource) => resource.kind === "Service") as any[],
    context,
    deploymentObject.ports
  );

  // Then enrich with ingress information
  deploymentObject.ports = enrichPortsWithIngress(
    relatedResources.filter((resource) => resource.kind === "Ingress") as any[],
    context,
    deploymentObject.ports
  );

  console.log("deploymentObject.ports", deploymentObject.ports);

  // console.log("getDeploymentObject", deploymentObject);
  return DeploymentObjectSchema.parse(deploymentObject);
};
