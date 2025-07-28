"use client";

import { useQuery } from "@tanstack/react-query";
import { TemplateApiContext } from "@/lib/sealos/template/schemas/template-api-context-schemas";
import { listTemplatesOptions } from "@/lib/sealos/template/template-method/template-query";

export function useProjectTemplates(context: TemplateApiContext) {
  return useQuery(listTemplatesOptions(context));
}
