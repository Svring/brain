import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import {
  BrainProjectObjectMetadataSchema,
  BrainProjectObjectMetadata,
} from "../brain-schemas/brain-project-object-schema";

export const composeBrainProjectMetadata = (): BrainProjectObjectMetadata => {
  return BrainProjectObjectMetadataSchema.parse({
    compatibility: "brain",
    resources: [],
  });
};
