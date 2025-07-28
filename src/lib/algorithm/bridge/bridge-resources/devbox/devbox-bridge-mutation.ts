import {
  parseSchemaDescriptions,
  substituteMutationTemplates,
  convertMutationsToTargets,
} from "@/lib/algorithm/bridge/bridge-method/bridge-mutation-utils";
import {
  DevboxObjectUpdateSchema,
  DevboxObjectUpdate,
} from "../../../../sealos/devbox/devbox-schemas/devbox-object-mutation-schema";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";

/**
 * Parse devbox schema descriptions to extract mutation operations
 */
export function mutateDevboxObject(
  context: K8sApiContext,
  target: CustomResourceTarget,
  data: DevboxObjectUpdate
) {
  const descriptions = parseSchemaDescriptions(DevboxObjectUpdateSchema);
  console.log("descriptions", descriptions);

  const mutations = substituteMutationTemplates(descriptions, data);
  console.log("devbox mutations", mutations);

  const targets = convertMutationsToTargets(target, mutations);
  console.log("devbox targets", targets);
}
