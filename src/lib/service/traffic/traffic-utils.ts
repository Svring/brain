"use client";

import { TrafficApiContextSchema } from "./schemas/traffic-api-context-schema";
import { useAuthState } from "@/contexts/auth/auth-context";
import {
  TRAFFIC_URL,
  TRAFFIC_TEST_URL,
} from "./traffic-constant/traffic-constant-url";
import { TRAFFIC_RESOURCE_TYPE } from "./traffic-constant/traffic-constant-type";

export function createTrafficApiContext() {
  const { auth } = useAuthState();
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  if (!auth) {
    throw new Error("Auth context is not available");
  }
  return TrafficApiContextSchema.parse({
    baseURL: isDevelopment ? TRAFFIC_TEST_URL : TRAFFIC_URL,
    kubeconfig: auth.kubeconfig,
  });
}

/**
 * Maps Kubernetes resource types to traffic resource types
 * @param k8sResourceType - The Kubernetes resource type (e.g., "devbox", "deployment", "cluster")
 * @returns The corresponding traffic resource type or null if no mapping exists
 */
export function convertToTrafficType(
  k8sResourceType: string
): (typeof TRAFFIC_RESOURCE_TYPE)[number] | null {
  const resourceTypeMap: Record<
    string,
    (typeof TRAFFIC_RESOURCE_TYPE)[number]
  > = {
    // Custom resources
    devbox: "devbox",
    cluster: "database",
    objectstoragebucket: "oss",
    app: "app",

    // Builtin resources
    deployment: "app",
    statefulset: "app",
  };

  return resourceTypeMap[k8sResourceType.toLowerCase()] || null;
}

/**
 * Determines if a Kubernetes kind is supported in the traffic resource type system
 * @param kind - The Kubernetes kind (e.g., "Devbox", "Deployment", "Cluster")
 * @returns True if the kind is supported, false otherwise
 */
export function isSupportedInTraffic(kind: string): boolean {
  // Convert kind to resource type (lowercase)
  const resourceType = kind.toLowerCase();
  return convertToTrafficType(resourceType) !== null;
}

/**
 * Converts traffic types back to Kubernetes kinds
 * @param trafficType - The traffic resource type
 * @returns The corresponding Kubernetes kind or the original type if no mapping exists
 */
export function convertFromTrafficType(trafficType: string): string {
  const trafficToK8sMap: Record<string, string> = {
    devbox: "devbox",
    database: "cluster",
    app: "statefulset",
    oss: "objectstoragebucket",
  };

  return trafficToK8sMap[trafficType.toLowerCase()] || trafficType;
}

/**
 * Parses a flow string in format "namespace/type/name"
 * @param flow - The flow string to parse
 * @returns Parsed flow components or null if invalid format
 */
export function parseFlow(flow: string): {
  namespace: string;
  type: string;
  name: string;
} | null {
  const parts = flow.split("/");
  if (parts.length !== 3) return null;

  const [namespace, trafficType, name] = parts;
  const k8sKind = convertFromTrafficType(trafficType);

  return {
    namespace,
    type: k8sKind,
    name,
  };
}

/**
 * Converts Kubernetes resources to traffic request format
 * @param resources - Record of resource lists or array of resources with name and type properties
 * @returns Array of resources filtered for traffic support and converted to traffic types
 */
export function convertToTrafficRequest(
  resources:
    | Record<string, { items: any[] }>
    | Array<{ name?: string; type: string }>
): { resources: Array<{ name: string; type: string }> } {
  let flattenedResourcesList: Array<{ name?: string; type: string }>;

  if (Array.isArray(resources)) {
    // If already an array, use it directly
    flattenedResourcesList = resources;
  } else {
    // If it's a record of resource lists, flatten and extract names/types
    const flattenedResources = Object.fromEntries(
      Object.entries(resources).map(([key, resourceList]) => [
        key,
        resourceList.items.map((resource: any) => ({
          name: resource.metadata?.name,
          type: resource.kind,
        })),
      ])
    );

    flattenedResourcesList = Object.values(flattenedResources).flat();
  }

  return {
    resources: flattenedResourcesList
      .filter((resource) => {
        return (
          resource.name !== undefined && isSupportedInTraffic(resource.type)
        );
      })
      .map((resource) => {
        const trafficType = convertToTrafficType(resource.type.toLowerCase());
        return {
          name: resource.name!,
          type: trafficType!,
        };
      }),
  };
}

/**
 * Transforms traffic API response to reliance structure
 * @param trafficResponse - The traffic API response data
 * @returns Reliance structure organized by resource kind and name
 */
export function transformTrafficToReliance(
  trafficResponse: {
    message: string;
    data: Array<{
      resource: { name: string; type: string };
      flows: string[];
    }>;
  },
  currentNamespace: string
): Record<
  string,
  Record<
    string,
    {
      connectFrom: Record<string, string[]>;
      external?: Record<string, Record<string, string[]>>;
    }
  >
> {
  const reliance: Record<
    string,
    Record<
      string,
      {
        connectFrom: Record<string, string[]>;
        external?: Record<string, Record<string, string[]>>;
      }
    >
  > = {};

  trafficResponse.data.forEach((item) => {
    const { resource, flows } = item;
    const resourceKind = convertFromTrafficType(resource.type);
    const resourceName = resource.name;

    // Initialize structure if not exists
    if (!reliance[resourceKind]) {
      reliance[resourceKind] = {};
    }
    if (!reliance[resourceKind][resourceName]) {
      reliance[resourceKind][resourceName] = { connectFrom: {} };
    }

    // Process each flow
    flows.forEach((flow) => {
      const parsedFlow = parseFlow(flow);
      if (parsedFlow) {
        const {
          namespace: flowNamespace,
          type: flowKind,
          name: flowName,
        } = parsedFlow;

        if (flowNamespace === currentNamespace) {
          // Same namespace - add to connectFrom
          if (!reliance[resourceKind][resourceName].connectFrom[flowKind]) {
            reliance[resourceKind][resourceName].connectFrom[flowKind] = [];
          }

          if (
            !reliance[resourceKind][resourceName].connectFrom[
              flowKind
            ].includes(flowName)
          ) {
            reliance[resourceKind][resourceName].connectFrom[flowKind].push(
              flowName
            );
          }
        } else {
          // Different namespace - add to external
          if (!reliance[resourceKind][resourceName].external) {
            reliance[resourceKind][resourceName].external = {};
          }
          if (!reliance[resourceKind][resourceName].external![flowNamespace]) {
            reliance[resourceKind][resourceName].external![flowNamespace] = {};
          }
          if (
            !reliance[resourceKind][resourceName].external![flowNamespace][
              flowKind
            ]
          ) {
            reliance[resourceKind][resourceName].external![flowNamespace][
              flowKind
            ] = [];
          }

          if (
            !reliance[resourceKind][resourceName].external![flowNamespace][
              flowKind
            ].includes(flowName)
          ) {
            reliance[resourceKind][resourceName].external![flowNamespace][
              flowKind
            ].push(flowName);
          }
        }
      }
    });
  });

  return reliance;
}

/**
 * Corrects resource types in reliance structure by checking actual deployment and statefulset resources
 * @param reliance - The reliance structure to correct
 * @param deploymentResources - Array of deployment resources
 * @param statefulsetResources - Array of statefulset resources
 * @returns Corrected reliance structure with accurate resource types
 */
export function correctRelianceResourceTypes(
  reliance: Record<
    string,
    Record<
      string,
      {
        connectFrom: Record<string, string[]>;
        external?: Record<string, Record<string, string[]>>;
      }
    >
  >,
  deploymentResources: Array<{ metadata?: { name?: string } }>,
  statefulsetResources: Array<{ metadata?: { name?: string } }>
): Record<
  string,
  Record<
    string,
    {
      connectFrom: Record<string, string[]>;
      external?: Record<string, Record<string, string[]>>;
    }
  >
> {
  // Create lookup sets for quick name checking
  const deploymentNames = new Set(
    deploymentResources
      .map((resource) => resource.metadata?.name)
      .filter((name) => name !== undefined)
  );

  const statefulsetNames = new Set(
    statefulsetResources
      .map((resource) => resource.metadata?.name)
      .filter((name) => name !== undefined)
  );

  const correctedReliance = JSON.parse(JSON.stringify(reliance)); // Deep clone

  // Check if we have statefulset entries to correct
  if (correctedReliance.statefulset) {
    const statefulsetEntries = correctedReliance.statefulset;
    const resourcesToMove: Array<{ name: string; data: any }> = [];

    // Find statefulset entries that should be deployments
    Object.entries(statefulsetEntries).forEach(
      ([resourceName, resourceData]) => {
        if (
          !statefulsetNames.has(resourceName) &&
          deploymentNames.has(resourceName)
        ) {
          resourcesToMove.push({ name: resourceName, data: resourceData });
        }
      }
    );

    // Move resources from statefulset to deployment
    if (resourcesToMove.length > 0) {
      if (!correctedReliance.deployment) {
        correctedReliance.deployment = {};
      }

      resourcesToMove.forEach(({ name, data }) => {
        correctedReliance.deployment[name] = data;
        delete correctedReliance.statefulset[name];
      });

      // Clean up empty statefulset object
      if (Object.keys(correctedReliance.statefulset).length === 0) {
        delete correctedReliance.statefulset;
      }
    }
  }

  // Also correct references in connectFrom and external fields
  Object.entries(correctedReliance).forEach(([, kindResources]) => {
    Object.entries(kindResources as Record<string, unknown>).forEach(
      ([, resourceData]) => {
        const typedResourceData = resourceData as {
          connectFrom: Record<string, string[]>;
          external?: Record<string, Record<string, string[]>>;
        };

        // Correct connectFrom references
        if (typedResourceData.connectFrom?.statefulset) {
          const statefulsetRefs = typedResourceData.connectFrom.statefulset;
          const deploymentRefs: string[] = [];
          const remainingStatefulsetRefs: string[] = [];

          statefulsetRefs.forEach((refName: string) => {
            if (
              !statefulsetNames.has(refName) &&
              deploymentNames.has(refName)
            ) {
              deploymentRefs.push(refName);
            } else {
              remainingStatefulsetRefs.push(refName);
            }
          });

          // Update references
          if (deploymentRefs.length > 0) {
            if (!typedResourceData.connectFrom.deployment) {
              typedResourceData.connectFrom.deployment = [];
            }
            typedResourceData.connectFrom.deployment.push(...deploymentRefs);
          }

          if (remainingStatefulsetRefs.length > 0) {
            typedResourceData.connectFrom.statefulset =
              remainingStatefulsetRefs;
          } else {
            delete typedResourceData.connectFrom.statefulset;
          }
        }

        // Correct external references
        if (typedResourceData.external) {
          Object.entries(typedResourceData.external).forEach(
            ([, namespaceRefs]) => {
              const typedNamespaceRefs = namespaceRefs as Record<
                string,
                string[]
              >;
              if (typedNamespaceRefs.statefulset) {
                const statefulsetRefs = typedNamespaceRefs.statefulset;
                const deploymentRefs: string[] = [];
                const remainingStatefulsetRefs: string[] = [];

                statefulsetRefs.forEach((refName: string) => {
                  if (
                    !statefulsetNames.has(refName) &&
                    deploymentNames.has(refName)
                  ) {
                    deploymentRefs.push(refName);
                  } else {
                    remainingStatefulsetRefs.push(refName);
                  }
                });

                // Update references
                if (deploymentRefs.length > 0) {
                  if (!typedNamespaceRefs.deployment) {
                    typedNamespaceRefs.deployment = [];
                  }
                  typedNamespaceRefs.deployment.push(...deploymentRefs);
                }

                if (remainingStatefulsetRefs.length > 0) {
                  typedNamespaceRefs.statefulset = remainingStatefulsetRefs;
                } else {
                  delete typedNamespaceRefs.statefulset;
                }
              }
            }
          );
        }
      }
    );
  });

  return correctedReliance;
}
