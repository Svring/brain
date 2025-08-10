import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { composeObjectFromTarget } from "@/lib/algorithm/bridge/bridge-method/bridge-query-utils";
import { BrainProjectObjectSchema } from "@/lib/brain/brain-schemas/brain-project-object-schema";

export const getBrainProjectObject = async (
  context: K8sApiContext,
  target: CustomResourceTarget
) => {
  // Test the new composeObjectFromTarget function
  const brainProjectObject = await composeObjectFromTarget(context, target);
  return BrainProjectObjectSchema.parse(brainProjectObject);
};
