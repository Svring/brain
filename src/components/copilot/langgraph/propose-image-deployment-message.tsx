"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, CircleCheckBigIcon, Rocket, Container } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ProjectProposalCard } from "@/components/chat/state-cards/project-proposal/project-proposal-card";
import type { ProjectProposal } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { useProjectCreate } from "@/hooks/brain/use-project-create";

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

export const ProposeImageDeploymentMessage: React.FC<
  ProposeImageDeploymentMessageProps
> = ({ args, result, onSuccess }) => {
  const { createProjectFromSimpleData, isCreating } = useProjectCreate();

  console.log("args", args);

  const handleDeploy = async () => {
    try {
      const deploymentData = {
        app: {
          name: "docker-app",
          image: args.image_name,
          ports: args.ports || [],
        },
        database: args.database ? {
          name: args.database.name,
          type: args.database.type,
        } : undefined,
      };

      const projectName = await createProjectFromSimpleData(deploymentData, "docker-image-project");
      onSuccess?.(projectName);
    } catch (error) {
      console.error("Failed to deploy Docker image:", error);
    }
  };

  // Show completion message when result is provided
  if (result) {
    return <ImageDeploymentSuccessMessage args={args} />;
  }

  // Create project proposal from args
  const projectProposal: ProjectProposal = {
    name: "Docker Image Project",
    resources: {
      app: [
        {
          name: "docker-app",
          image: args.image_name,
          ports: (args.ports || []).map((port) => ({
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

  return (
    <div className="w-full space-y-4">
      <ProjectProposalCard
        proposal={projectProposal}
        onProposalUpdate={() => {}} // No updates allowed
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
