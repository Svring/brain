import { useState } from "react";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { getDevboxReleasesOptions } from "@/lib/sealos/resources/devbox/devbox-method/devbox-query";
import { useQuery } from "@tanstack/react-query";
import { useDevboxDeploy } from "@/hooks/sealos/devbox/use-devbox-deploy";
import { useDevboxContext } from "@/lib/auth/auth-utils";

interface ReleaseConfig {
  tag: string;
  releaseDes: string;
}

export const useDevboxRelease = (devboxName: string) => {
  const { devbox } = useTRPCClients();
  const devboxContext = useDevboxContext();

  const [releaseConfig, setReleaseConfig] = useState<ReleaseConfig>({
    tag: "",
    releaseDes: "",
  });
  const [openDeletePopovers, setOpenDeletePopovers] = useState<
    Record<string, boolean>
  >({});
  const [isReleasePopoverOpen, setIsReleasePopoverOpen] = useState(false);

  const releaseMutation = useMutation(devbox.release.mutationOptions());
  const deleteReleaseMutation = useMutation(
    devbox.deleteRelease.mutationOptions()
  );
  const manageDevboxLifecycleMutation = useMutation(
    devbox.manageDevboxLifecycle.mutationOptions()
  );

  // Fetch devbox releases
  const { data: releases, isLoading } = useQuery(
    getDevboxReleasesOptions(devboxContext, devboxName)
  );

  // Use the deploy hook for deploy-related functionality
  const deployHook = useDevboxDeploy(devboxName);

  const handleRelease = async (config: ReleaseConfig) => {
    try {
      await manageDevboxLifecycleMutation.mutateAsync({
        devboxName,
        action: "stop",
      });

      await releaseMutation.mutateAsync({
        devboxName,
        tag: config.tag,
        releaseDes: config.releaseDes,
      });

      await manageDevboxLifecycleMutation.mutateAsync({
        devboxName,
        action: "start",
      });

      setIsReleasePopoverOpen(false);
      setReleaseConfig({ tag: "", releaseDes: "" });
    } catch (error) {
      console.error("Release failed:", error);
      throw error;
    }
  };

  const handleDeleteRelease = async (releaseTag: string) => {
    try {
      const versionName = `${devboxName}-${releaseTag}`;
      await deleteReleaseMutation.mutateAsync(versionName);

      setDeletePopoverOpen(releaseTag, false);
    } catch (error) {
      console.error("Delete failed:", error);
      throw error;
    }
  };

  const setDeletePopoverOpen = (releaseTag: string, open: boolean) => {
    setOpenDeletePopovers((prev) => ({ ...prev, [releaseTag]: open }));
  };

  const resetReleaseConfig = () => {
    setReleaseConfig({ tag: "", releaseDes: "" });
  };

  return {
    // State
    releaseConfig,
    openDeletePopovers,
    isReleasePopoverOpen,

    // Data
    releases,
    isLoading,

    // Mutations
    releaseMutation,
    deleteReleaseMutation,

    // Actions
    handleRelease,
    handleDeleteRelease,
    setDeletePopoverOpen,
    setIsReleasePopoverOpen,
    setReleaseConfig,
    resetReleaseConfig,

    // Deploy functionality from deploy hook
    ...deployHook,
  };
};
