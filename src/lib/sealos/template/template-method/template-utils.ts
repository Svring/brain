"use client";

import { TemplateApiContextSchema } from "../schemas/template-api-context-schemas";
import { useAuthState } from "@/contexts/auth/auth-context";

export function createTemplateApiContext() {
  const { auth } = useAuthState();
  if (!auth) {
    throw new Error("User not found");
  }
  return TemplateApiContextSchema.parse({
    baseURL: auth.regionUrl,
    authorization: auth.kubeconfig,
  });
}
