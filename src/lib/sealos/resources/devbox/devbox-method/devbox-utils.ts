import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import {
  getOrCreateEnvFile,
  EnvVarValue,
} from "@/lib/sealos/services/env/devbox/devbox-env-utils";
import { SSHConfig } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-query-schema";

/**
 * Generates a random string of lowercase alphabets
 * @param length - The length of the random string (default: 5)
 * @returns A random string of lowercase alphabets
 */
function generateRandomString(length: number = 5): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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
 * Fetches environment variables from the remote .env file via SSH
 * @param ssh - The SSH configuration object
 * @returns Array of environment variables in EnvVarValue format
 */
export const enrichEnvWithSsh = async (
  ssh: SSHConfig
): Promise<EnvVarValue[]> => {
  try {
    const envVars = await getOrCreateEnvFile(ssh);
    return envVars;
  } catch (error) {
    // If SSH connection fails, return empty array
    console.warn(
      `Failed to fetch environment variables via SSH: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return [];
  }
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
 * Converts camelCase IDE names to kebab-case format
 * @param ide - The IDE identifier in camelCase
 * @returns The IDE identifier in kebab-case format
 */
const convertIdeToKebabCase = (ide: string): string => {
  // Handle specific mappings
  if (ide === "traeCN") return "trae-cn";
  if (ide === "vscodeInsiders") return "vscode-insiders";

  // Convert camelCase to kebab-case for other cases
  return ide.replace(/([A-Z])/g, "-$1").toLowerCase();
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
  const kebabCaseIde = convertIdeToKebabCase(ide);
  const userName = encodeURIComponent(ssh.user);
  const regionUrl = encodeURIComponent(context.regionUrl);
  const sshPort = encodeURIComponent(ssh.port);
  const base64PrivateKey = ssh.privateKey
    ? encodeURIComponent(btoa(ssh.privateKey))
    : "";
  const namespace = encodeURIComponent(context.namespace);
  const workingDir = encodeURIComponent(ssh.workingDir);

  return `${kebabCaseIde}://labring.devbox-aio?sshDomain=${`${userName}@${regionUrl}`}&sshPort=${sshPort}&base64PrivateKey=${base64PrivateKey}&sshHostLabel=${`${regionUrl}_${namespace}_${devboxName}`}&workingDir=${workingDir}&token=${token}`;
};

/**
 * Converts a devbox resource to a simplified list item with only essential fields
 * @param devboxResource - The full devbox K8s resource object
 * @returns A simplified devbox list item with name, kind, status, image, and inProject
 */
export const convertDevboxToSimplifiedList = (devboxResource: K8sResource) => {
  return {
    name: devboxResource.metadata?.name,
    kind: devboxResource.kind,
    status: devboxResource.status?.phase,
    image: devboxResource.spec?.image,
    inProject:
      devboxResource.metadata?.labels?.["cloud.sealos.io/deploy-on-sealos"],
  };
};

/**
 * Converts an array of devbox resources to a simplified list
 * @param devboxResources - Array of full devbox resource objects
 * @returns Array of simplified devbox list items
 */
export const convertDevboxListToSimplified = (
  devboxResources: K8sResource[]
) => {
  return devboxResources.map(convertDevboxToSimplifiedList);
};

/**
 * Generates an automatic name for a devbox resource
 * @param prefix - Optional prefix for the name (default: 'devbox')
 * @returns A generated name in the format 'devbox-XXXXX' where XXXXX is random lowercase alphabets
 */
export const generateDevboxName = (prefix: string = "devbox"): string => {
  const randomString = generateRandomString(5);
  return `${prefix}-${randomString}`;
};

/**
 * Maps runtime names to supported API runtime names
 * @param runtime - The runtime name to map
 * @returns The mapped runtime name for API calls
 */
export const mapRuntimeToEnum = (runtime: string): string => {
  // Map the runtime to supported API runtime names
  const runtimeMap: Record<string, string> = {
    // Direct matches with new API names
    nuxt3: "nuxt3",
    angular: "angular",
    quarkus: "quarkus",
    ubuntu: "ubuntu",
    flask: "flask",
    java: "java",
    chi: "chi",
    net: "net",
    iris: "iris",
    hexo: "hexo",
    python: "python",
    docusaurus: "docusaurus",
    vitepress: "vitepress",
    cpp: "cpp",
    vue: "vue",
    nginx: "nginx",
    rocket: "rocket",
    "debian-ssh": "debian-ssh",
    "vert.x": "vert.x",
    "express.js": "express.js",
    django: "django",
    "next.js": "next.js",
    sealaf: "sealaf",
    go: "go",
    react: "react",
    php: "php",
    svelte: "svelte",
    c: "c",
    astro: "astro",
    umi: "umi",
    gin: "gin",
    echo: "echo",
    rust: "rust",
    // Legacy mappings for backward compatibility
    "Node.js": "next.js",
    Python: "python",
    Java: "java",
    Go: "go",
    Rust: "rust",
    PHP: "php",
    Debian: "debian-ssh",
    "C++": "cpp",
    ".Net": "net",
    C: "c",
    "Spring Boot": "java",
    Django: "django",
    "Express.js": "express.js",
    "Next.js": "next.js",
    Nuxt3: "nuxt3",
    "Vue.js": "vue",
    React: "react",
    Angular: "angular",
    Svelte: "svelte",
    VitePress: "vitepress",
    Docusaurus: "docusaurus",
    Hexo: "hexo",
    Astro: "astro",
    UmiJS: "umi",
    Echo: "echo",
    Gin: "gin",
    Iris: "iris",
    Chi: "chi",
    Rocket: "rocket",
    Quarkus: "quarkus",
    "Vert.x": "vert.x",
    Hugo: "go",
    Nginx: "nginx",
    MCP: "python",
    Ubuntu: "ubuntu",
  };
  return runtimeMap[runtime] || "python";
};
