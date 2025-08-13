"use client";

import BaseNode from "../../base-node-wrapper";
import { useQuery } from "@tanstack/react-query";
import { getDevboxReleasesOptions } from "@/lib/sealos/resources/devbox/devbox-method/devbox-query";
import {
  useDeployDevboxMutation,
  useReleaseDevboxMutation,
  useDeleteDevboxReleaseMutation,
} from "@/lib/sealos/resources/devbox/devbox-method/devbox-mutation";
import { useAddToProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { createDevboxContext } from "@/lib/auth/auth-utils";
import DevboxNodeReleaseTitle from "./devbox-node-release-title";
import DevboxNodeReleaseList from "./devbox-node-release-list";
import { useState } from "react";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { BuiltinResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useProjectState } from "@/contexts/project/project-context";

interface DevboxNodeReleaseProps {
  object: DevboxObject;
}

export default function DevboxNodeRelease({ object }: DevboxNodeReleaseProps) {
  const devboxContext = createDevboxContext();
  const k8sContext = createK8sContext();
  const { selectedProject } = useProjectState();

  const devboxName = object.name || "";
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: releases, isLoading } = useQuery(
    getDevboxReleasesOptions(devboxContext, devboxName)
  );

  const deployMutation = useDeployDevboxMutation(devboxContext);
  const releaseMutation = useReleaseDevboxMutation(devboxContext);
  const deleteReleaseMutation = useDeleteDevboxReleaseMutation(devboxContext);
  const addToProjectMutation = useAddToProjectMutation(k8sContext);

  const handleDeploy = async (
    releaseTag: string,
    config: { cpu: number; memory: number }
  ) => {
    const deployResult = await deployMutation.mutateAsync({
      devboxName,
      tag: releaseTag,
      cpu: config.cpu,
      memory: config.memory,
    });
    console.log("deployResult", deployResult);
    const target = BuiltinResourceTargetSchema.parse(
      convertResourceTypeToTarget("deployment", deployResult.data.appName)
    );
    console.log("target", target);
    const result = await addToProjectMutation.mutateAsync({
      resources: [target],
      name: selectedProject!,
    });
    console.log("result", result);
  };

  const handleRelease = async (config: { tag: string; releaseDes: string }) => {
    await releaseMutation.mutateAsync({
      devboxName,
      tag: config.tag,
      releaseDes: config.releaseDes,
    });
  };

  const handleDeleteRelease = async (releaseTag: string) => {
    try {
      console.log("Attempting to delete release:", { devboxName, releaseTag });
      const versionName = `${devboxName}-${releaseTag}`;
      console.log("Delete versionName:", versionName);
      await deleteReleaseMutation.mutateAsync(versionName);
      console.log("Delete successful");
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <BaseNode nodeData={{}} expand={isExpanded}>
      <div className="flex h-full flex-col gap-3 p-1">
        <DevboxNodeReleaseTitle
          releasesCount={releases?.data?.length || 0}
          devboxName={devboxName}
          onRelease={handleRelease}
          isReleasing={releaseMutation.isPending}
          onToggleExpand={handleToggleExpand}
          isExpanded={isExpanded}
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
