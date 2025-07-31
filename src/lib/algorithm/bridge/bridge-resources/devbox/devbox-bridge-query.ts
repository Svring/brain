import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { composeObjectFromTarget } from "@/lib/algorithm/bridge/bridge-method/bridge-query-utils";
import { getDevboxRelatedResources } from "@/lib/algorithm/relevance/devbox/devbox-relevance";
import { enrichPortsWithService } from "@/lib/sealos/service/service-method/service-utils";
import { enrichPortsWithIngress } from "@/lib/sealos/ingress/ingress-method/ingress-utils";
import { enrichSshWithRegionUrl } from "@/lib/sealos/devbox/devbox-method/devbox-utils";
import { DevboxObjectSchema } from "@/lib/sealos/devbox/devbox-schemas/devbox-object-schema";
import _ from "lodash";

export const getDevboxObject = async (
  context: K8sApiContext,
  target: CustomResourceTarget
) => {
  // Test the new composeObjectFromTarget function
  const devboxObject = await composeObjectFromTarget(context, target);
  const relatedResources = await getDevboxRelatedResources(
    context,
    devboxObject.name,
    ["service", "ingress"],
    []
  );

  devboxObject.ports = _.chain(devboxObject.ports)
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

  devboxObject.ssh = enrichSshWithRegionUrl(devboxObject.ssh, context);

  return DevboxObjectSchema.parse(devboxObject);
};
