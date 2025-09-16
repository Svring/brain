"use server";

import { Client } from "@langchain/langgraph-sdk";
import { createHash } from "crypto"; // Import the crypto module

const createClient = () => {
  const apiUrl = process.env["LANGGRAPH_DEPLOYMENT_URL"];
  return new Client({
    apiUrl,
  });
};

export const createThread = async ({
  metadata,
  supersteps,
}: {
  metadata: Record<string, any>;
  supersteps?: Array<{
    updates: Array<{
      values: Record<string, any>;
      asNode: string;
    }>;
  }>;
}) => {
  const client = createClient();

  // Process kubeconfig if present in metadata
  if (metadata.kubeconfig) {
    // URL decode the kubeconfig before hashing
    const decodedKubeconfig = decodeURIComponent(metadata.kubeconfig);
    const kubeconfigHash = createHash("sha256")
      .update(decodedKubeconfig)
      .digest("hex");

    // Replace kubeconfig with kubeconfigHash
    metadata.kubeconfigHash = kubeconfigHash;
    delete metadata.kubeconfig;
  }

  // Ensure projectName is set to null if undefined
  if (metadata.projectName === undefined) {
    metadata.projectName = null;
  }

  // Process resourceTarget if present in metadata
  if (
    metadata.resourceTarget !== undefined ||
    metadata.resourceTarget !== null
  ) {
    metadata.resourceTarget = JSON.stringify(metadata.resourceTarget);
  } else {
    metadata.resourceTarget = null;
  }

  const createOptions: any = {
    metadata,
    graphId: metadata.graph_id,
  };

  // Add supersteps if provided
  if (supersteps) {
    createOptions.supersteps = supersteps;
  }

  return await client.threads.create(createOptions);
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

export const deleteThread = async (threadId: string) => {
  const client = createClient();
  return await client.threads.delete(threadId);
};

export const searchThreads = async (metadata: Record<string, any>) => {
  const client = createClient();

  // Convert kubeconfig to kubeconfigHash if present, after URL decoding
  const searchMetadata: Record<string, any> = {
    ...metadata,
    graph_id: metadata.graph_id,
  };
  if (searchMetadata.kubeconfig) {
    const decodedKubeconfig = decodeURIComponent(searchMetadata.kubeconfig);
    const kubeconfigHash = createHash("sha256")
      .update(decodedKubeconfig)
      .digest("hex");
    searchMetadata.kubeconfigHash = kubeconfigHash;
    delete searchMetadata.kubeconfig;
  }

  // Handle resourceTarget if present - stringify it for search
  if (searchMetadata.resourceTarget !== undefined) {
    if (searchMetadata.resourceTarget === null) {
      // Keep null as is
      searchMetadata.resourceTarget = null;
    } else if (typeof searchMetadata.resourceTarget === "object") {
      searchMetadata.resourceTarget = JSON.stringify(
        searchMetadata.resourceTarget
      );
    }
  }

  return await client.threads
    .search({
      metadata: searchMetadata,
      sortBy: "updated_at",
      sortOrder: "desc",
    })
    .then((res) => {
      return res.filter((obj) => obj.values);
    });
};

export const getThreadState = async (threadId: string) => {
  const client = createClient();
  return await client.threads.getState(threadId);
};
