import { useState } from "react";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { BuiltinResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useProjectState } from "@/contexts/project/project-context";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";

export const useDevboxDeploy = (devboxName: string) => {
  const { selectedProject } = useProjectState();
  const { devbox, project } = useTRPCClients();

  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});

  const deployDevbox = useMutation(devbox.deploy.mutationOptions());
  const addToProject = useMutation(project.addResources.mutationOptions());

  const handleDeploy = async (releaseTag: string) => {
    try {
      const deployResult = await deployDevbox.mutateAsync({
        devboxName,
        tag: releaseTag,
      });

      const target = BuiltinResourceTargetSchema.parse(
        convertResourceTypeToTarget("deployment", deployResult.data.appName)
      );

      if (selectedProject) {
        await addToProject.mutateAsync({
          resources: [target],
          name: selectedProject,
        });
      }

      setOpenPopovers((prev) => ({ ...prev, [releaseTag]: false }));
    } catch (error) {
      console.error("Deploy failed:", error);
      throw error;
    }
  };

  const setPopoverOpen = (releaseTag: string, open: boolean) => {
    setOpenPopovers((prev) => ({ ...prev, [releaseTag]: open }));
  };

  return {
    // State
    openPopovers,

    // Mutations
    deployDevbox,
    addToProject,

    // Actions
    handleDeploy,
    setPopoverOpen,
  };
};
