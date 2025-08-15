import { queryOptions } from "@tanstack/react-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import {
  CustomResourceTarget,
  CustomResourceTargetSchema,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getDevboxObject } from "@/lib/sealos/resources/devbox/devbox-method/devbox-bridge";
import { listCustomResources } from "@/lib/k8s/k8s-api/k8s-api-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  convertResourceTypeToTarget,
  convertResourceToTarget,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { getSshConnectionInfo } from "@/lib/sealos/resources/devbox/devbox-api/devbox-old-api";
import { DevboxApiContext } from "../devbox-api/devbox-open-api-schemas";
import { getDevboxReleases } from "../devbox-api/devbox-open-api";
import { convertDevboxListToSimplified } from "./devbox-utils";
import { listFolderFiles } from "../devbox-api/devbox-ssh-api";
import type { DevboxSsh } from "../devbox-schemas/devbox-object-schema";

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
  return convertDevboxListToSimplified(devboxResourceList.items);
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

export const getDevboxReleasesQuery = async (
  context: DevboxApiContext,
  devboxName: string
) => {
  const releases = await runParallelAction(
    getDevboxReleases(devboxName, context)
  );
  return releases;
};

export const listDevboxFolderFilesQuery = async (
  sshConfig: DevboxSsh,
  relativePath: string = ""
) => {
  return await listFolderFiles(sshConfig, relativePath);
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
    queryKey: ["devbox", target.name],
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
    queryKey: ["devboxes"],
    queryFn: async () => await listDevbox(context),
    enabled: !!context.namespace && !!context.kubeconfig,
    staleTime: 1000 * 30,
  });

/**
 * Query options for getting devbox releases
 */
export const getDevboxReleasesOptions = (
  context: DevboxApiContext,
  devboxName: string
) =>
  queryOptions({
    queryKey: ["devbox", "release", devboxName],
    queryFn: async () => await getDevboxReleasesQuery(context, devboxName),
    enabled: !!devboxName && !!context.baseURL,
    staleTime: 1000 * 60,
  });

/**
 * Query options for listing devbox folder files
 */
export const listDevboxFolderFilesOptions = (
  sshConfig: DevboxSsh,
  relativePath: string = ""
) =>
  queryOptions({
    queryKey: [
      "devbox",
      "files",
      sshConfig.host,
      sshConfig.workingDir,
      relativePath,
    ],
    queryFn: async () =>
      await listDevboxFolderFilesQuery(sshConfig, relativePath),
    enabled: !!sshConfig.host && !!sshConfig.workingDir,
    staleTime: 1000 * 30, // 30 seconds
  });
