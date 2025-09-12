"use server";

import { Client, ThreadState } from "@langchain/langgraph-sdk";
import { createHash } from "crypto"; // Import the crypto module
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
  ResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

const createClient = () => {
  const apiUrl = process.env["LANGGRAPH_DEPLOYMENT_URL"];
  // console.log("apiUrl", apiUrl);
  return new Client({
    apiUrl,
  });
};

export const createThread = async ({
  kubeconfig,
  projectName,
  resourceTarget,
}: {
  kubeconfig: string;
  projectName?: string;
  resourceTarget?: ResourceTarget | null;
}) => {
  const client = createClient();

  // URL decode the kubeconfig before hashing
  const decodedKubeconfig = decodeURIComponent(kubeconfig);
  const kubeconfigHash = createHash("sha256")
    .update(decodedKubeconfig)
    .digest("hex");

  // Store the hash in metadata instead of the plain kubeconfig
  const metadata: Record<string, any> = { kubeconfigHash };
  if (projectName) {
    metadata.projectName = projectName;
  }
  if (resourceTarget) {
    metadata.resourceTarget = JSON.stringify(resourceTarget);
  }

  return await client.threads.create({
    metadata,
    graphId: "orca",
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

export const updateThreadState = async (threadId: string, state: any) => {
  const client = createClient();
  return await client.threads.updateState(threadId, state);
};

export const searchThreads = async (metadata: Record<string, any>) => {
  const client = createClient();

  // Convert kubeconfig to kubeconfigHash if present, after URL decoding
  const searchMetadata: Record<string, any> = { ...metadata, graph_id: "orca" };
  if (searchMetadata.kubeconfig) {
    const decodedKubeconfig = decodeURIComponent(searchMetadata.kubeconfig);
    const kubeconfigHash = createHash("sha256")
      .update(decodedKubeconfig)
      .digest("hex");
    searchMetadata.kubeconfigHash = kubeconfigHash;
    delete searchMetadata.kubeconfig;
  }

  // Handle resourceTarget if present - stringify it for search
  if (
    searchMetadata.resourceTarget &&
    typeof searchMetadata.resourceTarget === "object"
  ) {
    searchMetadata.resourceTarget = JSON.stringify(
      searchMetadata.resourceTarget
    );
  }

  return await client.threads
    .search({
      metadata: searchMetadata,
      sortBy: "created_at",
      sortOrder: "desc",
    })
    .then((res) => {
      // console.log("res", res);
      return res.filter((obj) => obj.values);
    });
};

export const getThreadState = async (threadId: string) => {
  const client = createClient();
  return await client.threads.getState(threadId);
};
