import type { EnvVar } from "@/lib/k8s/k8s-method/k8s-utils";

interface ResourceObject {
  name: string;
  kind: string;
  env?: EnvVar[];
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
 * Infers resource dependencies based on environment variables
 * @param resourceObjects Array of resource objects to analyze
 * @returns Object containing resource dependencies grouped by kind and name
 */
export function inferRelianceFromEnv(
  resourceObjects: ResourceObject[]
): ResourceReliances {
  const result: ResourceReliances = {};

  // Filter owner resources (deployment and statefulset only)
  const ownerResources = resourceObjects.filter(
    (resource) =>
      resource.kind.toLowerCase() === "deployment" ||
      resource.kind.toLowerCase() === "statefulset"
  );

  // All resources can be dependencies (including other deployments/statefulsets)
  const dependencyResources = resourceObjects;

  for (const ownerResource of ownerResources) {
    const ownerKind = ownerResource.kind.toLowerCase();
    const ownerName = ownerResource.name;

    // Initialize result structure
    if (!result[ownerKind]) {
      result[ownerKind] = {};
    }
    result[ownerKind][ownerName] = [];

    // Extract env values
    const envValues: string[] = [];
    if (ownerResource.env) {
      for (const envVar of ownerResource.env) {
        if (envVar.type === "value") {
          // Direct value environment variable
          envValues.push(envVar.value);
        } else if (envVar.type === "secretKeyRef") {
          // Secret reference environment variable
          envValues.push(envVar.secretName);
        }
      }
    }

    // Match env values against dependency resource names
    for (const envValue of envValues) {
      let bestMatch: ResourceObject | null = null;
      let bestMatchLength = 0;

      for (const depResource of dependencyResources) {
        const depName = depResource.name;

        // Skip self-reference (a resource cannot depend on itself)
        if (
          depResource.name === ownerName &&
          depResource.kind.toLowerCase() === ownerKind
        ) {
          continue;
        }

        // Check if env value contains the dependency resource name
        if (envValue.includes(depName) && depName.length > bestMatchLength) {
          bestMatch = depResource;
          bestMatchLength = depName.length;
        }
      }

      // Add the best match if found and not already added
      if (
        bestMatch &&
        !result[ownerKind][ownerName].some((r) => r.name === bestMatch!.name)
      ) {
        result[ownerKind][ownerName].push({
          name: bestMatch.name,
          kind: bestMatch.kind,
        });
      }
    }
  }

  return result;
}
