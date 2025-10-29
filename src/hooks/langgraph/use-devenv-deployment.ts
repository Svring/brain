import { useCallback, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useHomeChat } from "@/components/provider/home-chat-provider";
import { useThreads } from "@/components/provider/thread-provider";
import { useProjectCreate } from "@/hooks/brain/use-project-create";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useResourceQuotaChecker } from "@/lib/validation/resource-quota-checker";
import type { ProjectProposal } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { deriveClusterEnvVariable } from "@/lib/sealos/services/env/cluster/cluster-env-utils";
import {
  finalizeDeploymentFlow,
  computeResourceTotalsFromProposal,
} from "@/lib/langgraph/langgraph-method/langgraph-utils";
import type { DevenvDeploymentArgs } from "@/components/copilot/langgraph/propose-devenv-deployment-message";

interface DevboxTemplate {
  runtime: string;
  config: {
    appPorts: Array<{
      name: string;
      port: number;
      protocol: string;
    }>;
    ports: Array<{
      containerPort: number;
      name: string;
      protocol: string;
    }>;
    releaseArgs: string[];
    releaseCommand: string[];
    user: string;
    workingDir: string;
  };
}

interface UseDevenvDeploymentProps {
  args: DevenvDeploymentArgs;
  onSuccess?: (projectName: any) => void;
}

export const useDevenvDeployment = ({
  args,
  onSuccess,
}: UseDevenvDeploymentProps) => {
  const router = useRouter();
  const { auth } = useAuthState();
  const { openProjectChat } = useChatActions();
  const { submit, threadId, messages } = useHomeChat();
  const { patchThread, updateThreadState } = useThreads();
  const { createProject, isCreating } = useProjectCreate();
  const { checkAndShowQuotaError } = useResourceQuotaChecker();
  const { devbox } = useTRPCClients();

  // Fetch devbox templates
  const { data: templates } = useQuery(devbox.templates.queryOptions());

  const [internalProposal, setInternalProposal] = useState<ProjectProposal>(() => {
    // Create initial proposal from args
    const projectName = args.project_name;
    
    return {
      name: projectName,
      resources: {
        devbox: args.devbox?.map(devbox => {
          // Find template for this runtime to get default ports
          const template = templates?.find(
            (t: DevboxTemplate) => t.runtime === devbox.runtime
          );

          // Use template ports if available, otherwise use provided ports or empty array
          let ports = devbox.ports?.map(port => ({
            number: port,
            publicAccess: true,
          })) || [];

          // If no ports provided but template has appPorts, use template ports
          if ((!devbox.ports || devbox.ports.length === 0) && template?.config.appPorts) {
            ports = template.config.appPorts.map(appPort => ({
              number: appPort.port,
              publicAccess: true,
            }));
          }

          return {
            name: devbox.name,
            runtime: devbox.runtime,
            ports,
          };
        }) || [],
        database: args.database?.map(db => ({
          name: db.name,
          type: db.type,
        })) || [],
      },
    };
  });

  // Update proposal when templates load and we have devboxes without ports
  useEffect(() => {
    if (templates && Array.isArray(templates) && args.devbox) {
      const needsUpdate = args.devbox.some(devbox => 
        (!devbox.ports || devbox.ports.length === 0) &&
        templates.find((t: DevboxTemplate) => t.runtime === devbox.runtime)?.config.appPorts
      );

      if (needsUpdate) {
        setInternalProposal(prev => ({
          ...prev,
          resources: {
            ...prev.resources,
            devbox: args.devbox?.map(devbox => {
              const template = templates.find(
                (t: DevboxTemplate) => t.runtime === devbox.runtime
              );

              let ports = devbox.ports?.map(port => ({
                number: port,
                publicAccess: true,
              })) || [];

              // If no ports provided but template has appPorts, use template ports
              if ((!devbox.ports || devbox.ports.length === 0) && template?.config.appPorts) {
                ports = template.config.appPorts.map(appPort => ({
                  number: appPort.port,
                  publicAccess: true,
                }));
              }

              return {
                name: devbox.name,
                runtime: devbox.runtime,
                ports,
              };
            }) || [],
          },
        }));
      }
    }
  }, [templates, args.devbox]);

  const deployDevenv = useCallback(async () => {
    try {
      if (!threadId) {
        console.error("Thread ID is required for deployment");
        return;
      }

      // Calculate project total resources and check quota
      const totals = computeResourceTotalsFromProposal(internalProposal);
      const quotaCheckPassed = checkAndShowQuotaError({
        cpu: totals.cpu,
        memory: totals.memory,
        storage: totals.storage,
        ports: totals.ports,
      });

      if (!quotaCheckPassed) {
        return;
      }

      // Create the project
      const projectName = await createProject(internalProposal);

      await finalizeDeploymentFlow({
        threadId,
        kubeconfig: auth?.kubeconfig,
        projectName: projectName as string,
        messages,
        patchThreadMutate: patchThread.mutate,
        updateThreadStateMutate: updateThreadState.mutate,
        openProjectChat,
        routerPush: router.push,
        instruction:
          "The project has been successfully created and deployed. Encourage the user to explore their new project—suggest they check the project details, review resource status, monitor performance, or make further configurations. Invite them to ask for help with any aspect of their project or additional setup.",
      });

      onSuccess?.(projectName);
    } catch (error) {
      console.error("Failed to deploy development environment:", error);
      throw error;
    }
  }, [
    internalProposal,
    threadId,
    messages,
    auth?.kubeconfig,
    createProject,
    checkAndShowQuotaError,
    patchThread.mutate,
    updateThreadState.mutate,
    openProjectChat,
    router.push,
    onSuccess,
  ]);

  return {
    internalProposal,
    setInternalProposal,
    deployDevenv,
    isCreating,
  };
};