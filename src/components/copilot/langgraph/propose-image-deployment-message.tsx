"use client";

import { CircleCheckBigIcon, Container, Hammer, Rocket } from "lucide-react";
import { usePathname } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import { ProjectProposalCard } from "@/components/chat/state-cards/project-proposal/project-proposal-card";
import { useHomeChat } from "@/components/provider/home-chat-provider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useImageDeployment } from "@/hooks/langgraph/use-image-deployment";
import { requestLogin } from "@/lib/auth/auth-utils";

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
  const { sessionId, trial, isLoading } = useHomeChat();
  const { internalProposal, setInternalProposal, deployImage, isCreating } =
    useImageDeployment(args);

  // Use ref to track if auto-deploy has been triggered to prevent infinite loops
  const hasAutoDeployedRef = useRef(false);
  // Store latest functions in refs to avoid dependency issues
  const deployImageRef = useRef(deployImage);
  const sessionIdRef = useRef(sessionId);
  const internalProposalRef = useRef(internalProposal);
  const onSuccessRef = useRef(onSuccess);

  // Keep refs up to date
  useEffect(() => {
    deployImageRef.current = deployImage;
    sessionIdRef.current = sessionId;
    internalProposalRef.current = internalProposal;
    onSuccessRef.current = onSuccess;
  }, [deployImage, sessionId, internalProposal, onSuccess]);

  const handleDeploy = useCallback(async () => {
    // If sessionId is present, request login instead of creating project
    if (sessionIdRef.current) {
      // Pass internalProposal (which may have been modified by user) in ProjectProposal format
      const queryParams = {
        sessionId: sessionIdRef.current,
        args: JSON.stringify(internalProposalRef.current),
      };
      console.log("query params", queryParams);
      requestLogin({
        pathname: "/",
        query: queryParams,
      });
      return;
    }

    try {
      const projectName = await deployImageRef.current();
      if (onSuccessRef.current) {
        onSuccessRef.current(projectName);
      }
    } catch (error) {
      console.error(
        "[ProposeImageDeploymentMessage] Failed to deploy Docker image:",
        error
      );
    }
  }, []);

  // Auto-trigger deploy if trial is present (only once when component appears)
  // trial is a URL flag, so we only need to watch trial itself
  useEffect(() => {
    if (trial && !hasAutoDeployedRef.current && !isCreating) {
      hasAutoDeployedRef.current = true;
      handleDeploy();
    }
    // Reset ref if trial becomes false (for testing purposes)
    if (!trial) {
      hasAutoDeployedRef.current = false;
    }
    // handleDeploy is stable (empty deps), isCreating checked inside condition
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial]); // Only depend on trial - it's a URL flag that indicates auto-deploy should happen

  // Separate effect to handle case where component mounts with trial=true but isCreating=true
  // This ensures we trigger when isCreating becomes false (component ready)
  useEffect(() => {
    if (trial && !hasAutoDeployedRef.current && !isCreating) {
      hasAutoDeployedRef.current = true;
      handleDeploy();
    }
    // handleDeploy is stable (empty deps), trial checked via ref/condition
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreating]); // Watch isCreating separately to trigger when component becomes ready

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

export const ProposeImageDeploymentMessage: React.FC<
  ProposeImageDeploymentMessageProps
> = ({ args, result, onSuccess }) => {
  const pathname = usePathname();

  // If we are on a project page, always show success message
  if (pathname?.includes("/projects")) {
    return <ImageDeploymentSuccessMessage args={args} />;
  }
  // Check result first and return success state if it exists
  if (result) {
    return <ImageDeploymentSuccessMessage args={args} />;
  }

  // Return the card component with args and logic
  return <ImageDeploymentCard args={args} onSuccess={onSuccess} />;
};
