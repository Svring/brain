import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { composeObjectFromTarget } from "../../../bridge-method/bridge-query-utils";
import { getStatefulsetRelatedResources } from "@/lib/sealos/resources/statefulset/statefulset-method/statefulset-query";
import { enrichPortsWithService } from "@/lib/sealos/resources/service/service-method/service-utils";
import { enrichPortsWithIngress } from "@/lib/sealos/resources/ingress/ingress-method/ingress-utils";
import {
  StatefulsetObjectQuerySchema,
  StatefulsetObjectQuery,
} from "@/lib/sealos/resources/statefulset/statefulset-object-query-schema";
import _ from "lodash";

export const getStatefulSetObject = async (
  context: K8sApiContext,
  target: BuiltinResourceTarget
): Promise<StatefulsetObjectQuery> => {
  const statefulSetObject = await composeObjectFromTarget(context, target);
  console.log("statefulSetObject", statefulSetObject);
  const relatedResources = await getStatefulsetRelatedResources(
    context,
    statefulSetObject.name,
    ["service", "ingress"],
    []
  );

  statefulSetObject.ports = _.chain(statefulSetObject.ports)
    .thru((ports) =>
      enrichPortsWithService(
        ports,
        relatedResources.filter(
          (resource) => resource.kind === "Service"
        ) as any[],
        context
      )
    )
    .thru((ports) =>
      enrichPortsWithIngress(
        ports,
        relatedResources.filter(
          (resource) => resource.kind === "Ingress"
        ) as any[],
        context
      )
    )
    .value();

  // console.log("getStatefulSetObject", statefulSetObject);
  return statefulSetObject;
};
