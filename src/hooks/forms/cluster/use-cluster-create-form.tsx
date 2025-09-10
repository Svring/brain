"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  clusterCreateFormSchema,
  ClusterCreateFormData,
} from "@/schemas/forms/cluster/cluster-create-form-schema";

export const useClusterCreateForm = (
  defaultValues?: Partial<ClusterCreateFormData>
) => {
  // Get default values from schema
  const schemaDefaults = clusterCreateFormSchema.parse({});
  
  const form = useForm<ClusterCreateFormData>({
    resolver: zodResolver(clusterCreateFormSchema),
    defaultValues: {
      ...schemaDefaults,
      ...defaultValues,
    },
    mode: "onChange",
  });

  return {
    form,
  };
};
