"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  CircleCheckBigIcon,
  Rocket,
  Container,
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

interface DeployDatabase {
  name: string;
  type: string;
}

interface ProposeImageDeploymentMessageProps {
  args: {
    image_name: string;
    ports?: number[];
    database?: DeployDatabase;
  };
  result?: any;
  onSuccess?: (data: any) => void;
}

const ImageDeploymentSuccessMessage = ({ args }: { args: any }) => {
  const hasDatabase = args.database;

  return (
    <div className="w-full">
      <div className="flex items-center justify-center p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">
            Docker image "{args.image_name}" deployed successfully
            {hasDatabase && ` with ${args.database.name} database`}
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
  const { submit, threadId } = useHomeChat();
  console.log("[ProposeImageDeploymentMessage] threadId:", threadId);
  const { patchThread } = useThreads();
  const router = useRouter();
  const { auth } = useAuthState();
  const [internalProposal, setInternalProposal] = useState<ProjectProposal>(
    () => {
      // Create initial proposal from args
      return {
        name: "Docker Image Project",
        resources: {
          app: [
            {
              name: "docker-app",
              image: args.image_name,
              ports: (args.ports || []).map((port: number) => ({
                number: port,
                publicAccess: true,
              })),
            },
          ],
          database: args.database
            ? [
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

  const handleDeploy = async () => {
    try {
      console.log(
        "[ProposeImageDeploymentMessage] Deploying with threadId:",
        threadId
      );
      console.log(
        "[ProposeImageDeploymentMessage] internalProposal:",
        internalProposal
      );

      // Create the project
      const projectName = await createProject(internalProposal);
      console.log(
        "[ProposeImageDeploymentMessage] Project created:",
        projectName
      );

      // Update thread metadata with deployment information
      if (threadId) {
        console.log(
          "[ProposeImageDeploymentMessage] Patching thread with metadata:",
          {
            threadId,
            kubeconfig: auth?.kubeconfig,
            projectName,
          }
        );
        const patchedThread = await patchThread.mutate({
          threadId,
          metadata: {
            kubeconfig: auth?.kubeconfig,
            projectName: projectName,
            resourceTarget: null,
          },
        });
        console.log(
          "[ProposeImageDeploymentMessage] Thread patched successfully:",
          patchedThread
        );
      } else {
        console.warn(
          "[ProposeImageDeploymentMessage] No threadId available to patch thread metadata"
        );
      }

      // Navigate to the created project
      console.log(
        "[ProposeImageDeploymentMessage] Navigating to project:",
        `/projects/${projectName}`
      );
      router.push(`/projects/${projectName}`);

      if (onSuccess) {
        console.log(
          "[ProposeImageDeploymentMessage] Calling onSuccess callback with projectName:",
          projectName
        );
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
      <div className="flex items-center mb-3">
        <div className="flex text-sm text-muted-foreground">
          {/* <Hammer size={20} className="mr-2" /> */}
          <span>Deploy Docker image: {args.image_name}</span>
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
          variant={"outline"}
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
  console.log("[ProposeImageDeploymentMessage] result:", result);
  // Check result first and return success state if it exists
  if (result) {
    return <ImageDeploymentSuccessMessage args={args} />;
  }

  // Return the card component with args and logic
  return <ImageDeploymentCard args={args} onSuccess={onSuccess} />;
};
