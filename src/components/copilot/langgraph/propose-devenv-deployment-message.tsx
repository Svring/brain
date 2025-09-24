"use client";

import React, { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";
import { useAuthState } from "@/contexts/auth/auth-context";
import { v4 as uuidv4 } from "uuid";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQuery } from "@tanstack/react-query";

interface DeployDevBox {
  name: string;
  runtime: string;
  ports?: number[];
}

interface DeployDatabase {
  name: string;
  type: string;
}

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
  args: {
    devbox?: DeployDevBox;
    database?: DeployDatabase;
  };
  result?: any;
  onSuccess?: (data: any) => void;
}

const DevenvDeploymentSuccessMessage = ({ args }: { args: any }) => {
  const hasDevbox = args.devbox;
  const hasDatabase = args.database;

  return (
    <div className="w-full">
      <div className="flex items-center justify-center p-2 border rounded-lg bg-background-secondary">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">
            Development environment deployed successfully
            {hasDevbox && ` (${args.devbox.name})`}
            {hasDatabase && ` with ${args.database.name} database`}
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
  args: any;
  onSuccess?: (data: any) => void;
}) => {
  const { createProject, isCreating } = useProjectCreate();
  const { submit, threadId, messages } = useHomeChat();
  const { patchThread, updateThreadState } = useThreads();
  const router = useRouter();
  const { auth } = useAuthState();
  const { devbox } = useTRPCClients();

  // Fetch devbox templates
  const { data: templates, isLoading: isLoadingTemplates } = useQuery(
    devbox.templates.queryOptions()
  );

  const [internalProposal, setInternalProposal] = useState<ProjectProposal>(
    () => {
      // Create initial proposal from args
      return {
        name: "Dev",
        resources: {
          devbox: args.devbox
            ? Array.isArray(args.devbox)
              ? args.devbox.map((devbox: any) => ({
                  name: devbox.name,
                  runtime: devbox.runtime as any,
                  ports: (devbox.ports || []).map((port: number) => ({
                    number: port,
                    publicAccess: true,
                  })),
                }))
              : [
                  {
                    name: args.devbox.name,
                    runtime: args.devbox.runtime as any,
                    ports: (args.devbox.ports || []).map((port: number) => ({
                      number: port,
                      publicAccess: true,
                    })),
                  },
                ]
            : [],
          database: args.database
            ? Array.isArray(args.database)
              ? args.database.map((db: any) => ({
                  name: db.name,
                  type: db.type as any,
                }))
              : [
                  {
                    name: args.database.name,
                    type: args.database.type as any,
                  },
                ]
            : [],
        },
      };
    }
  );

  // Update proposal with template-based ports when templates are loaded
  useEffect(() => {
    if (
      templates &&
      Array.isArray(templates) &&
      args.devbox &&
      !isLoadingTemplates
    ) {
      // Handle both single devbox and array of devboxes
      const devboxes = Array.isArray(args.devbox) ? args.devbox : [args.devbox];

      const updatedDevboxes = devboxes.map((devbox: DeployDevBox) => {
        const devboxRuntime = devbox.runtime;
        const template = templates.find(
          (t: DevboxTemplate) => t.runtime === devboxRuntime
        );

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
  }, [templates, args.devbox, isLoadingTemplates]);

  const handleDeploy = async () => {
    try {
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
                message: "project created successfully",
                instruction:
                  "The project has been successfully created and deployed. You can now explore your project by navigating to the project details, checking resource status, monitoring performance, or making further configurations. Feel free to ask me about any aspect of your project or if you need help with additional setup.",
                createdAt: new Date().toISOString(),
              },
            }),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Add success message to the updated messages array
          updatedMessages.push(successMessage);

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
