"use client";

import { useMemo, useState } from "react";
import { Main } from "@/components/app/layout/main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useProjectTemplates } from "@/hooks/project/use-project-templates";
import { useToast } from "@/hooks/general/use-toast";
import { useCreateProjectMutation } from "@/lib/project/project-method/project-mutation";
import { getCurrentNamespace } from "@/lib/auth/auth-utils";
import { getDecodedKubeconfig } from "@/lib/auth/auth-utils";
import { K8sApiContextSchema } from "@/lib/k8s/schemas";
import type {
  ListTemplateResponse,
  TemplateResource,
} from "@/lib/sealos/template/schemas/template-api-context-schemas";
import { useCreateInstanceMutation } from "@/lib/sealos/template/template-method/template-mutation";
import { createTemplateApiContext } from "@/lib/sealos/template/template-method/template-utils";
import { TemplateCard } from "./template-card";
import { TemplateDetails } from "./template-details";

interface CreateProjectProps {
  onClose: () => void;
}

export default function CreateProject({ onClose }: CreateProjectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateResource | null>(null);

  const { toast } = useToast();
  const { data: templatesResponse, isLoading, error } = useProjectTemplates();
  const templates =
    (templatesResponse as ListTemplateResponse)?.data?.templates ?? [];

  // Get K8s context for mutations
  const context = K8sApiContextSchema.parse({
    namespace: getCurrentNamespace(),
    kubeconfig: getDecodedKubeconfig(),
  });

  const createProjectMutation = useCreateProjectMutation(context);

  // Get template API context
  const templateApiContext = createTemplateApiContext();

  const createInstanceMutation = useCreateInstanceMutation(templateApiContext);

  // Extract all unique categories from templates
  const categories = useMemo(() => {
    const allCategories = templates.flatMap(
      (template) => template.spec.categories || []
    );
    const uniqueCategories = Array.from(new Set(allCategories)).sort();
    return uniqueCategories;
  }, [templates]);

  const filteredTemplates = templates.filter((template: TemplateResource) => {
    // Filter by category
    if (
      selectedCategory !== "all" &&
      !template.spec.categories?.includes(selectedCategory)
    ) {
      return false;
    }

    // Filter by search term
    return (
      template.spec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.spec.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading templates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Error loading templates: {error.message}</div>
      </div>
    );
  }

  const handleCreateEmptyProject = () => {
    createProjectMutation.mutate(
      {},
      {
        onSuccess: (data) => {
          console.log("data", data);
          toast({
            title: "Project Created",
            description: `Project "${data.metadata.name}" has been created successfully.`,
          });
          onClose();
        },
        onError: (mutationError) => {
          toast({
            title: "Error",
            description: `Failed to create project: ${mutationError.message}`,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleViewDetails = (template: TemplateResource) => {
    setSelectedTemplate(template);
  };

  const handleBackToList = () => {
    setSelectedTemplate(null);
  };

  const handleTemplateDeploy = (
    templateName: string,
    templateForm?: Record<string, string>
  ) => {
    createInstanceMutation.mutate(
      {
        templateName,
        templateForm,
      },
      {
        onSuccess: () => {
          toast({
            title: "Template deployed successfully",
            description: `Template has been deployed to your project.`,
          });
          onClose();
        },
        onError: (error) => {
          toast({
            title: "Deployment failed",
            description:
              error.message || "Failed to deploy template. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  // If a template is selected, show the details view
  if (selectedTemplate) {
    return (
      <TemplateDetails
        onBack={handleBackToList}
        onDeploy={handleTemplateDeploy}
        template={selectedTemplate}
      />
    );
  }

  return (
    <>
      {/* ===== Content ===== */}
      <Main className="h-full w-full" fixed>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-bold text-2xl tracking-tight">
              Create New Project
            </h1>
            <p className="text-muted-foreground">
              Choose from available templates to create your project or create
              an empty project
            </p>
          </div>
          <Button
            disabled={createProjectMutation.isPending}
            onClick={handleCreateEmptyProject}
            variant="outline"
          >
            {createProjectMutation.isPending
              ? "Creating..."
              : "Create Empty Project"}
          </Button>
        </div>
        <div className="my-4 flex items-end justify-between sm:my-0 sm:items-center">
          <div className="flex flex-col gap-4 sm:my-4 sm:flex-row">
            <Input
              className="h-9 w-40 lg:w-[250px]"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter templates..."
              value={searchTerm}
            />
            <Select
              onValueChange={setSelectedCategory}
              value={selectedCategory}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator className="shadow-sm" />
        <div className="faded-bottom no-scrollbar grid gap-4 overflow-auto pt-4 pb-16 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template: TemplateResource) => (
            <TemplateCard
              key={template.metadata.name}
              onTemplateDeployed={onClose}
              onViewDetails={handleViewDetails}
              setSelectedCategory={setSelectedCategory}
              template={template}
            />
          ))}
        </div>
        {filteredTemplates.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No templates found matching your criteria
          </div>
        )}
      </Main>
    </>
  );
}
