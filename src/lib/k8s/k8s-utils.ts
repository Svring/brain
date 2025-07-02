import { use } from "react";
import { AuthContext } from "@/contexts/auth-context";

export function getUserKubeconfig(): string | undefined {
  const { user } = use(AuthContext);
  return user?.kubeconfig;
}

export function getDecodedKubeconfig(kc: string): string {
  return decodeURIComponent(kc);
}
