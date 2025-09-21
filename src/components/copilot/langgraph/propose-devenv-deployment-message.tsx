"use client";

import React, { useState } from "react";
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

interface DeployDevBox {
  name: string;
  runtime: string;
  ports?: number[];
}

interface DeployDatabase {
  name: string;
  type: string;
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
      <div className="flex items-center justify-center p-2 border rounded-lg">
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

const DevenvDeploymentCard = ({ args, onSuccess }: { args: any; onSuccess?: (data: any) => void }) => {
  const { createProject, isCreating } = useProjectCreate();
  const { submit, threadId } = useHomeChat();
  const { patchThread } = useThreads();
  const router = useRouter();
  const { auth } = useAuthState();
  const [internalProposal, setInternalProposal] = useState<ProjectProposal>(
    () => {
      // Create initial proposal from args
      return {
        name: "Development Environment Project",
        resources: {
          devbox: args.devbox
            ? [
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
      console.log("Deploying with threadId:", threadId);
      console.log("internalProposal", internalProposal);

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
