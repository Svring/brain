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
  // Get default values from schema
  const schemaDefaults = devboxCreateFormSchema.parse({});
  
  const form = useForm<DevboxCreateFormData>({
    resolver: zodResolver(devboxCreateFormSchema),
    defaultValues: {
      ...schemaDefaults,
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
