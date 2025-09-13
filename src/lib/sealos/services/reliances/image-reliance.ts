import { truncateImage } from "@/lib/sealos/sealos-utils";
import { Image } from "@/schemas/forms/launchpad/components/launchpad-image-schema";

interface ResourceObject {
  name: string;
  kind: string;
  image?: Image;
  [key: string]: any;
}

interface ResourceReliances {
  [kind: string]: {
    [resourceName: string]: Array<{
      name: string;
      kind: string;
    }>;
  };
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

    // Process workload image if it exists
    if (workload.image?.imageName) {
      // Use truncateImage to extract the meaningful part of the image name
      const processedImage = truncateImage(workload.image.imageName);

      // Find devboxes whose names match the processed image
      for (const devbox of devboxResources) {
        const devboxName = devbox.name;

        // Check if the processed image contains the devbox name
        // This handles cases where devbox name is part of the image name
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
