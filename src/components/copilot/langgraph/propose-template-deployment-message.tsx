"use client";

import React, { useState, useMemo } from "react";
import { CircleCheckBigIcon } from "lucide-react";
import { ProjectTemplateCard } from "@/components/chat/state-cards/project-proposal/project-template-card";
import { useTemplates } from "@/hooks/template/use-templates";
import { useTemplateApiContext, useSealosContext } from "@/lib/auth/auth-utils";
import { useCreateInstanceMutation } from "@/lib/sealos/resources/template/template-method/template-mutation";
import { TemplateInputDialog } from "@/components/project/create-project/template-input-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useHomeChat } from "@/components/provider/home-chat-provider";
import { useThreads } from "@/components/provider/thread-provider";
import { useAuthState } from "@/contexts/auth/auth-context";

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
      <div className="flex items-center justify-center p-2 border rounded-lg bg-background-secondary">
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

const TemplateDeploymentCard = ({ args, onSuccess }: { args: any; onSuccess?: (data: any) => void }) => {
  const [showInputDialog, setShowInputDialog] = useState(false);
  const router = useRouter();
  const { submit, threadId, messages } = useHomeChat();
  const { patchThread, updateThreadState } = useThreads();
  const { auth } = useAuthState();

  // Get template API context and templates
  const templateApiContext = useTemplateApiContext();
  const { templates, isLoading, error } = useTemplates(templateApiContext);
  const apiContext = useMemo(() => useSealosContext(), []);
  const createInstanceMutation = useCreateInstanceMutation(apiContext);

  // Find the template by name
  const template = templates.find(
    (t) =>
      t.spec.title.toLowerCase().includes(args.template_name.toLowerCase()) ||
      t.metadata.name.toLowerCase().includes(args.template_name.toLowerCase())
  );

  // Check if template has inputs
  const hasInputs = Boolean(
    template?.spec.inputs && Object.keys(template.spec.inputs).length > 0
  );

  const deployTemplate = (templateForm?: Record<string, string>) => {
    if (!template) return;

    createInstanceMutation.mutate(
      {
        templateName: template.metadata.name,
        templateForm,
      },
      {
        onSuccess: async (data) => {
          toast.success(
            `${template.spec.title} has been deployed to your project.`
          );
          setShowInputDialog(false);
          onSuccess?.(data);

          const instanceResource = data.data?.find(
            (resource: any) => resource.kind === "Instance"
          );
          if (instanceResource?.metadata?.name) {
            const instanceName = instanceResource.metadata.name;

            // Update thread metadata with deployment information
            if (threadId) {
              await patchThread.mutate({
                threadId,
                metadata: {
                  kubeconfig: auth?.kubeconfig,
                  projectName: instanceName,
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

            // Navigate to the instance details page
            router.push(`/projects/${instanceName}`);
          }
        },
        onError: (error: Error) => {
          toast.error(
            error.message || "Failed to deploy template. Please try again."
          );
          setShowInputDialog(false);
        },
      }
    );
  };

  const handleDeploy = () => {
    if (hasInputs) {
      setShowInputDialog(true);
    } else {
      deployTemplate();
    }
  };

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
        onDeploy={handleDeploy}
        isDeploying={createInstanceMutation.isPending}
        hasInputs={hasInputs}
      />

      {/* Template Input Dialog */}
      {template && hasInputs && (
        <TemplateInputDialog
          template={template}
          isOpen={showInputDialog}
          onClose={() => setShowInputDialog(false)}
          onSubmit={deployTemplate}
          isLoading={createInstanceMutation.isPending}
        />
      )}
    </>
  );
};

export const ProposeTemplateDeploymentMessage: React.FC<
  ProposeTemplateDeploymentMessageProps
> = ({ args, result, onSuccess }) => {
  // Check result first and return success state if it exists
  if (result) {
    return <TemplateDeploymentSuccessMessage args={args} />;
  }

  // Return the card component with args and logic
  return <TemplateDeploymentCard args={args} onSuccess={onSuccess} />;
};
