import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { composeObjectFromTarget } from "../../../bridge-method/bridge-query-utils";
import { getStatefulsetRelatedResources } from "@/lib/sealos/resources/statefulset/statefulset-method/statefulset-query";
import { enrichPortsWithService } from "@/lib/sealos/resources/service/service-method/service-utils";
import { enrichPortsWithIngress } from "@/lib/sealos/resources/ingress/ingress-method/ingress-utils";
import {
  StatefulsetObject,
  StatefulsetObjectSchema,
} from "@/lib/sealos/resources/statefulset/statefulset-object-schema";

export const getStatefulSetObject = async (
  context: K8sApiContext,
  target: BuiltinResourceTarget
): Promise<StatefulsetObject> => {
  const statefulSetObject = await composeObjectFromTarget(context, target);
  // console.log("statefulSetObject", statefulSetObject);
  const relatedResources = await getStatefulsetRelatedResources(
    context,
    statefulSetObject.name,
    ["service", "ingress", "pvc"],
    []
  );

  // console.log("relatedResources", relatedResources);

  // Ensure ports array exists
  if (!statefulSetObject.ports) {
    statefulSetObject.ports = [];
  }

  // Enrich ports with service information first
  statefulSetObject.ports = enrichPortsWithService(
    relatedResources.filter((resource) => resource.kind === "Service") as any[],
    context,
    statefulSetObject.ports
  );

  // Then enrich with ingress information
  statefulSetObject.ports = enrichPortsWithIngress(
    relatedResources.filter((resource) => resource.kind === "Ingress") as any[],
    context,
    statefulSetObject.ports
  );

  // console.log("getStatefulSetObject", statefulSetObject);
  return StatefulsetObjectSchema.parse(statefulSetObject);
};
