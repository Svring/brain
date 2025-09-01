"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

  return {
    form,
  };
};
