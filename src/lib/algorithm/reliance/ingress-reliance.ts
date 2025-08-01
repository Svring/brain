"use client";

import _ from "lodash";
import type { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import type { ResourceConnections, KindMap, Connection } from "./reliance-utils";
import {
  DEVBOX_RELATE_RESOURCE_LABELS,
  DEPLOYMENT_RELATE_RESOURCE_LABELS,
  STATEFULSET_RELATE_RESOURCE_LABELS,
} from "@/lib/k8s/k8s-constant/k8s-constant-label";

/**
 * Creates connections for Ingress resources based on labels and naming conventions.
 * Checks for specific labels (DEVBOX_MANAGER, APP_DEPLOY_MANAGER) on ingress resources
 * and creates connections to corresponding devbox, deployment, or statefulset resources.
 * Falls back to name-based matching if no relevant labels are found.
 * @param resources A map of all project resources, grouped by kind.
 * @returns A `ConnectionsByKind` map specifically for `ingress` resources.
 */
export const inferRelianceForIngress = (
  resources: Record<string, { items: K8sResource[] }>
): ResourceConnections => {
  const ingressResources = resources.ingress?.items ?? [];
  if (!ingressResources.length) return {};

  // Create a map of all relevant resource kinds to their resource names for quick lookups.
  const resourcesByKind = _.mapValues(
    _.pick(resources, ["deployment", "statefulset", "devbox"]),
    (d) => {
      const names =
        d?.items?.map((i) => i?.metadata?.name).filter(Boolean) ?? [];
      return Array.from(new Set(names));
    }
  );

  const ingressMap: Record<string, Connection> = {};

  ingressResources.forEach((ing) => {
    const name = ing?.metadata?.name;
    if (!name) return;

    const labels = ing?.metadata?.labels || {};
    const connectFrom: KindMap = {};

    // Check for DEVBOX_MANAGER label
    if (labels[DEVBOX_RELATE_RESOURCE_LABELS.DEVBOX_MANAGER]) {
      const devboxName = labels[DEVBOX_RELATE_RESOURCE_LABELS.DEVBOX_MANAGER];
      if (resourcesByKind.devbox?.includes(devboxName)) {
        connectFrom.devbox = [devboxName];
      }
    }

    // Check for APP_DEPLOY_MANAGER label for deployments
    if (labels[DEPLOYMENT_RELATE_RESOURCE_LABELS.APP_DEPLOY_MANAGER]) {
      const deploymentName =
        labels[DEPLOYMENT_RELATE_RESOURCE_LABELS.APP_DEPLOY_MANAGER];
      if (resourcesByKind.deployment?.includes(deploymentName)) {
        connectFrom.deployment = [deploymentName];
      }
    }

    // Check for APP_DEPLOY_MANAGER label for statefulsets
    if (labels[STATEFULSET_RELATE_RESOURCE_LABELS.APP_DEPLOY_MANAGER]) {
      const statefulsetName =
        labels[STATEFULSET_RELATE_RESOURCE_LABELS.APP_DEPLOY_MANAGER];
      if (resourcesByKind.statefulset?.includes(statefulsetName)) {
        connectFrom.statefulset = [statefulsetName];
      }
    }

    // Fallback to name-based matching if no label-based connections were found
    if (_.isEmpty(connectFrom)) {
      const nameBasedConnections = _.pickBy(
        _.mapValues(
          _.pick(resourcesByKind, ["deployment", "statefulset"]),
          (names) => (names.includes(name) ? [name] : [])
        ),
        (v) => v.length > 0
      ) as KindMap;
      Object.assign(connectFrom, nameBasedConnections);
    }

    ingressMap[name] = { connectFrom };
  });

  return { ingress: ingressMap };
};
