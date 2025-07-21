"use client";

import type { DevboxListResponse } from "./schemas";
import { DevboxApiContextSchema } from "./schemas";
import { nanoid } from "nanoid";
import { useAuthState } from "@/contexts/auth-context/auth-context";

export function createDevboxContext() {
  const { auth } = useAuthState();
  if (!auth) {
    throw new Error("User not found");
  }
  return DevboxApiContextSchema.parse({
    baseURL: auth.regionUrl,
    authorization: auth.kubeconfig,
    authorizationBearer: auth.appToken,
  });
}

/**
 * Transform a DevboxListResponse into an array of devbox names (string[]).
 */
export const transformDevboxListToNameList = (
  listData: DevboxListResponse | undefined
): string[] => {
  return listData?.data?.map((item) => item.name) ?? [];
};

export function generateDevboxName() {
  return `devbox-${nanoid(12)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")}`;
}
