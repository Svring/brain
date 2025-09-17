import { truncateImage } from "@/lib/sealos/sealos-utils";
import type { ResourceObject, ResourceReliances } from "./reliances-schema";

/**
 * Extracts image name from either ImageSchema object or string
 * @param image - Image can be either ImageSchema object or string
 * @returns The image name string or undefined if not available
 */
function getImageName(image: any | string | undefined): string | undefined {
  if (!image) return undefined;

  if (typeof image === "string") {
    return image;
  }

  return image.imageName;
}

/**
 * Infers resource dependencies based on image names
 * Matches deployment and statefulset images (processed by truncateImage) against devbox names
 * @param resourceObjects Array of resource objects to analyze (devbox, deployment, and statefulset)
 * @returns Object containing resource dependencies grouped by kind and name
 */
export function inferRelianceFromImage(
  resourceObjects: ResourceObject[]
): ResourceReliances {
  const result: ResourceReliances = {};

  // Filter devbox resources
  const devboxResources = resourceObjects.filter(
    (resource) => resource.kind.toLowerCase() === "devbox"
  );

  // Filter deployment and statefulset resources (both are workload resources)
  const workloadResources = resourceObjects.filter(
    (resource) =>
      resource.kind.toLowerCase() === "deployment" ||
      resource.kind.toLowerCase() === "statefulset"
  );

  // Process each workload resource to find matching devboxes
  for (const workload of workloadResources) {
    const workloadKind = workload.kind.toLowerCase();
    const workloadName = workload.name;

    // Initialize result structure
    if (!result[workloadKind]) {
      result[workloadKind] = {};
    }
    result[workloadKind][workloadName] = [];

    // Extract image name from workload (should be ImageSchema object)
    const workloadImageName = getImageName(workload.image);

    if (workloadImageName) {
      // Use truncateImage to extract the meaningful part of the image name
      const processedImage = truncateImage(workloadImageName);

      // Find devboxes whose names match the processed image
      for (const devbox of devboxResources) {
        const devboxName = devbox.name;
        // Extract devbox image name (should be string)
        const devboxImageName = getImageName(devbox.image);

        // Check if the processed workload image contains the devbox name
        // This handles cases where devbox name is part of the workload image name
        if (processedImage.includes(devboxName)) {
          // Add the devbox as a dependency if not already added
          if (
            !result[workloadKind][workloadName].some(
              (r) => r.name === devboxName
            )
          ) {
            result[workloadKind][workloadName].push({
              name: devboxName,
              kind: devbox.kind,
            });
          }
        }
      }
    }
  }

  return result;
}
