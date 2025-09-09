import { useState } from "react";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation, useQuery } from "@tanstack/react-query";
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
  const startDevboxMutation = useMutation(devbox.start.mutationOptions());
  const shutdownDevboxMutation = useMutation(devbox.shutdown.mutationOptions());

  // Fetch devbox releases
  const { data: releases, isLoading } = useQuery(
    devbox.releases.queryOptions(devboxName)
  );

  // Use the deploy hook for deploy-related functionality
  const deployHook = useDevboxDeploy(devboxName);

  const handleRelease = async (config: ReleaseConfig) => {
    try {
      // Stop the devbox before releasing
      await shutdownDevboxMutation.mutateAsync(devboxName);

      // Create the release
      await releaseMutation.mutateAsync({
        devboxName,
        tag: config.tag,
        releaseDes: config.releaseDes,
      });

      // Start the devbox after releasing
      await startDevboxMutation.mutateAsync(devboxName);

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
    startDevboxMutation,
    shutdownDevboxMutation,

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
