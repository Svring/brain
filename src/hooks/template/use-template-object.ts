"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  TemplateApiContext,
  TemplateResponseV1,
} from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";
import { getTemplateOptions } from "@/lib/sealos/resources/template/template-method/template-query";

export function useTemplateObject(
  context: TemplateApiContext,
  templateName: string
) {
  const {
    data: templateResponse,
    isLoading,
    error,
  } = useQuery({
    ...getTemplateOptions(context, templateName),
    enabled: !!templateName && !!context.baseUrl,
  });

  const template = useMemo(
    () => templateResponse as TemplateResponseV1 | undefined,
    [templateResponse]
  );

  return {
    template,
    isLoading,
    error,
  };
}
