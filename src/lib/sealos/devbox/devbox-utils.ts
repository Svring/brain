"use client";

import { use } from "react";
import { AuthContext } from "@/contexts/auth-context";
import { DevboxApiContextSchema } from "./schemas";

export const getDevboxAPIContext = () => {
  const { user } = use(AuthContext);
  return DevboxApiContextSchema.parse({
    baseURL: `${user?.regionUrl}`,
    authorization: `${user?.kubeconfig}`,
    authorizationBearer: `${user?.devboxToken}`,
  });
};
