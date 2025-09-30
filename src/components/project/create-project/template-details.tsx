"use client";

import { ArrowLeft } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { TemplateResource } from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";
import { useCreateInstanceMutation } from "@/lib/sealos/resources/template/template-method/template-mutation";
import { TemplateInputDialog } from "./template-input-dialog";
import { useSealosContext } from "@/lib/auth/auth-utils";
import { useTemplates } from "@/hooks/template/use-templates";
import { useResourceQuotaChecker } from "@/lib/validation/resource-quota-checker";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

import "@/styles/github-markdown-dark.css";

const getDotColor = (category: string): string => {
  const lowerCategory = category.toLowerCase();
  if (
    lowerCategory.includes("ai") ||
    lowerCategory.includes("artificial intelligence")
  ) {
    return "bg-theme-blue";
  }
  if (
    lowerCategory.includes("ml") ||
    lowerCategory.includes("machine learning")
  ) {
    return "bg-theme-green";
  }
  if (lowerCategory.includes("data") || lowerCategory.includes("analytics")) {
    return "bg-theme-purple";
  }
  if (lowerCategory.includes("web") || lowerCategory.includes("frontend")) {
    return "bg-theme-yellow";
  }
  if (lowerCategory.includes("api") || lowerCategory.includes("backend")) {
    return "bg-theme-red";
  }
  return "bg-theme-darkblue";
};

export type TemplateDetailsProps = {
  template: TemplateResource;
  onBack: () => void;
};

export function TemplateDetails({ template, onBack }: TemplateDetailsProps) {
  const router = useRouter();
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [readmeContent, setReadmeContent] = useState<string>("");
  const [isLoadingReadme, setIsLoadingReadme] = useState(false);

  const apiContext = useMemo(() => useSealosContext(), []);
  const createInstanceMutation = useCreateInstanceMutation(apiContext);

  const {
    getTemplateSource,
    templateSource,
    isTemplateSourceLoading,
    templateSourceError,
  } = useTemplates(apiContext);

  // Automatically fetch template source when component mounts
  useEffect(() => {
    if (template.metadata.name) {
      getTemplateSource(template.metadata.name);
    }
  }, [template.metadata.name, getTemplateSource]);
  const { checkAndShowQuotaError, quota } = useResourceQuotaChecker();
  const hasInputs =
    template.spec.inputs && Object.keys(template.spec.inputs).length > 0;

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
          toast.error("Failed to load documentation");
        })
        .finally(() => {
          setIsLoadingReadme(false);
        });
    }
  }, [template.spec.readme]);

  // Function to handle the deploy button click - determines whether to open input dialog or deploy directly
  const handleDeployClick = async () => {
    if (hasInputs) {
      setShowInputDialog(true);
    } else {
      handleDeploy();
    }
  };

  // Function to execute the actual deployment with quota check
  const handleDeploy = (templateForm?: Record<string, string>) => {
    if (templateSource?.data?.requirements) {
      const requirementsData = templateSource.data.requirements;
      const maxRequirements = {
        cpu: (requirementsData.cpu?.max || 0) / 1000,
        memory: (requirementsData.memory?.max || 0) / 1024,
        storage: (requirementsData.storage?.max || 0) / 1024,
        ports: requirementsData.nodeport || 0,
        // ports: 20
      };

      console.log("maxRequirements", maxRequirements);

      const quotaCheckPassed = checkAndShowQuotaError(maxRequirements);
      if (!quotaCheckPassed) {
        return;
      }
    }

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
          const instanceResource = data.data?.find(
            (resource: any) => resource.kind === "Instance"
          );
          if (instanceResource?.metadata?.name) {
            const instanceName = instanceResource.metadata.name;
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

  return (
    <div className="flex h-full max-h-full flex-col overflow-y-auto relative">
      {createInstanceMutation.isPending && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Spinner variant="bars" className="size-8" />
            <p className="text-sm text-muted-foreground">
              Deploying template...
            </p>
          </div>
        </div>
      )}

      <div className="flex shrink-0 items-center gap-4 p-6 pb-4">
        <Button onClick={onBack} size="sm" variant="ghost">
          <ArrowLeft className="mr-2 size-4" />
          Back to Templates
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex size-16 items-center justify-center rounded-lg bg-muted p-3">
              {template.spec.icon ? (
                <img
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
                  {template.spec.categories &&
                    template.spec.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {template.spec.categories.map((category) => (
                          <Badge
                            key={category}
                            variant="outline"
                            dot
                            dotColor={getDotColor(category)}
                            className="bg-background-tertiary"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    )}
                </div>
                <Button
                  onClick={handleDeployClick}
                  variant="outline"
                  disabled={
                    createInstanceMutation.isPending || isTemplateSourceLoading
                  }
                >
                  {createInstanceMutation.isPending
                    ? "Deploying..."
                    : isTemplateSourceLoading
                    ? "Loading..."
                    : hasInputs
                    ? "Configure & Deploy"
                    : "Deploy"}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {template.spec.description && (
              <div>
                <p className="text-muted-foreground leading-relaxed">
                  {template.spec.description}
                </p>
              </div>
            )}

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

      {hasInputs && (
        <TemplateInputDialog
          template={template}
          isOpen={showInputDialog}
          onClose={() => setShowInputDialog(false)}
          onSubmit={handleDeploy}
          isLoading={createInstanceMutation.isPending}
        />
      )}
    </div>
  );
}
