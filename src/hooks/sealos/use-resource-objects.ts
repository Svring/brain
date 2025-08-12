import { useEffect, useState } from "react";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { getCluster } from "@/lib/sealos/resources/cluster/cluster-method/cluster-query";
import { getDevbox } from "@/lib/sealos/resources/devbox/devbox-method/devbox-query";
import { getDeployment } from "@/lib/sealos/resources/deployment/deployment-method/deployment-query";
import { getStatefulSet } from "@/lib/sealos/resources/statefulset/statefulset-method/statefulset-query";
import { getObjectStorage } from "@/lib/sealos/resources/objectstorage/objectstorage-method/objectstorage-query";

export default function useResourceObjects(
  resources: (CustomResourceTarget | BuiltinResourceTarget)[]
) {
  const context = createK8sContext();
  const [fetchedObjects, setFetchedObjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Filter and fetch all resource types
  useEffect(() => {
    if (!context.kubeconfig || !context.namespace || resources.length === 0)
      return;

    const fetchAllResources = async () => {
      setIsLoading(true);
      const objects: any[] = [];

      // Filter and fetch clusters
      const clusterTargets = resources.filter(
        (resource): resource is CustomResourceTarget =>
          resource.type === "custom" && resource.resourceType === "cluster"
      );

      // Filter and fetch devboxes
      const devboxTargets = resources.filter(
        (resource): resource is CustomResourceTarget =>
          resource.type === "custom" && resource.resourceType === "devbox"
      );

      // Filter and fetch deployments
      const deploymentTargets = resources.filter(
        (resource): resource is BuiltinResourceTarget =>
          resource.type === "builtin" && resource.resourceType === "deployment"
      );

      // Filter and fetch statefulsets
      const statefulsetTargets = resources.filter(
        (resource): resource is BuiltinResourceTarget =>
          resource.type === "builtin" && resource.resourceType === "statefulset"
      );

      // Filter and fetch object storage buckets
      const objectStorageTargets = resources.filter(
        (resource): resource is CustomResourceTarget =>
          resource.type === "custom" &&
          resource.resourceType === "objectstoragebucket"
      );

      // Fetch all resources
      const clusterPromises = clusterTargets.map(async (target) =>
        getCluster(context, target)
      );

      const devboxPromises = devboxTargets.map(async (target) =>
        getDevbox(context, target)
      );

      const deploymentPromises = deploymentTargets.map(async (target) =>
        getDeployment(context, target)
      );

      const statefulsetPromises = statefulsetTargets.map(async (target) =>
        getStatefulSet(context, target)
      );

      const objectStoragePromises = objectStorageTargets.map(async (target) =>
        getObjectStorage(context, target)
      );

      const allResults = await Promise.all([
        ...clusterPromises,
        ...devboxPromises,
        ...deploymentPromises,
        ...statefulsetPromises,
        ...objectStoragePromises,
      ]);

      setFetchedObjects(allResults);
      setIsLoading(false);
    };

    fetchAllResources();
  }, [resources, context.kubeconfig, context.namespace]);

  return {
    resourceObjects: fetchedObjects,
    isLoading,
    error,
  };
}
