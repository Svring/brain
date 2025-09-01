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
  const form = useForm<ClusterCreateFormData>({
    resolver: zodResolver(clusterCreateFormSchema),
    defaultValues: {
      name: "my-cluster",
      type: {
        type: "kubernetes",
      },
      version: {
        version: "1.28",
      },
      resource: {
        replicas: 1,
        cpu: 2,
        memory: 4,
        storage: 20,
      },
      ...defaultValues,
    },
    mode: "onChange",
  });

  return {
    form,
  };
};
