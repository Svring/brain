"use client";

import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseNode from "../base-node-wrapper";
import { useQuery } from "@tanstack/react-query";
import { getDevboxReleasesOptions } from "@/lib/sealos/devbox/devbox-method/devbox-query";
import {
  useDeployDevboxMutation,
  useReleaseDevboxMutation,
  useDeleteDevboxReleaseMutation,
} from "@/lib/sealos/devbox/devbox-method/devbox-mutation";
import { createDevboxContext } from "@/lib/auth/auth-utils";
import DevboxNodeReleaseTitle from "./devbox-node-release-title";
import DevboxNodeReleaseList from "./devbox-node-release-list";

interface DevboxNodeReleaseProps {
  target: CustomResourceTarget;
  nodeData: any;
}

export default function DevboxNodeRelease({
  target,
  nodeData,
}: DevboxNodeReleaseProps) {
  const devboxContext = createDevboxContext();
  const devboxName = target.name || "";

  const { data: releases, isLoading } = useQuery(
    getDevboxReleasesOptions(devboxContext, devboxName)
  );

  const deployMutation = useDeployDevboxMutation(devboxContext);
  const releaseMutation = useReleaseDevboxMutation(devboxContext);
  const deleteReleaseMutation = useDeleteDevboxReleaseMutation(devboxContext);

  const handleDeploy = async (
    releaseTag: string,
    config: { cpu: number; memory: number }
  ) => {
    await deployMutation.mutateAsync({
      devboxName,
      tag: releaseTag,
      cpu: config.cpu,
      memory: config.memory,
    });
  };

  const handleRelease = async (config: { tag: string; releaseDes: string }) => {
    await releaseMutation.mutateAsync({
      devboxName,
      tag: config.tag,
      releaseDes: config.releaseDes,
    });
  };

  const handleDeleteRelease = async (releaseTag: string) => {
    const versionName = `${devboxName}-${releaseTag}`;
    await deleteReleaseMutation.mutateAsync(versionName);
  };

  return (
    <BaseNode target={target} nodeData={{}}>
      <div className="flex h-full flex-col gap-3 p-1">
        <DevboxNodeReleaseTitle
          releasesCount={releases?.data?.length || 0}
          devboxName={devboxName}
          onRelease={handleRelease}
          isReleasing={releaseMutation.isPending}
        />
        <DevboxNodeReleaseList
          releases={releases?.data}
          isLoading={isLoading}
          onDeploy={handleDeploy}
          isDeploying={deployMutation.isPending}
          onDelete={handleDeleteRelease}
          isDeleting={deleteReleaseMutation.isPending}
        />
      </div>
    </BaseNode>
  );
}
