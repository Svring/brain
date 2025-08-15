import { z } from "zod";
import { PROJECT_DISPLAY_NAME_ANNOTATION_KEY } from "../project-constant/project-constant-annotation";
import { get } from "lodash";

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
      // Safely get projectDisplayName using lodash get with fallback to undefined
      const projectDisplayName = get(
        resourceMetadata,
        `annotations.${PROJECT_DISPLAY_NAME_ANNOTATION_KEY}`,
        undefined
      );
      // Return projectDisplayName if found, otherwise fall back to resource name
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
