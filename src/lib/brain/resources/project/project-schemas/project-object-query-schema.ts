import { z } from "zod";
import { PROJECT_METADATA_ANNOTATION_KEY } from "../project-constant/project-constant-annotation";
import { PROJECT_DISPLAY_NAME_ANNOTATION_KEY } from "../project-constant/project-constant-annotation";

export const ProjectObjectQuerySchema = z.object({
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
      const projectDisplayName =
        resourceMetadata["annotations"][PROJECT_DISPLAY_NAME_ANNOTATION_KEY];
      return projectDisplayName ?? resourceMetadata["name"];
    }),
  // metadata: z
  //   .any()
  //   .describe(
  //     JSON.stringify({
  //       resourceType: "instance",
  //       path: ["metadata.annotations"],
  //     })
  //   )
  //   .transform((resourceMetadata) => {
  //     const projectMetadata = resourceMetadata[PROJECT_METADATA_ANNOTATION_KEY];
  //     if (!projectMetadata) {
  //       return {
  //         compatibility: "desktop",
  //         resources: [],
  //       };
  //     }
  //     return JSON.parse(projectMetadata);
  //   }),
  createdAt: z.any().describe(
    JSON.stringify({
      resourceType: "instance",
      path: ["metadata.creationTimestamp"],
    })
  ),
});
