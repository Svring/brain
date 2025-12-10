"use client";

import {
  CircleCheckBigIcon,
  Code,
  Database,
  Hammer,
  Rocket,
  Server,
} from "lucide-react";
import { usePathname } from "next/navigation";
import type React from "react";
import { useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { ProjectProposalCard } from "@/components/chat/state-cards/project-proposal/project-proposal-card";
import { useHomeChat } from "@/components/provider/home-chat-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useDevenvDeployment } from "@/hooks/langgraph/use-devenv-deployment";
import { requestLogin } from "@/lib/auth/auth-utils";
import { CLUSTER_TYPES } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-types";
import type { DevboxRuntime } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-runtimes";
import { DEVBOX_RUNTIMES } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-runtimes";
import { nanoid } from "@/lib/utils";
import { clusterCreateFormSchema } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { devboxCreateFormSchema } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { launchpadCreateFormSchema } from "@/schemas/forms/launchpad/launchpad-create-form-schema";

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
  const { threadId, messages, sessionId, trial, isLoading } = useHomeChat();

  const { internalProposal, setInternalProposal, isCreating, deployDevenv } =
    useDevenvDeployment({
      args,
      onSuccess,
    });

  const handleDeploy = useCallback(async () => {
    // If sessionId is present, request login instead of creating project
    if (sessionId) {
      // Pass internalProposal (which may have been modified by user) in ProjectProposal format
      const queryParams = {
        sessionId: sessionId,
        args: JSON.stringify(internalProposal),
      };
      console.log("query params", queryParams);
      requestLogin({
        pathname: "/",
        query: queryParams,
      });
      return;
    }

    await deployDevenv();
  }, [sessionId, internalProposal, deployDevenv]);

  // Auto-trigger deploy if trial is present
  useEffect(() => {
    if (trial) {
      handleDeploy();
    }
  }, [trial, handleDeploy]);

  return (
    <div className="w-full border p-2 rounded-xl">
      {/* Header with icon and text */}
      {/* <div className="flex items-center mb-3">
        <div className="flex text-sm text-muted-foreground">
          <Hammer size={20} className="mr-2" />
          <span>Deploy development environment</span>
        </div>
      </div> */}

      <ProjectProposalCard
        proposal={internalProposal}
        onProposalUpdate={setInternalProposal}
      />

      <div className="pt-2">
        <Button
          onClick={handleDeploy}
          disabled={isCreating || isLoading}
          className="w-full"
          // variant={"outline"}
        >
          {isLoading ? (
            <>
              <Spinner variant="circle" size={16} className="mr-2" />
              Responding
            </>
          ) : isCreating ? (
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
  const pathname = usePathname();

  // If we are on a project page, always show success message
  if (pathname?.includes("/projects")) {
    return <DevenvDeploymentSuccessMessage args={args} />;
  }
  // Check result first and return success state if it exists
  if (result) {
    return <DevenvDeploymentSuccessMessage args={args} />;
  }

  // Return the card component with args and logic
  return <DevenvDeploymentCard args={args} onSuccess={onSuccess} />;
};
