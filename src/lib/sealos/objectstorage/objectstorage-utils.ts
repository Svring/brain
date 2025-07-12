"use client";

import { use } from "react";
import { AuthContext } from "@/contexts/auth-context/auth-context";
import { ObjectStorageApiContextSchema } from "./schemas/objectstorage-api-context-schemas";
import { nanoid } from "nanoid";

export function createObjectStorageContext() {
  const { user } = use(AuthContext);
  if (!user) {
    throw new Error("User not found");
  }
  return ObjectStorageApiContextSchema.parse({
    baseURL: user.regionUrl,
    authorization: user.kubeconfig,
  });
}

export function generateObjectStorageName() {
  return `bucket-${nanoid(12)}`;
}
