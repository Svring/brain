import { z } from "zod";
import { BRAIN_PROJECT_METADATA_ANNOTATION_KEY } from "../brain-constants/brain-constant-annotation-key";
import { PROJECT_DISPLAY_NAME_ANNOTATION_KEY } from "@/lib/project/project-constant/project-constant-label";

export const BrainProjectObjectQuerySchema = z.object({
  name: z.any().describe(
    JSON.stringify({
      resourceType: "instance",
      path: ["metadata.name"],
    })
  ),
  displayName: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "instance",
        path: ["metadata"],
      })
    )
    .transform((resourceMetadata) => {
      const brainProjectDisplayName =
        resourceMetadata["annotations"][PROJECT_DISPLAY_NAME_ANNOTATION_KEY];
      return brainProjectDisplayName ?? resourceMetadata["name"];
    }),
  metadata: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "instance",
        path: ["metadata.annotations"],
      })
    )
    .transform((resourceMetadata) => {
      const brainProjectMetadata =
        resourceMetadata[BRAIN_PROJECT_METADATA_ANNOTATION_KEY];
      if (!brainProjectMetadata) {
        return {
          compatibility: "desktop",
          resources: [],
        };
      }
      return JSON.parse(brainProjectMetadata);
    }),
  createdAt: z.any().describe(
    JSON.stringify({
      resourceType: "instance",
      path: ["metadata.creationTimestamp"],
    })
  ),
});
