"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Code,
  Database,
  CircleCheckBigIcon,
  Rocket,
  Server,
  Hammer,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ProjectProposalCard } from "@/components/chat/state-cards/project-proposal/project-proposal-card";
import type { ProjectProposal } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { useProjectCreate } from "@/hooks/brain/use-project-create";
import { useHomeChat } from "@/components/provider/home-chat-provider";
import { useThreads } from "@/components/provider/thread-provider";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/contexts/auth/auth-context";
import { v4 as uuidv4 } from "uuid";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQuery } from "@tanstack/react-query";
import type { DevboxRuntime } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-runtimes";
import { nanoid } from "@/lib/utils";
import { z } from "zod";
import { DEVBOX_RUNTIMES } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-runtimes";
import { CLUSTER_TYPES } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-types";
import { deriveClusterEnvVariable } from "@/lib/sealos/services/env/cluster/cluster-env-utils";

// Zod schemas for DevenvDeploymentCard args
export const DeployDevBoxSchema = z.object({
  name: z.string().min(1, "DevBox name is required"),
  runtime: z.enum(DEVBOX_RUNTIMES),
  ports: z.array(z.number().int().min(1).max(65535)).optional(),
  reliance: z.array(z.string()).optional(),
});

export const DeployDatabaseSchema = z.object({
  name: z.string().min(1, "Database name is required"),
  type: z.enum([...CLUSTER_TYPES] as [string, ...string[]]),
});

export const DevenvDeploymentArgsSchema = z.object({
  project_name: z.string().min(1, "Project name is required"),
  devbox: z.array(DeployDevBoxSchema).optional(),
  database: z.array(DeployDatabaseSchema).optional(),
});

export type DeployDevBox = z.infer<typeof DeployDevBoxSchema>;
export type DeployDatabase = z.infer<typeof DeployDatabaseSchema>;
export type DevenvDeploymentArgs = z.infer<typeof DevenvDeploymentArgsSchema>;

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

interface ProposeDevenvDeploymentMessageProps {
  args: DevenvDeploymentArgs;
  result?: any;
  onSuccess?: (data: any) => void;
}

const DevenvDeploymentSuccessMessage = ({
  args,
}: {
  args: DevenvDeploymentArgs;
}) => {
  const hasDevbox = args.devbox && args.devbox.length > 0;
  const hasDatabase = args.database && args.database.length > 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-center p-2 border rounded-lg bg-background-secondary">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">
            Development environment deployed successfully
            {hasDevbox && ` (${args.devbox?.[0]?.name})`}
            {hasDatabase && ` with ${args.database?.[0]?.name} database`}
          </p>
        </div>
      </div>
    </div>
  );
};

const DevenvDeploymentCard = ({
  args,
  onSuccess,
}: {
  args: DevenvDeploymentArgs;
  onSuccess?: (data: any) => void;
}) => {
  const { createProject, isCreating } = useProjectCreate();
  const { threadId, messages } = useHomeChat();
  const { patchThread, updateThreadState } = useThreads();
  const { openProjectChat } = useChatActions();
  const router = useRouter();
  const { auth } = useAuthState();
  const { devbox } = useTRPCClients();

  // Fetch devbox templates
  const { data: templates, isLoading: isLoadingTemplates } = useQuery(
    devbox.templates.queryOptions()
  );

  // Process args with nanoid once and memoize the result
  const processedArgs = useMemo(() => {
    // First, process databases and create a mapping for reliance name updates
    const processedDatabases =
      args.database?.map((db) => {
        const newName = `${db.name}-${nanoid()}`;
        return {
          originalName: db.name,
          newName,
          type: db.type as any,
        };
      }) || [];

    // Create a mapping from original database names to new names
    const databaseNameMap = new Map(
      processedDatabases.map((db) => [db.originalName, db.newName])
    );

    const processedDevboxes =
      args.devbox?.map((devbox) => {
        // Update reliance names to match new database names
        const updatedReliances =
          devbox.reliance?.map((relianceName) => {
            return databaseNameMap.get(relianceName) || relianceName;
          }) || [];

        return {
          ...devbox,
          name: `${devbox.name}-${nanoid()}`,
          reliance: updatedReliances,
        };
      }) || [];

    return {
      processedDevboxes,
      processedDatabases: processedDatabases.map((db) => ({
        name: db.newName,
        type: db.type,
      })),
      databaseNameMap,
    };
  }, [args.devbox, args.database]);

  // Create initial proposal using memoized processed args
  const initialProposal = useMemo(() => {
    const { processedDevboxes, processedDatabases } = processedArgs;

    const devboxes = processedDevboxes.map((devbox) => {
      // Generate env variables from updated reliances
      const envVars =
        devbox.reliance?.flatMap((relianceName) =>
          deriveClusterEnvVariable(relianceName)
        ) || [];

      return {
        name: devbox.name,
        runtime: devbox.runtime as any,
        ports: (devbox.ports || []).map((port: number) => ({
          number: port,
          publicAccess: true,
        })),
        env: envVars.map((envVar) => {
          if (envVar.valueFrom?.secretKeyRef) {
            return {
              name: envVar.name,
              valueFrom: {
                secretKeyRef: {
                  name: envVar.valueFrom.secretKeyRef.name,
                  key: envVar.valueFrom.secretKeyRef.key,
                },
              },
            };
          } else {
            return {
              name: envVar.name,
              value: envVar.value || "",
            };
          }
        }),
      };
    });

    const databases = processedDatabases;

    return {
      name: `${args.project_name}-${nanoid()}`,
      resources: {
        devbox: devboxes,
        database: databases,
      },
    };
  }, [processedArgs]);

  const [internalProposal, setInternalProposal] =
    useState<ProjectProposal>(initialProposal);

  // Update internal proposal when initial proposal changes
  useEffect(() => {
    setInternalProposal(initialProposal);
  }, [initialProposal]);

  // Update proposal with template-based ports when templates are loaded
  useEffect(() => {
    if (
      templates &&
      Array.isArray(templates) &&
      args.devbox &&
      args.devbox.length > 0 &&
      !isLoadingTemplates
    ) {
      const { processedDevboxes } = processedArgs;

      const updatedDevboxes = processedDevboxes.map((devbox: DeployDevBox) => {
        const devboxRuntime = devbox.runtime;
        const template = templates.find(
          (t: DevboxTemplate) => t.runtime === devboxRuntime
        );

        // Generate env variables from updated reliances
        const envVars =
          devbox.reliance?.flatMap((relianceName) =>
            deriveClusterEnvVariable(relianceName)
          ) || [];

        if (template && template.config.appPorts) {
          const templatePorts = template.config.appPorts.map(
            (appPort: { port: number }) => ({
              number: appPort.port,
              publicAccess: true,
            })
          );

          return {
            name: devbox.name,
            runtime: devbox.runtime as any,
            ports: templatePorts,
            env: envVars.map((envVar) => {
              if (envVar.valueFrom?.secretKeyRef) {
                return {
                  name: envVar.name,
                  valueFrom: {
                    secretKeyRef: {
                      name: envVar.valueFrom.secretKeyRef.name,
                      key: envVar.valueFrom.secretKeyRef.key,
                    },
                  },
                };
              } else {
                return {
                  name: envVar.name,
                  value: envVar.value || "",
                };
              }
            }),
          };
        } else {
          // Fallback to original ports if no template found
          return {
            name: devbox.name,
            runtime: devbox.runtime as any,
            ports: (devbox.ports || []).map((port: number) => ({
              number: port,
              publicAccess: true,
            })),
            env: envVars.map((envVar) => {
              if (envVar.valueFrom?.secretKeyRef) {
                return {
                  name: envVar.name,
                  valueFrom: {
                    secretKeyRef: {
                      name: envVar.valueFrom.secretKeyRef.name,
                      key: envVar.valueFrom.secretKeyRef.key,
                    },
                  },
                };
              } else {
                return {
                  name: envVar.name,
                  value: envVar.value || "",
                };
              }
            }),
          };
        }
      });

      setInternalProposal((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          devbox: updatedDevboxes,
        },
      }));
    }
  }, [templates, processedArgs, isLoadingTemplates]);

  const handleDeploy = async () => {
    try {
      // console.log("internalProposal", internalProposal);
      // Create the project
      const projectName = await createProject(internalProposal);

      // Update thread metadata with deployment information
      if (threadId) {
        await patchThread.mutate({
          threadId,
          metadata: {
            kubeconfig: auth?.kubeconfig,
            projectName: projectName,
            resourceTarget: null,
          },
        });

        // Update tool messages with result field
        if (messages && messages.length > 0) {
          // Find all tool messages with the specified names
          const toolMessageNames = [
            "propose_image_deployment",
            "propose_devenv_deployment",
            "propose_template_deployment",
          ];

          // Create a copy of messages to modify
          const updatedMessages = messages.map((message: any) => {
            if (
              message.type === "tool" &&
              toolMessageNames.includes(message.name)
            ) {
              return {
                ...message,
                additional_kwargs: {
                  ...message.additional_kwargs,
                  result: "project proposal skipped",
                },
              };
            }
            return message;
          });

          // Find the last occurrence of these tool messages and mark it as successful
          let lastToolMessageIndex = -1;
          for (let i = updatedMessages.length - 1; i >= 0; i--) {
            const message = updatedMessages[i];
            if (
              message.type === "tool" &&
              toolMessageNames.includes(message.name)
            ) {
              lastToolMessageIndex = i;
              break;
            }
          }

          // Update the last tool message with success result
          if (lastToolMessageIndex !== -1) {
            updatedMessages[lastToolMessageIndex] = {
              ...updatedMessages[lastToolMessageIndex],
              additional_kwargs: {
                ...updatedMessages[lastToolMessageIndex].additional_kwargs,
                result: "project created successfully",
              },
            };
          }

          // Add success system message to updatedMessages
          const successMessage = {
            id: uuidv4(),
            type: "system" as const,
            content: JSON.stringify({
              type: "universal.event",
              target: null,
              payload: {
                message: "project created successfully.",
                instruction:
                  "The project has been successfully created and deployed. Encourage the user to explore their new project—suggest they check the project details, review resource status, monitor performance, or make further configurations. Invite them to ask for help with any aspect of their project or additional setup.",
                createdAt: new Date().toISOString(),
              },
            }),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Add success message to the updated messages array
          updatedMessages.push(successMessage);

          // Add AI message
          const aiMessage = {
            id: uuidv4(),
            type: "ai" as const,
            content:
              "Project is successfully deployed and all resources will launch automatically, it may take some time before all public domains are accessible.",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Add AI message to the updated messages array
          updatedMessages.push(aiMessage);

          // Add preview system message
          const previewMessage = {
            id: uuidv4(),
            type: "system" as const,
            content: JSON.stringify({
              type: "universal.preview",
              target: null,
              payload: null,
            }),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Add preview message to the updated messages array
          updatedMessages.push(previewMessage);

          // Update thread state with modified messages
          await updateThreadState.mutate({
            threadId,
            values: {
              messages: updatedMessages,
            },
            asNode: "entry_node",
          });
        }
      }

      // Open project chat
      openProjectChat(projectName as string);

      // Navigate to the created project
      router.push(`/projects/${projectName}`);

      onSuccess?.(projectName);
    } catch (error) {
      console.error("Failed to deploy development environment:", error);
    }
  };

  return (
    <div className="w-full border p-2 rounded-xl">
      {/* Header with icon and text */}
      <div className="flex items-center mb-3">
        <div className="flex text-sm text-muted-foreground">
          {/* <Hammer size={20} className="mr-2" /> */}
          <span>Deploy development environment</span>
        </div>
      </div>

      <ProjectProposalCard
        proposal={internalProposal}
        onProposalUpdate={setInternalProposal}
      />

      <div className="pt-2">
        <Button
          onClick={handleDeploy}
          disabled={isCreating}
          className="w-full"
          // variant={"outline"}
        >
          {isCreating ? (
            <>
              <Spinner variant="circle" size={16} className="mr-2" />
              Deploying...
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4 mr-2" />
              Deploy
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export const ProposeDevenvDeploymentMessage: React.FC<
  ProposeDevenvDeploymentMessageProps
> = ({ args, result, onSuccess }) => {
  // Check result first and return success state if it exists
  if (result) {
    return <DevenvDeploymentSuccessMessage args={args} />;
  }

  // Return the card component with args and logic
  return <DevenvDeploymentCard args={args} onSuccess={onSuccess} />;
};
