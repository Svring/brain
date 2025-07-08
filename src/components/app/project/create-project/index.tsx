"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Main } from "@/components/layout/main";
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
import { useTemplates } from "@/hooks/app/project/use-templates";
import type {
  ListTemplateResponse,
  TemplateResource,
} from "@/lib/sealos/instance/schemas/instance-api-context-schemas";

export default function CreateProject() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: templatesResponse, isLoading, error } = useTemplates();
  const templates =
    (templatesResponse as ListTemplateResponse)?.data?.templates ?? [];

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

  const handleDeploy = (templateName: string) => {
    // Future: Handle template deployment
    // TODO: Implement template deployment logic
    // For now, we'll just ignore the templateName parameter
    return templateName;
  };

  return (
    <>
      {/* ===== Content ===== */}
      <Main className="h-full w-full" fixed>
        <div>
          <h1 className="font-bold text-2xl tracking-tight">
            Create New Project
          </h1>
          <p className="text-muted-foreground">
            Choose from available templates to create your project or create an
            empty project
          </p>
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
        <ul className="faded-bottom no-scrollbar grid gap-4 overflow-auto pt-4 pb-16 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template: TemplateResource) => (
            <li
              className="cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md"
              key={template.metadata.name}
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted p-2">
                  {template.spec.icon ? (
                    <Image
                      alt={`${template.spec.title} icon`}
                      className="size-6"
                      height={24}
                      src={template.spec.icon}
                      width={24}
                    />
                  ) : (
                    <div className="size-6 rounded bg-gray-300" />
                  )}
                </div>
                <Button
                  onClick={() => handleDeploy(template.metadata.name)}
                  size="sm"
                  variant="outline"
                >
                  Deploy
                </Button>
              </div>
              <div>
                <h2 className="mb-1 font-semibold">{template.spec.title}</h2>
                <p className="line-clamp-2 text-gray-500">
                  {template.spec.description || "No description available"}
                </p>
                {template.spec.categories &&
                  template.spec.categories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.spec.categories
                        .slice(0, 3)
                        .map((category: string) => (
                          <button
                            className="cursor-pointer rounded-full border-none bg-gray-100 px-2 py-1 text-gray-700 text-xs hover:bg-gray-200"
                            key={category}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCategory(category);
                            }}
                            type="button"
                          >
                            {category}
                          </button>
                        ))}
                    </div>
                  )}
              </div>
            </li>
          ))}
        </ul>
        {filteredTemplates.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No templates found matching your criteria
          </div>
        )}
      </Main>
    </>
  );
}
