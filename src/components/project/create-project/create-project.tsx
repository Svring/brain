"use client";

import { Main } from "@/components/ui/main";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SearchIcon } from "lucide-react";
import { useTemplates } from "@/hooks/template/use-templates";
import { useTemplateSearch } from "@/hooks/template/use-template-search";
import type { TemplateResource } from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";
import { TemplateCard } from "./template-card";
import { TemplateDetails } from "./template-details";
import { createSealosContext, createK8sContext } from "@/lib/auth/auth-utils";
import { useCreateProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { Component as ImageSlider } from "@/components/ui/image-auto-slider";

interface CreateProjectProps {
  closeDialog?: () => void;
}

export default function CreateProject({ closeDialog }: CreateProjectProps) {
  const templateApiContext = createSealosContext();
  const k8sContext = createK8sContext();

  const {
    templates,
    selectedTemplate,
    isLoading,
    error,
    handleViewDetails,
    handleBackToList,
  } = useTemplates(templateApiContext);

  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
    filteredTemplates,
  } = useTemplateSearch(templates);

  const createProjectMutation = useCreateProjectMutation(k8sContext);

  const generateProjectName = () => {
    const timestamp = Date.now().toString(36);
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `project-${timestamp}-${randomSuffix}`;
  };

  const handleCreateProject = () => {
    const projectName = generateProjectName();
    createProjectMutation.mutate(
      { name: projectName },
      {
        onSuccess: () => {
          // Close the dialog after successful project creation
          if (closeDialog) {
            closeDialog();
          }
        },
      }
    );
  };

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

  // If a template is selected, show the details view
  if (selectedTemplate) {
    return (
      <TemplateDetails onBack={handleBackToList} template={selectedTemplate} />
    );
  }

  return (
    <>
      {/* ===== Content ===== */}
      <Main className="h-full w-full gap-4" fixed>
        <div className="flex items-start justify-between">
          <div className="gap-2">
            <h1 className="font-bold text-2xl tracking-tight">Deploy an app</h1>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto gap-4 scrollbar-hide scroll-smooth">
          {/* Image slider at the top */}
          <div className="w-full h-[256px] rounded-xl mb-4">
            <ImageSlider />
          </div>

          {/* Fixed search and categories bar */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 gap-4 py-2">
            <div className="my-4 flex items-end justify-between sm:my-0 sm:items-center">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-9 w-40 pl-9 lg:w-[300px]"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter templates..."
                  value={searchTerm}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className={`h-9 transition-all duration-200 ${
                    selectedCategory === "all"
                      ? "border border-theme-blue/30 shadow-[0_0_4px_rgba(59,130,246,0.3)]"
                      : "border border-transparent"
                  }`}
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`h-9 transition-all duration-200 ${
                      selectedCategory === category
                        ? "border border-theme-blue/30 shadow-[0_0_4px_rgba(59,130,246,0.3)]"
                        : "border border-transparent"
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Templates grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {filteredTemplates.map((template: TemplateResource) => (
              <TemplateCard
                key={template.metadata.name}
                onViewDetails={handleViewDetails}
                template={template}
              />
            ))}
          </div>
          {filteredTemplates.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              No templates found matching your criteria
            </div>
          )}
        </div>
      </Main>
    </>
  );
}
