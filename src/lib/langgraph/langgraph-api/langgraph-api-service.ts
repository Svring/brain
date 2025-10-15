"use server";

import type { RunsInvokePayload } from "@langchain/langgraph-sdk";
import { Client, type Metadata } from "@langchain/langgraph-sdk";
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
	if (metadata.resourceTarget !== null) {
		metadata.resourceTarget = JSON.stringify(metadata.resourceTarget);
	} else {
		metadata.resourceTarget = null;
	}

	const createOptions: any = {
		metadata,
		graphId: process.env.LANGGRAPH_GRAPH_ID,
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

export const updateThreadState = async (
	threadId: string,
	values: any,
	asNode: string,
) => {
	const client = createClient();
	return await client.threads.updateState(threadId, { values });
};

export const deleteThread = async (threadId: string) => {
	const client = createClient();
	return await client.threads.delete(threadId);
};

export const patchThread = async (threadId: string, metadata: Metadata) => {
	const apiUrl = process.env["LANGGRAPH_DEPLOYMENT_URL"];
	if (!apiUrl) {
		throw new Error("LANGGRAPH_DEPLOYMENT_URL environment variable is not set");
	}

	// console.log("[patchThread] Patching thread", { threadId, metadata });

	try {
		const response = await fetch(`${apiUrl}/threads/${threadId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				metadata: metadata,
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();
		// console.log("[patchThread] Patch result", result);
		return result;
	} catch (error) {
		console.error("[patchThread] Error patching thread", error);
		throw error;
	}
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
				searchMetadata.resourceTarget,
			);
		}
	}

	// console.log("searchMetadata", searchMetadata);

	const res = await client.threads
		.search({
			metadata: searchMetadata,
			sortBy: "updated_at",
			sortOrder: "desc",
			limit: 20,
		})
		.then((res) => {
			return res.filter((obj) => obj.values);
		});

	// console.log("res", res);

	return res;
};

export const getThreadState = async (threadId: string) => {
	const client = createClient();
	return await client.threads.getState(threadId);
};

export const getThreadStateAtCheckpoint = async (
	threadId: string,
	checkpointId: string,
	subgraphs?: boolean,
) => {
	const client = createClient();
	const options: any = {};
	if (subgraphs !== undefined) {
		options.subgraphs = subgraphs;
	}
	return await client.threads.getState(threadId, checkpointId, options);
};

export const threadRunStream = async (
	threadId: string,
	assistantId: string,
	payload?: RunsInvokePayload,
) => {
	const client = createClient();
	return await client.runs.stream(threadId, assistantId, {
		...payload,
		streamMode: "updates",
		// messages-tuple
	});
};

export const statelessRunWait = async (
	payload?: RunsInvokePayload,
) => {
	const client = createClient();
	return await client.runs.wait(null, "orca", payload);
};
