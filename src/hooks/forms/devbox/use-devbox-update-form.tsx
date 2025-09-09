"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray } from "react-hook-form";
import {
  devboxUpdateFormSchema,
  DevboxUpdateFormData,
} from "@/schemas/forms/devbox/devbox-update-form-schema";

export const useDevboxUpdateForm = (
  defaultValues?: Partial<DevboxUpdateFormData>
) => {
  const form = useForm<DevboxUpdateFormData>({
    resolver: zodResolver(devboxUpdateFormSchema),
    defaultValues,
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

  return {
    form,
    portsFieldArray,
    simplePortsFieldArray,
  };
};
