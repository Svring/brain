import { useState } from "react";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { createDevboxContext } from "@/lib/auth/auth-utils";
import { useDeployDevboxMutation } from "@/lib/sealos/resources/devbox/devbox-method/devbox-mutation";
import { useAddToProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { BuiltinResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useProjectState } from "@/contexts/project/project-context";

interface DeployConfig {
  cpu: number;
  memory: number;
}

export const useDevboxDeploy = (devboxName: string) => {
  const devboxContext = createDevboxContext();
  const k8sContext = createK8sContext();
  const { selectedProject } = useProjectState();

  const [deployConfig, setDeployConfig] = useState<DeployConfig>({
    cpu: 2000,
    memory: 4096,
  });
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});

  const deployMutation = useDeployDevboxMutation(devboxContext);
  const addToProjectMutation = useAddToProjectMutation(k8sContext);

  const handleDeploy = async (releaseTag: string, config: DeployConfig) => {
    try {
      const deployResult = await deployMutation.mutateAsync({
        devboxName,
        tag: releaseTag,
        cpu: config.cpu,
        memory: config.memory,
      });

      const target = BuiltinResourceTargetSchema.parse(
        convertResourceTypeToTarget("deployment", deployResult.data.appName)
      );

      if (selectedProject) {
        await addToProjectMutation.mutateAsync({
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
    deployConfig,
    openPopovers,

    // Mutations
    deployMutation,

    // Actions
    handleDeploy,
    setPopoverOpen,
    setDeployConfig,
  };
};
