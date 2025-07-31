import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { DevboxApiContextSchema } from "@/lib/sealos/devbox/devbox-schemas/devbox-api-context-schema";
import { useAuthState } from "@/contexts/auth/auth-context";

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

interface SshConfig {
  host: string | null;
  port: number;
  user: string;
  workingDir: string;
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

/**
 * Transforms a Docker image URL to extract only the image name
 * @param imageUrl - The full Docker image URL (e.g., 'ghcr.io/labring-actions/devbox/cpp-gcc-12.2.0:13aacd8')
 * @returns The extracted image name (e.g., 'cpp-gcc-12.2.0')
 */
export const transformDevboxImage = (imageUrl: string): string => {
  // Split by '/' to get the last part which contains the image name and tag
  const parts = imageUrl.split("/");
  const imageWithTag = parts[parts.length - 1];

  // Split by ':' to remove the tag and get only the image name
  const imageName = imageWithTag.split(":")[0];

  return imageName;
};

/**
 * Composes an SSH connection URI for devbox IDE integration
 * @param ide - The IDE identifier
 * @param context - The K8s API context containing region and namespace info
 * @param ssh - The SSH configuration object
 * @param devboxName - The name of the devbox
 * @param token - The authentication token
 * @returns The composed SSH connection URI
 */
export const composeSshConnectionUri = (
  ide: string,
  context: K8sApiContext,
  ssh: SshConfig,
  devboxName: string,
  token: string
): string => {
  const userName = encodeURIComponent(ssh.user);
  const regionUrl = encodeURIComponent(context.regionUrl);
  const sshPort = encodeURIComponent(ssh.port);
  const base64PrivateKey = ssh.privateKey
    ? encodeURIComponent(btoa(ssh.privateKey))
    : "";
  const namespace = encodeURIComponent(context.namespace);
  const workingDir = encodeURIComponent(ssh.workingDir);

  return `${ide}://labring.devbox-aio?sshDomain=${`${userName}@${regionUrl}`}&sshPort=${sshPort}&base64PrivateKey=${base64PrivateKey}&sshHostLabel=${`${regionUrl}_${namespace}_${devboxName}`}&workingDir=${workingDir}&token=${token}`;
};
