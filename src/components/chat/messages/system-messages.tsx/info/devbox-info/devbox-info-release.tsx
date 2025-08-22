import React from "react";
import { useDevboxRelease } from "@/hooks/sealos/devbox/use-devbox-release";
import { useDevboxDeploy } from "@/hooks/sealos/devbox/use-devbox-deploy";
import {
  DevboxReleaseHeader,
  CreateReleaseForm,
  ReleaseList,
} from "./devbox-info-release/index";

interface DevboxReleaseMessageProps {
  payload: {
    devboxName: string;
  };
}

export const DevboxReleaseMessageCard: React.FC<DevboxReleaseMessageProps> = ({
  payload,
}) => {
  const { devboxName } = payload;

  // Use separate hooks for release and deploy logic
  const {
    releaseConfig,
    openDeletePopovers,
    isReleasePopoverOpen,
    releases,
    isLoading,
    releaseMutation,
    deleteReleaseMutation,
    handleRelease,
    handleDeleteRelease,
    setDeletePopoverOpen,
    setIsReleasePopoverOpen,
    setReleaseConfig,
    resetReleaseConfig,
  } = useDevboxRelease(devboxName);

  const {
    deployConfig,
    openPopovers,
    deployDevbox,
    handleDeploy,
    setPopoverOpen,
    setDeployConfig,
  } = useDevboxDeploy(devboxName);

  const releaseCount = releases?.data?.length || 0;

  return (
    <div className="p-4 bg-node-background border border-border-primary rounded-xl space-y-4">
      <DevboxReleaseHeader
        devboxName={devboxName}
        releaseCount={releaseCount}
        isReleasePopoverOpen={isReleasePopoverOpen}
        setIsReleasePopoverOpen={setIsReleasePopoverOpen}
      >
        <CreateReleaseForm
          devboxName={devboxName}
          releaseConfig={releaseConfig}
          setReleaseConfig={setReleaseConfig}
          onCancel={() => {
            setIsReleasePopoverOpen(false);
            resetReleaseConfig();
          }}
          onSubmit={handleRelease}
          isPending={releaseMutation.isPending}
        />
      </DevboxReleaseHeader>

      <ReleaseList
        releases={releases?.data || []}
        isLoading={isLoading}
        deployConfig={deployConfig}
        setDeployConfig={setDeployConfig}
        openPopovers={openPopovers}
        openDeletePopovers={openDeletePopovers}
        setPopoverOpen={setPopoverOpen}
        setDeletePopoverOpen={setDeletePopoverOpen}
        onDeploy={handleDeploy}
        onDelete={handleDeleteRelease}
        deployMutationPending={deployDevbox.isPending}
        deleteMutationPending={deleteReleaseMutation.isPending}
      />
    </div>
  );
};

export default DevboxReleaseMessageCard;
