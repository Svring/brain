import type { AnyKubernetesResource } from "@/lib/k8s/schemas";
import { PROJECT_NAME_LABEL_KEY } from "./project-constant";

// Helper function to extract project name from resource metadata
export const getProjectNameFromResource = (
  resource: AnyKubernetesResource
): string | null => {
  return resource.metadata.labels?.[PROJECT_NAME_LABEL_KEY] ?? null;
};
