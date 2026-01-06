"use client";

import { CircleCheckBigIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useRef } from "react";
import { ProjectTemplateCard } from "@/components/chat/state-cards/project-proposal/project-template-card";
import { TemplateInputDialog } from "@/components/project/create-project/template-input-dialog";
import { useHomeChat } from "@/components/provider/home-chat-provider";
import { useTemplateDeployment } from "@/hooks/langgraph/use-template-deployment";
import { requestLogin } from "@/lib/auth/auth-utils";

interface ProposeTemplateDeploymentMessageProps {
  args: {
    template_name: string;
  };
  result?: any;
  onSuccess?: (data: any) => void;
}

const TemplateDeploymentSuccessMessage = ({ args }: { args: any }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">
            Template "{args.template_name}" deployed successfully
          </p>
        </div>
      </div>
    </div>
  );
};

const TemplateDeploymentCard = ({
  args,
  onSuccess,
}: {
  args: any;
  onSuccess?: (data: any) => void;
}) => {
  const { sessionId, trial, isLoading: isHomeChatLoading } = useHomeChat();
  const {
    template,
    isLoading,
    error,
    hasInputs,
    hasRequired,
    showInputDialog,
    setShowInputDialog,
    deployTemplate,
    isDeploying,
  } = useTemplateDeployment(args.template_name);

  // Use ref to track if auto-deploy has been triggered to prevent infinite loops
  const hasAutoDeployedRef = useRef(false);

  // Unified handler for both initial deploy and dialog submit
  const handleDeployOrSubmit = (templateForm?: any) => {
    // If required inputs exist and none were provided, open dialog first
    if (hasRequired && !templateForm) {
      setShowInputDialog(true);
      return;
    }

    // Handle login redirect when sessionId exists, include submitted inputs if present
    if (sessionId) {
      const fullArgs = templateForm
        ? { ...args, template_form: templateForm }
        : args;
      const queryParams = {
        sessionId: sessionId,
        args: JSON.stringify(fullArgs),
      };
      console.log("query params", queryParams);
      requestLogin({ pathname: "/", query: queryParams });
      return;
    }

    // Otherwise deploy directly with provided inputs (or none)
    deployTemplate(
      { templateName: args.template_name, templateForm },
      onSuccess
    );
  };

  // Auto-trigger deploy if trial is present (only once when component appears)
  // trial is a URL flag, so we only need to watch trial itself
  useEffect(() => {
    if (trial && !hasAutoDeployedRef.current && !isLoading && !error && template && !isDeploying) {
      hasAutoDeployedRef.current = true;
      handleDeployOrSubmit();
    }
    // Reset ref if trial becomes false (for testing purposes)
    if (!trial) {
      hasAutoDeployedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial]); // Only depend on trial - it's a URL flag that indicates auto-deploy should happen

  // Separate effect to handle case where component mounts with trial=true but dependencies aren't ready
  // This ensures we trigger when component becomes ready (template loaded, not deploying, etc.)
  useEffect(() => {
    if (trial && !hasAutoDeployedRef.current && !isLoading && !error && template && !isDeploying) {
      hasAutoDeployedRef.current = true;
      handleDeployOrSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, error, template, isDeploying]); // Watch readiness state separately

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">
            Loading templates...
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-destructive">
            Error loading templates: {error.message}
          </div>
        </div>
      </div>
    );
  }

  // Show template not found
  if (!template) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">
            Template "{args.template_name}" not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProjectTemplateCard
        template={template}
        onDeploy={() => handleDeployOrSubmit()}
        isDeploying={isDeploying}
        isLoading={isHomeChatLoading}
        hasInputs={hasInputs}
        hasRequired={hasRequired}
      />

      {/* Template Input Dialog - only show if there are required fields */}
      {template && hasRequired && (
        <TemplateInputDialog
          template={template}
          isOpen={showInputDialog}
          onClose={() => setShowInputDialog(false)}
          onSubmit={handleDeployOrSubmit}
          isLoading={isDeploying}
        />
      )}
    </>
  );
};

export const ProposeTemplateDeploymentMessage: React.FC<
  ProposeTemplateDeploymentMessageProps
> = ({ args, result, onSuccess }) => {
  const pathname = usePathname();

  // If we are on a project page, always show success message
  if (pathname?.includes("/projects")) {
    return <TemplateDeploymentSuccessMessage args={args} />;
  }
  // Check result first and return success state if it exists
  if (result) {
    return <TemplateDeploymentSuccessMessage args={args} />;
  }

  // Return the card component with args and logic
  return <TemplateDeploymentCard args={args} onSuccess={onSuccess} />;
};
