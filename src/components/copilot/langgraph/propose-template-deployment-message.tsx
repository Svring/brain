"use client";

import React from "react";
import { CircleCheckBigIcon } from "lucide-react";
import { ProjectTemplateCard } from "@/components/chat/state-cards/project-proposal/project-template-card";
import { useTemplates } from "@/hooks/template/use-templates";
import { useTemplateApiContext } from "@/lib/auth/auth-utils";

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

export const ProposeTemplateDeploymentMessage: React.FC<
  ProposeTemplateDeploymentMessageProps
> = ({ args, result, onSuccess }) => {
  const [isDeploying, setIsDeploying] = React.useState(false);

  // Get template API context and templates
  const templateApiContext = useTemplateApiContext();
  const { templates, isLoading, error } = useTemplates(templateApiContext);

  // Find the template by name
  const template = templates.find(
    (t) =>
      t.spec.title.toLowerCase().includes(args.template_name.toLowerCase()) ||
      t.metadata.name.toLowerCase().includes(args.template_name.toLowerCase())
  );

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      // Simulate deployment process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onSuccess?.(args.template_name);
    } catch (error) {
      console.error("Failed to deploy template:", error);
    } finally {
      setIsDeploying(false);
    }
  };

  // Show completion message when result is provided
  if (result) {
    return <TemplateDeploymentSuccessMessage args={args} />;
  }

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
    <ProjectTemplateCard
      template={template}
      onDeploy={handleDeploy}
      isDeploying={isDeploying}
    />
  );
};
