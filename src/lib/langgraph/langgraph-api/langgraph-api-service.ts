"use server";

import https from "node:https";
import type { RunsInvokePayload } from "@langchain/langgraph-sdk";
import { Client, type Metadata } from "@langchain/langgraph-sdk";
import axios from "axios";

const createClient = () => {
	const apiUrl = process.env.LANGGRAPH_DEPLOYMENT_URL;
	return new Client({
		apiUrl,
		defaultHeaders: {
			"x-secret": process.env.LANGGRAPH_SECRET || "",
		},
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
			as_node: string;
		}>;
	}>;
}) => {
	const apiUrl = process.env.LANGGRAPH_DEPLOYMENT_URL;
	if (!apiUrl) {
		throw new Error("LANGGRAPH_DEPLOYMENT_URL environment variable is not set");
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

	metadata.graph_id = "orca";

	const payload: any = {
		metadata,
		if_exists: "raise",
	};

	// Add supersteps if provided
	if (supersteps) {
		payload.supersteps = supersteps;
	}

	try {
		// Create HTTPS agent that rejects unauthorized certificates
		const httpsAgent = new https.Agent({
			rejectUnauthorized: false,
		});

		const response = await axios.post(`${apiUrl}/threads`, payload, {
			headers: {
				"Content-Type": "application/json",
				"x-secret": process.env.LANGGRAPH_SECRET || "",
			},
			httpsAgent,
		});

		const thread = response.data;
		return thread;
	} catch (error) {
		console.error("[createThread] Error creating thread", error);
		throw error;
	}
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
	const apiUrl = process.env.LANGGRAPH_DEPLOYMENT_URL;
	if (!apiUrl) {
		throw new Error("LANGGRAPH_DEPLOYMENT_URL environment variable is not set");
	}

	const payload: any = {
		values: values || [],
	};

	// Add as_node if provided
	if (asNode) {
		payload.as_node = asNode;
	}

	try {
		// Create HTTPS agent that rejects unauthorized certificates
		const httpsAgent = new https.Agent({
			rejectUnauthorized: false,
		});

		const response = await axios.post(
			`${apiUrl}/threads/${threadId}/state`,
			payload,
			{
				headers: {
					"Content-Type": "application/json",
					"x-secret": process.env.LANGGRAPH_SECRET || "",
				},
				httpsAgent,
			},
		);

		return response.data;
	} catch (error) {
		console.error("[updateThreadState] Error updating thread state", error);
		throw error;
	}
};

export const deleteThread = async (threadId: string) => {
	const client = createClient();
	return await client.threads.delete(threadId);
};

export const patchThread = async (threadId: string, metadata: Metadata) => {
	const apiUrl = process.env.LANGGRAPH_DEPLOYMENT_URL;
	if (!apiUrl) {
		throw new Error("LANGGRAPH_DEPLOYMENT_URL environment variable is not set");
	}

	// console.log("[patchThread] Patching thread", { threadId, metadata });

	try {
		// Create HTTPS agent that rejects unauthorized certificates
		const httpsAgent = new https.Agent({
			rejectUnauthorized: false,
		});

		const response = await axios.patch(
			`${apiUrl}/threads/${threadId}`,
			{
				metadata: metadata,
			},
			{
				headers: {
					"Content-Type": "application/json",
					"x-secret": process.env.LANGGRAPH_SECRET || "",
				},
				httpsAgent,
			},
		);

		// console.log("[patchThread] Patch result", response.data);
		return response.data;
	} catch (error) {
		console.error("[patchThread] Error patching thread", error);
		throw error;
	}
};

export const searchThreads = async (metadata: Record<string, any>) => {
	const apiUrl = process.env.LANGGRAPH_DEPLOYMENT_URL;
	if (!apiUrl) {
		throw new Error("LANGGRAPH_DEPLOYMENT_URL environment variable is not set");
	}

	const searchMetadata: Record<string, any> = {
		...metadata,
		graph_id: metadata.graph_id,
	};

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

	const payload: any = {
		metadata: searchMetadata,
		sort_by: "updated_at",
		sort_order: "desc",
		limit: 20,
	};

	// console.log("searchMetadata", searchMetadata);

	try {
		// Create HTTPS agent that rejects unauthorized certificates
		const httpsAgent = new https.Agent({
			rejectUnauthorized: false,
		});

		const response = await axios.post(`${apiUrl}/threads/search`, payload, {
			headers: {
				"Content-Type": "application/json",
				"x-secret": process.env.LANGGRAPH_SECRET || "",
			},
			httpsAgent,
		});

		const res = response.data.filter((obj: any) => obj.values);

		// console.log("res", res);

		return res;
	} catch (error) {
		console.error("[searchThreads] Error searching threads", error);
		throw error;
	}
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

export const statelessRunWait = async (payload?: RunsInvokePayload) => {
	const client = createClient();
	return await client.runs.wait(null, "orca", payload);
};
