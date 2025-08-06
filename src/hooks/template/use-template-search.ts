"use client";

import { useMemo, useState } from "react";
import type { TemplateResource } from "@/lib/sealos/template/schemas/template-api-context-schemas";

export function useTemplateSearch(templates: TemplateResource[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Extract all unique categories from templates
  const categories = useMemo(() => {
    const allCategories = templates.flatMap(
      (template) => template.spec.categories || []
    );
    const uniqueCategories = Array.from(new Set(allCategories)).sort();
    return uniqueCategories;
  }, [templates]);

  // Filter templates based on search term and category
  const filteredTemplates = useMemo(() => {
    return templates.filter((template: TemplateResource) => {
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
  }, [templates, searchTerm, selectedCategory]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
    filteredTemplates,
  };
}