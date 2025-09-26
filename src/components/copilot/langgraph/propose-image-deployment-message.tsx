"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircleCheckBigIcon, Rocket, Container, Hammer } from "lucide-react";
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
import { nanoid } from "@/lib/utils";

interface ProposeImageDeploymentMessageProps {
  args: {
    image_name: string;
    project_name: string;
    name: string;
    ports?: number[];
  };
  result?: any;
  onSuccess?: (data: any) => void;
}

const ImageDeploymentSuccessMessage = ({ args }: { args: any }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">
            Image "{args.image_name}" deployed successfully
          </p>
        </div>
      </div>
    </div>
  );
};

const ImageDeploymentCard = ({
  args,
  onSuccess,
}: {
  args: any;
  onSuccess?: (data: any) => void;
}) => {
  const { createProject, isCreating } = useProjectCreate();
  const { submit, threadId, messages } = useHomeChat();
  const { patchThread, updateThreadState } = useThreads();
  const { openProjectChat } = useChatActions();
  const router = useRouter();
  const { auth } = useAuthState();
  const [internalProposal, setInternalProposal] = useState<ProjectProposal>(
    () => {
      // Create initial proposal from args
      const projectName = `${args.project_name}-${nanoid()}`;
      const containerName = `${args.name}-${nanoid()}`;

      return {
        name: projectName,
        resources: {
          app: [
            {
              name: containerName,
              image: args.image_name,
              ports: (args.ports || []).map((port: number) => ({
                number: port,
                publicAccess: true,
              })),
            },
          ],
        },
      };
    }
  );

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

      if (onSuccess) {
        onSuccess(projectName);
      }
    } catch (error) {
      console.error(
        "[ProposeImageDeploymentMessage] Failed to deploy Docker image:",
        error
      );
    }
  };

  return (
    <div className="w-full border p-2 rounded-xl">
      {/* Header with icon and text */}
      {/* <div className="flex items-center mb-3">
        <div className="flex text-sm text-muted-foreground">
          <Hammer size={20} className="mr-2" />
          <span>
            Deploy {args.name} ({args.image_name})
          </span>
        </div>
      </div> */}

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

export const ProposeImageDeploymentMessage: React.FC<
  ProposeImageDeploymentMessageProps
> = ({ args, result, onSuccess }) => {
  // Check result first and return success state if it exists
  if (result) {
    return <ImageDeploymentSuccessMessage args={args} />;
  }

  // Return the card component with args and logic
  return <ImageDeploymentCard args={args} onSuccess={onSuccess} />;
};
