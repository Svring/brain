import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";

interface SshConfig {
  host: string | null;
  port: number;
  user: string;
  privateKey?: string;
}

/**
 * Enriches SSH configuration with the region URL from K8sApiContext
 * @param ssh - The SSH configuration object
 * @param context - The K8s API context containing the region URL
 * @returns The enriched SSH configuration with host field populated
 */
export const enrichSshWithRegionUrl = (
  ssh: SshConfig,
  context: K8sApiContext
): SshConfig => {
  return {
    ...ssh,
    host: context.regionUrl,
  };
};