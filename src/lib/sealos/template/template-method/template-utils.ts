"use client";

import { TemplateApiContextSchema } from "../schemas/template-api-context-schemas";
import { useAuthContext } from "@/contexts/auth-context/auth-context";

export function createTemplateApiContext() {
  const { auth } = useAuthContext();
  if (!auth) {
    throw new Error("User not found");
  }
  return TemplateApiContextSchema.parse({
    baseURL: auth.regionUrl,
    authorization: auth.kubeconfig,
  });
}