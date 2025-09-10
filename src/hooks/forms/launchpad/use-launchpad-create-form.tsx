"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray } from "react-hook-form";
import {
  launchpadCreateFormSchema,
  LaunchpadCreateFormData,
} from "@/schemas/forms/launchpad/launchpad-create-form-schema";

export const useLaunchpadCreateForm = (
  defaultValues?: Partial<LaunchpadCreateFormData>
) => {
  // Get default values from schema
  const schemaDefaults = launchpadCreateFormSchema.parse({});
  
  const form = useForm<LaunchpadCreateFormData>({
    resolver: zodResolver(launchpadCreateFormSchema),
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

  const envFieldArray = useFieldArray({
    control: form.control,
    name: "env",
  });

  const storageFieldArray = useFieldArray({
    control: form.control,
    name: "storage",
  });

  const configMapFieldArray = useFieldArray({
    control: form.control,
    name: "configMap",
  });

  return {
    form,
    portsFieldArray,
    envFieldArray,
    storageFieldArray,
    configMapFieldArray,
  };
};
