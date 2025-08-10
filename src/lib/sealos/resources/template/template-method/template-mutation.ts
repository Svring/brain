"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import type { TemplateApiContext } from "../schemas/template-api-context-schemas";
import type { CreateInstanceRequest } from "../schemas/template-create-instance-schemas";
import { createInstance } from "../template-api/template-old-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import _ from "lodash";

export function useCreateInstanceMutation(context: TemplateApiContext) {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (request: CreateInstanceRequest) =>
      runParallelAction(createInstance(request, context)),
    onSuccess: (data: any) => {
      const projectName = _.get(data, "data[0].metadata.name");
      toast(`Template has been deployed to project "${projectName}".`);
      // router.replace(`/projects/${projectName}`);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
