"use client";

import { ArrowLeft } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTemplates } from "@/hooks/template/use-templates";
import { openCostCenterApp, useSealosContext } from "@/lib/auth/auth-utils";
import type { TemplateResource } from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";
import { useCreateInstanceMutation } from "@/lib/sealos/resources/template/template-method/template-mutation";
import { useResourceQuotaChecker } from "@/lib/validation/resource-quota-checker";
import { TemplateInputDialog } from "./template-input-dialog";

interface QuotaCheckResult {
  passed: boolean;
  exceededResources: Array<{
    resource: "cpu" | "memory" | "storage" | "ports";
    required: number;
    available: number;
    message: string;
  }>;
}

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
    template: templateDetails,
    isTemplateLoading,
    templateError,
  } = useTemplates(apiContext);

  // Automatically fetch template source when component mounts
  useEffect(() => {
    if (template.metadata.name) {
      getTemplateSource(template.metadata.name);
    }
  }, [template.metadata.name, getTemplateSource]);
  const { checkAndShowQuotaError, checkResourceQuota, quota } =
    useResourceQuotaChecker();
  const hasInputs =
    (templateDetails?.data?.input &&
      Object.keys(templateDetails.data.input).length > 0) ||
    (template.spec.inputs && Object.keys(template.spec.inputs).length > 0);

  // Check if quota requirements are met
  const quotaCheckResult = React.useMemo(() => {
    // Use templateDetails resource data if available, otherwise assume no requirements
    const resourceData = templateDetails?.data?.resource;
    if (!resourceData) {
      return { passed: true, exceededResources: [] }; // No requirements means no quota check needed
    }

    return checkResourceQuota({
      cpu: resourceData.cpu,
      memory: resourceData.memory,
      storage: resourceData.storage,
      ports: resourceData.nodeport,
    });
  }, [templateDetails, checkResourceQuota]);

  const quotaCheckPassed = quotaCheckResult.passed;

  useEffect(() => {
    if (templateDetails?.data?.readme) {
      setIsLoadingReadme(true);
      fetch(templateDetails.data.readme)
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
  }, [templateDetails?.data?.readme]);

  // Function to handle the deploy button click - determines whether to open input dialog or deploy directly
  const handleDeployClick = async () => {
    if (hasInputs) {
      setShowInputDialog(true);
    } else {
      handleDeploy();
    }
  };

  // Function to execute the actual deployment
  const handleDeploy = (templateForm?: Record<string, string>) => {
    // Quota check is already done upfront, so we can proceed directly
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
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
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
              {templateDetails?.data?.icon || template.spec.icon ? (
                <img
                  alt={`${
                    templateDetails?.data?.name || template.spec.title
                  } icon`}
                  className="size-10"
                  height={40}
                  src={templateDetails?.data?.icon || template.spec.icon}
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
                    {templateDetails?.data?.name ||
                      template.spec.title ||
                      template.metadata.name}
                  </h1>
                  {(templateDetails?.data?.category ||
                    template.spec.categories) &&
                    ((templateDetails?.data?.category?.length ?? 0) > 0 ||
                      (template.spec.categories?.length ?? 0) > 0) && (
                      <div className="flex flex-wrap gap-2">
                        {(
                          templateDetails?.data?.category ||
                          template.spec.categories
                        )?.map((category) => (
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleDeployClick}
                        variant="outline"
                        disabled={
                          createInstanceMutation.isPending || !quotaCheckPassed
                        }
                      >
                        {createInstanceMutation.isPending
                          ? "Deploying..."
                          : hasInputs
                          ? "Configure & Deploy"
                          : "Deploy"}
                      </Button>
                    </TooltipTrigger>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* Display exceeded quota information */}
          {!quotaCheckPassed &&
            quotaCheckResult.exceededResources.length > 0 && (
              <div className="pb-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-sm font-medium text-destructive">
                      Insufficient Quotas
                    </p>
                  </div>
                  <div className="space-y-2">
                    {quotaCheckResult.exceededResources.map(
                      (exceeded, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {exceeded.resource.charAt(0).toUpperCase() +
                              exceeded.resource.slice(1)}
                            :
                          </span>
                          <span className="font-medium text-destructive">
                            requires {exceeded.required.toFixed(2)}{" "}
                            {exceeded.resource === "cpu"
                              ? "cores"
                              : exceeded.resource === "memory" ||
                                exceeded.resource === "storage"
                              ? "GB"
                              : "ports"}
                            ,{exceeded.available.toFixed(2)}{" "}
                            {exceeded.resource === "cpu"
                              ? "cores"
                              : exceeded.resource === "memory" ||
                                exceeded.resource === "storage"
                              ? "GB"
                              : "ports"}{" "}
                            available
                          </span>
                        </div>
                      )
                    )}
                  </div>
                  <button
                    onClick={openCostCenterApp}
                    className="mt-3 w-full py-1.5 bg-foreground text-sm text-background rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    Open Cost Center
                  </button>
                </div>
              </div>
            )}

          <div className="space-y-6">
            {(templateDetails?.data?.description ||
              template.spec.description) && (
              <div>
                <p className="text-muted-foreground leading-relaxed">
                  {templateDetails?.data?.description ||
                    template.spec.description}
                </p>
              </div>
            )}

            {(templateDetails?.data?.readme || template.spec.readme) && (
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
