"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  ListTemplateResponse,
  TemplateResource,
  TemplateApiContext,
} from "@/lib/sealos/template/schemas/template-api-context-schemas";
import { listTemplatesOptions } from "@/lib/sealos/template/template-method/template-query";

export function useTemplates(context: TemplateApiContext) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateResource | null>(null);

  const {
    data: templatesResponse,
    isLoading,
    error,
  } = useQuery(listTemplatesOptions(context));

  const templates = (templatesResponse as ListTemplateResponse)?.data?.templates ?? [];

  const handleViewDetails = (template: TemplateResource) => {
    setSelectedTemplate(template);
  };

  const handleBackToList = () => {
    setSelectedTemplate(null);
  };

  return {
    templates,
    selectedTemplate,
    isLoading,
    error,
    handleViewDetails,
    handleBackToList,
  };
}