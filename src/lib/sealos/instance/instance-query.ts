"use client";

import { queryOptions } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import { listTemplates } from "./instance-old-api";
import type {
  InstanceApiContext,
  ListTemplateResponse,
} from "./schemas/instance-api-context-schemas";

export const listTemplatesOptions = (
  context: InstanceApiContext,
  postprocess?: (data: ListTemplateResponse) => unknown
) =>
  queryOptions({
    queryKey: ["sealos", "instance", "templates", "list"],
    queryFn: () => runParallelAction(listTemplates(context)),
    select: (data) => postprocess?.(data) ?? data,
    enabled: !!context.baseURL,
  });
