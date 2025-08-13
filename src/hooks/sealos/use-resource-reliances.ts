import { useMemo } from "react";
import { inferRelianceFromEnv } from "@/lib/sealos/services/reliances/env-reliance";
import { inferRelianceFromImage } from "@/lib/sealos/services/reliances/image-reliance";

interface ResourceObject {
  name: string;
  kind: string;
  image?: string;
  env?: Array<{
    name: string;
    value?: string;
    valueFrom?: {
      secretKeyRef?: {
        name: string;
        key: string;
      };
    };
  }>;
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
 * Merges two resource reliance objects
 * @param envReliances Reliances inferred from environment variables
 * @param imageReliances Reliances inferred from image names
 * @returns Merged reliances object
 */
function mergeReliances(
  envReliances: ResourceReliances,
  imageReliances: ResourceReliances
): ResourceReliances {
  const merged: ResourceReliances = { ...envReliances };

  // Merge image reliances into env reliances
  for (const kind in imageReliances) {
    if (!merged[kind]) {
      merged[kind] = {};
    }

    for (const resourceName in imageReliances[kind]) {
      if (!merged[kind][resourceName]) {
        merged[kind][resourceName] = [];
      }

      // Add image-based reliances that don't already exist
      for (const reliance of imageReliances[kind][resourceName]) {
        if (
          !merged[kind][resourceName].some(
            (r) => r.name === reliance.name && r.kind === reliance.kind
          )
        ) {
          merged[kind][resourceName].push(reliance);
        }
      }
    }
  }

  return merged;
}

export default function useResourceReliances(
  resourceObjects: ResourceObject[]
) {
  const reliances = useMemo(() => {
    const envReliances = inferRelianceFromEnv(resourceObjects);
    const imageReliances = inferRelianceFromImage(resourceObjects);

    return mergeReliances(envReliances, imageReliances);
  }, [resourceObjects]);

  return { reliances };
}
