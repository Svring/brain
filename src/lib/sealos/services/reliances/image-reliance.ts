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
 * Matches deployment images (processed by truncateImage) against devbox names
 * @param resourceObjects Array of resource objects to analyze (devbox and deployment only)
 * @returns Object containing resource dependencies grouped by kind and name
 */
export function inferRelianceFromImage(
  resourceObjects: ResourceObject[]
): ResourceReliances {
  const result: ResourceReliances = {};

  // Filter devbox and deployment resources
  const devboxResources = resourceObjects.filter(
    (resource) => resource.kind.toLowerCase() === "devbox"
  );

  const deploymentResources = resourceObjects.filter(
    (resource) => resource.kind.toLowerCase() === "deployment"
  );

  // Process each deployment to find matching devboxes
  for (const deployment of deploymentResources) {
    const deploymentKind = deployment.kind.toLowerCase();
    const deploymentName = deployment.name;

    // Initialize result structure
    if (!result[deploymentKind]) {
      result[deploymentKind] = {};
    }
    result[deploymentKind][deploymentName] = [];

    // Process deployment image if it exists
    if (deployment.image?.imageName) {
      // Use truncateImage to extract the meaningful part of the image name
      const processedImage = truncateImage(deployment.image.imageName);

      // Find devboxes whose names match the processed image
      for (const devbox of devboxResources) {
        const devboxName = devbox.name;

        // Check if the processed image contains the devbox name
        // This handles cases where devbox name is part of the image name
        if (processedImage.includes(devboxName)) {
          // Add the devbox as a dependency if not already added
          if (
            !result[deploymentKind][deploymentName].some(
              (r) => r.name === devboxName
            )
          ) {
            result[deploymentKind][deploymentName].push({
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
