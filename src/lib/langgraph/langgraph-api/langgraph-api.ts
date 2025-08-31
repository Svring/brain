import { Client, ThreadState } from "@langchain/langgraph-sdk";
import { createHash } from "crypto"; // Import the crypto module

const createClient = () => {
  const apiUrl = process.env["NEXT_PUBLIC_LANGGRAPH_DEPLOYMENT_URL"];
  return new Client({
    apiUrl,
  });
};

export const createThread = async ({
  kubeconfig,
  projectName,
  resourceName,
}: {
  kubeconfig: string;
  projectName?: string;
  resourceName?: string;
}) => {
  const client = createClient();

  // Hash the kubeconfig using SHA-256
  const kubeconfigHash = createHash("sha256").update(kubeconfig).digest("hex");

  // Store the hash in metadata instead of the plain kubeconfig
  const metadata: Record<string, any> = { kubeconfigHash };
  if (projectName) {
    metadata.projectName = projectName;
  }
  if (resourceName) {
    metadata.resourceName = resourceName;
  }

  return await client.threads.create({
    metadata,
  });
};

export const listThreads = async () => {
  const client = createClient();
  return await client.threads.search({ limit: 10 });
};

export const getThread = async (threadId: string) => {
  const client = createClient();
  return await client.threads.get(threadId);
};

export const searchThreads = async (metadata: Record<string, any>) => {
  const client = createClient();

  // Convert kubeconfig to kubeconfigHash if present
  const searchMetadata = { ...metadata };
  if (searchMetadata.kubeconfig) {
    const kubeconfigHash = createHash("sha256")
      .update(searchMetadata.kubeconfig)
      .digest("hex");
    searchMetadata.kubeconfigHash = kubeconfigHash;
    delete searchMetadata.kubeconfig;
  }

  return await client.threads
    .search({
      metadata: searchMetadata,
      sortBy: "created_at",
      sortOrder: "desc",
      limit: 5,
    })
    .then((res) => {
      return res.filter((obj) => obj.values !== null);
    });
};
