"use client";

import { use } from "react";
import { AuthContext } from "@/contexts/auth-context";

function getUserKubeconfig(): string | undefined {
  const { user } = use(AuthContext);
  return user?.kubeconfig;
}

export function getDecodedKubeconfig(): string {
  const kc = getUserKubeconfig();
  if (!kc) {
    throw new Error("Kubeconfig not available");
  }
  return decodeURIComponent(kc);
}
