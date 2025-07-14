"use client";

import { ObjectStorageApiContextSchema } from "./schemas/objectstorage-api-context-schemas";
import { nanoid } from "nanoid";
import { useAuthContext } from "@/contexts/auth-context/auth-context";

export function createObjectStorageContext() {
  const { auth } = useAuthContext();
  if (!auth) {
    throw new Error("User not found");
  }
  return ObjectStorageApiContextSchema.parse({
    baseURL: auth.regionUrl,
    authorization: auth.kubeconfig,
  });
}

export function generateObjectStorageName() {
  return `bucket-${nanoid(12)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")}`;
}
