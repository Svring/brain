"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  clusterUpdateFormSchema,
  ClusterUpdateFormData,
} from "@/schemas/forms/cluster/cluster-update-form-schema";

export const useClusterUpdateForm = (
  defaultValues?: Partial<ClusterUpdateFormData>
) => {
  const form = useForm<ClusterUpdateFormData>({
    resolver: zodResolver(clusterUpdateFormSchema),
    defaultValues,
    mode: "onChange",
  });

  return {
    form,
  };
};
