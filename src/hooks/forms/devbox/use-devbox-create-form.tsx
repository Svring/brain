"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray } from "react-hook-form";
import {
  devboxCreateFormSchema,
  DevboxCreateFormData,
} from "@/schemas/forms/devbox/devbox-create-form-schema";

export const useDevboxCreateForm = (
  defaultValues?: Partial<DevboxCreateFormData>
) => {
  const form = useForm<DevboxCreateFormData>({
    resolver: zodResolver(devboxCreateFormSchema),
    defaultValues: {
      name: "my-devbox",
      runtime: "python",
      resource: {
        cpu: 2,
        memory: 2,
      },
      ports: [
        {
          number: 80,
          protocol: "HTTP",
          exposesPublicDomain: true,
        },
      ],
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Field arrays for dynamic fields
  const portsFieldArray = useFieldArray({
    control: form.control,
    name: "ports",
  });

  return {
    form,
    portsFieldArray,
  };
};
