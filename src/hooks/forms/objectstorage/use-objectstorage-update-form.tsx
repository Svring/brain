"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  objectStorageUpdateSchema,
  ObjectStorageUpdateFormData,
} from "@/schemas/forms/objectstorage/objectstorage-update-schema";

export const useObjectStorageUpdateForm = (
  defaultValues?: Partial<ObjectStorageUpdateFormData>
) => {
  const form = useForm<ObjectStorageUpdateFormData>({
    resolver: zodResolver(objectStorageUpdateSchema),
    defaultValues,
    mode: "onChange",
  });

  return {
    form,
  };
};
