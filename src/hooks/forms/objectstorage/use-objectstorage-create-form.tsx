"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  objectStorageCreateSchema,
  ObjectStorageCreateFormData,
} from "@/schemas/forms/objectstorage/objectstorage-create-schema";

export const useObjectStorageCreateForm = (
  defaultValues?: Partial<ObjectStorageCreateFormData>
) => {
  const form = useForm<ObjectStorageCreateFormData>({
    resolver: zodResolver(objectStorageCreateSchema),
    defaultValues: {
      name: "my-objectstorage",
      policy: "private",
      ...defaultValues,
    },
    mode: "onChange",
  });

  return {
    form,
  };
};
