import { queryOptions } from "@tanstack/react-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import {
  CustomResourceTarget,
  CustomResourceTargetSchema,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getDevboxObject } from "@/lib/algorithm/bridge/bridge-resources/devbox/devbox-bridge-query";
import { listCustomResources } from "@/lib/k8s/k8s-api/k8s-api-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  convertResourceTypeToTarget,
  convertResourceToTarget,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { buildQueryKey } from "@/lib/k8s/k8s-constant/k8s-constant-query-key";
import { getSshConnectionInfo } from "@/lib/sealos/devbox/devbox-api/devbox-old-api";
import { DevboxApiContext } from "../devbox-api/devbox-open-api-schemas";

export const getDevbox = async (
  context: K8sApiContext,
  target: CustomResourceTarget
) => {
  // Test the new composeObjectFromTarget function
  const devboxObject = await getDevboxObject(context, target);
  return devboxObject;
};

export const listDevbox = async (context: K8sApiContext) => {
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("devbox")
  );
  const devboxResourceList = await runParallelAction(
    listCustomResources(context, target)
  );
  const devboxTargetList = devboxResourceList.items.map((item) =>
    CustomResourceTargetSchema.parse(convertResourceToTarget(item))
  );
  return devboxTargetList.map(
    async (target) => await getDevbox(context, target)
  );
};

export const getDevboxSshInfo = async (
  context: DevboxApiContext,
  target: CustomResourceTarget
) => {
  const sshInfo = await runParallelAction(
    getSshConnectionInfo(context, target.name!)
  );
  return sshInfo.data.token;
};

// ============================================================================
// OPTIONS FUNCTIONS (React Query wrappers)
// ============================================================================

/**
 * Query options for getting a devbox by target
 */
export const getDevboxOptions = (
  context: K8sApiContext,
  target: CustomResourceTarget
) =>
  queryOptions({
    queryKey: buildQueryKey.getDevbox(context.namespace, target.name!),
    queryFn: async () => await getDevbox(context, target),
    enabled:
      !!target.group &&
      !!target.version &&
      !!context.namespace &&
      !!target.plural &&
      !!target.name &&
      !!context.kubeconfig,
  });

/**
 * Query options for listing devboxes
 */
export const listDevboxOptions = (context: K8sApiContext) =>
  queryOptions({
    queryKey: buildQueryKey.listDevboxes(context.namespace),
    queryFn: async () => await listDevbox(context),
    enabled: !!context.namespace && !!context.kubeconfig,
    staleTime: 1000 * 30,
  });
