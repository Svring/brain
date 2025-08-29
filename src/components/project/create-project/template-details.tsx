"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthState } from "@/contexts/auth/auth-context";
import { toast } from "sonner";
import type { TemplateResource } from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";
import { useCreateInstanceMutation } from "@/lib/sealos/resources/template/template-method/template-mutation";
import { TemplateInputDialog } from "./template-input-dialog";
import { createSealosContext } from "@/lib/auth/auth-utils";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useRouter } from "next/navigation";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useSendMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";

import "@/styles/github-markdown-dark.css";

export type TemplateDetailsProps = {
  template: TemplateResource;
  onBack: () => void;
};

export function TemplateDetails({ template, onBack }: TemplateDetailsProps) {
  const router = useRouter();
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [readmeContent, setReadmeContent] = useState<string>("");
  const [isLoadingReadme, setIsLoadingReadme] = useState(false);

  const { openSidebarChat } = useChatActions();
  const { mutate: sendMessage } = useSendMessageMutation();
  const apiContext = useMemo(() => createSealosContext(), []);
  const createInstanceMutation = useCreateInstanceMutation(apiContext);

  // Check if template has inputs
  const hasInputs =
    template.spec.inputs && Object.keys(template.spec.inputs).length > 0;

  // Fetch README content
  useEffect(() => {
    if (template.spec.readme && template.spec.readme.startsWith("http")) {
      setIsLoadingReadme(true);
      fetch(template.spec.readme)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch README: ${response.status}`);
          }
          return response.text();
        })
        .then((content) => {
          setReadmeContent(content);
        })
        .catch((error) => {
          console.error("Error fetching README:", error);
          toast.error("Failed to load documentation");
        })
        .finally(() => {
          setIsLoadingReadme(false);
        });
    }
  }, [template.spec.readme]);

  const deployTemplate = (templateForm?: Record<string, string>) => {
    createInstanceMutation.mutate(
      {
        templateName: template.metadata.name,
        templateForm,
      },
      {
        onSuccess: (data) => {
          toast.success(
            `${template.spec.title} has been deployed to your project.`
          );
          setShowInputDialog(false);
          openSidebarChat();
          sendMessage([
            {
              role: "system",
              content: `The user has created a new instance of ${template.spec.title} and entered the detail view of the project, send your greeting and gently hint the user what they could do next.`,
            },
          ]);
          const instanceResource = data.data?.find(
            (resource: any) => resource.kind === "Instance"
          );
          if (instanceResource?.metadata?.name) {
            const instanceName = instanceResource.metadata.name;
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

  const handleDeployWithForm = (templateForm: Record<string, string>) => {
    deployTemplate(templateForm);
  };

  return (
    <div className="flex h-full max-h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-4 p-6 pb-4">
        <Button onClick={onBack} size="sm" variant="ghost">
          <ArrowLeft className="mr-2 size-4" />
          Back to Templates
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Template Header */}
          <div className="flex items-start gap-4">
            <div className="flex size-16 items-center justify-center rounded-lg bg-muted p-3">
              {template.spec.icon ? (
                <Image
                  alt={`${template.spec.title} icon`}
                  className="size-10"
                  height={40}
                  src={template.spec.icon}
                  width={40}
                />
              ) : (
                <div className="size-10 rounded bg-gray-300" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold">
                    {template.spec.title}
                  </h1>
                  {/* Categories */}
                  {template.spec.categories &&
                    template.spec.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {template.spec.categories.map((category) => (
                          <Badge key={category} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    )}
                </div>
                <Button
                  onClick={handleDeploy}
                  variant="outline"
                  disabled={createInstanceMutation.isPending}
                >
                  {createInstanceMutation.isPending
                    ? "Deploying..."
                    : hasInputs
                    ? "Configure & Deploy"
                    : "Deploy"}
                </Button>
              </div>
            </div>
          </div>

          {/* Template Details */}
          <div className="space-y-6">
            {/* Description Section */}
            {template.spec.description && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {template.spec.description}
                </p>
              </div>
            )}

            {/* Template Information Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3">
                Template Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {template.spec.templateType && (
                  <div>
                    <h4 className="font-medium text-sm">Template Type</h4>
                    <p className="text-muted-foreground text-sm">
                      {template.spec.templateType}
                    </p>
                  </div>
                )}

                {template.spec.deployCount !== undefined && (
                  <div>
                    <h4 className="font-medium text-sm">Deploy Count</h4>
                    <p className="text-muted-foreground text-sm">
                      {template.spec.deployCount}
                    </p>
                  </div>
                )}

                {template.spec.url && (
                  <div>
                    <h4 className="font-medium text-sm">Homepage</h4>
                    <a
                      className="text-blue-600 text-sm hover:underline"
                      href={template.spec.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {template.spec.url}
                    </a>
                  </div>
                )}

                {template.spec.gitRepo && (
                  <div>
                    <h4 className="font-medium text-sm">Repository</h4>
                    <a
                      className="text-blue-600 text-sm hover:underline"
                      href={template.spec.gitRepo}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {template.spec.gitRepo}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Configuration Parameters Section */}
            {template.spec.inputs &&
              Object.keys(template.spec.inputs).length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    Configuration Parameters
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    This template accepts the following configuration parameters
                  </p>
                  <div className="space-y-4">
                    {Object.entries(template.spec.inputs).map(
                      ([key, input]) => (
                        <div
                          className="border-border border-l-2 pl-4"
                          key={key}
                        >
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{key}</h4>
                            {input?.required && (
                              <Badge variant="destructive">Required</Badge>
                            )}
                          </div>
                          {input?.description && (
                            <p className="text-muted-foreground text-sm">
                              {input.description}
                            </p>
                          )}
                          <div className="mt-1 text-muted-foreground text-xs">
                            Type: {input?.type || "string"}
                            {input?.default !== undefined && (
                              <span> • Default: {String(input.default)}</span>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Documentation Section */}
            {template.spec.readme && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Documentation</h3>
                <div className="markdown-body">
                  {isLoadingReadme ? (
                    <p>Loading documentation...</p>
                  ) : (
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        ol: ({ children, ...props }) => (
                          <ol className="list-decimal" {...props}>
                            {children}
                          </ol>
                        ),
                        ul: ({ children, ...props }) => (
                          <ul className="list-disc" {...props}>
                            {children}
                          </ul>
                        ),
                      }}
                    >
                      {readmeContent}
                    </Markdown>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Input Dialog */}
      {hasInputs && (
        <TemplateInputDialog
          template={template}
          isOpen={showInputDialog}
          onClose={() => setShowInputDialog(false)}
          onSubmit={handleDeployWithForm}
          isLoading={createInstanceMutation.isPending}
        />
      )}
    </div>
  );
}
