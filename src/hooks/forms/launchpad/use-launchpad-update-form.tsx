"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray } from "react-hook-form";
import {
  launchpadUpdateFormSchema,
  LaunchpadUpdateFormData,
} from "@/schemas/forms/launchpad/launchpad-update-form-schema";

export const useLaunchpadUpdateForm = (
  defaultValues?: Partial<LaunchpadUpdateFormData>
) => {
  const form = useForm<LaunchpadUpdateFormData>({
    resolver: zodResolver(launchpadUpdateFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Field arrays for dynamic fields
  const envFieldArray = useFieldArray({
    control: form.control,
    name: "env",
  });

  return {
    form,
    envFieldArray,
  };
};
