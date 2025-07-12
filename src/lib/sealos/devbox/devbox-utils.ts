"use client";

import type { DevboxListResponse } from "./schemas";
import { DevboxApiContextSchema } from "./schemas";
import { use } from "react";
import { AuthContext } from "@/contexts/auth-context/auth-context";
import { nanoid } from "nanoid";

export function createDevboxContext() {
  const { user } = use(AuthContext);
  if (!user) {
    throw new Error("User not found");
  }
  return DevboxApiContextSchema.parse({
    baseURL: user.regionUrl,
    authorization: user.kubeconfig,
    authorizationBearer: user.devboxToken,
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
  return `devbox-${nanoid(12)}`;
}
