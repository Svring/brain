"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  ListTemplateResponse,
  TemplateResource,
  TemplateApiContext,
  TemplateSourceResponse,
} from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";
import {
  listTemplatesOptions,
  getTemplateSourceOptions,
} from "@/lib/sealos/resources/template/template-method/template-query";

export function useTemplates(context: TemplateApiContext) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateResource | null>(null);
  const [selectedTemplateName, setSelectedTemplateName] = useState<
    string | null
  >(null);

  const {
    data: templatesResponse,
    isLoading,
    error,
  } = useQuery(listTemplatesOptions(context));

  const templates = useMemo(
    () => (templatesResponse as ListTemplateResponse)?.data?.templates ?? [],
    [templatesResponse]
  );

  const {
    data: templateSourceResponse,
    isLoading: isTemplateSourceLoading,
    error: templateSourceError,
  } = useQuery({
    ...getTemplateSourceOptions(context, selectedTemplateName || ""),
    enabled: !!selectedTemplateName && !!context.baseUrl,
  });

  console.log("templateSourceResponse", templateSourceResponse);

  const templateSource = useMemo(
    () => templateSourceResponse as TemplateSourceResponse | undefined,
    [templateSourceResponse]
  );

  const handleViewDetails = (template: TemplateResource) => {
    setSelectedTemplate(template);
  };

  const handleBackToList = () => {
    setSelectedTemplate(null);
    setSelectedTemplateName(null);
  };

  const getTemplateSource = (templateName: string) => {
    setSelectedTemplateName(templateName);
  };

  return {
    templates,
    selectedTemplate,
    templateSource,
    isLoading,
    isTemplateSourceLoading,
    error,
    templateSourceError,
    handleViewDetails,
    handleBackToList,
    getTemplateSource,
  };
}
