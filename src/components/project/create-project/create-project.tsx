"use client";

import { useState } from "react";
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
import { useTemplates } from "@/hooks/template/use-templates";
import { useTemplateSearch } from "@/hooks/template/use-template-search";
import type { TemplateResource } from "@/lib/sealos/template/schemas/template-api-context-schemas";
import { TemplateCard } from "./template-card";
import { TemplateDetails } from "./template-details";
import { createSealosContext } from "@/lib/auth/auth-utils";

export default function CreateProject() {
  const templateApiContext = createSealosContext();

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
      <Main className="h-full w-full" fixed>
        <div className="flex items-start justify-between">
          <div className="gap-2">
            <h1 className="font-bold text-2xl tracking-tight">Deploy an app</h1>
            <p className="text-muted-foreground">
              Select from available app templates.
            </p>
          </div>
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
      </Main>
    </>
  );
}
