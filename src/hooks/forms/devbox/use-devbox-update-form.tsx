"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray } from "react-hook-form";
import { useEffect } from "react";
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

  // Initialize fieldArray with default values when they change
  useEffect(() => {
    if (defaultValues?.ports && defaultValues.ports.length > 0) {
      // Replace the fieldArray with the default values
      portsFieldArray.replace(defaultValues.ports);
    }
  }, [defaultValues?.ports]);

  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  return {
    form,
    portsFieldArray,
  };
};
