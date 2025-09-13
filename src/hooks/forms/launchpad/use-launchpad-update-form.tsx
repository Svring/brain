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
    defaultValues: defaultValues || {},
    mode: "onChange",
  });

  // Field arrays for dynamic fields
  const portsFieldArray = useFieldArray({
    control: form.control,
    name: "ports",
  });

  const simplePortsFieldArray = useFieldArray({
    control: form.control,
    name: "simplePorts",
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
    simplePortsFieldArray,
    envFieldArray,
    storageFieldArray,
    configMapFieldArray,
  };
};