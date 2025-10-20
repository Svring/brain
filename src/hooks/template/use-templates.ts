"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  ListTemplateResponse,
  TemplateResource,
  TemplateApiContext,
  TemplateResponseV1,
} from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";
import {
  listTemplatesOptions,
  getTemplateOptions,
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

  console.log("templatesResponse", templatesResponse);
  console.log("error", error);

  const templates = useMemo(
    () => (templatesResponse as ListTemplateResponse)?.data?.templates ?? [],
    [templatesResponse]
  );

  const {
    data: templateResponse,
    isLoading: isTemplateLoading,
    error: templateError,
  } = useQuery({
    ...getTemplateOptions(context, selectedTemplateName || ""),
    enabled: !!selectedTemplateName && !!context.baseUrl,
  });

  const template = useMemo(
    () => templateResponse as TemplateResponseV1 | undefined,
    [templateResponse]
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
    template,
    isLoading,
    isTemplateLoading,
    error,
    templateError,
    handleViewDetails,
    handleBackToList,
    getTemplateSource,
  };
}
