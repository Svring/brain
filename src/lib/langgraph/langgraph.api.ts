"use server";

import { Client, type Metadata, type Thread } from "@langchain/langgraph-sdk";

const createClient = () => {
	const apiUrl = process.env.LANGGRAPH_DEPLOYMENT_URL;
	return new Client({
		apiUrl,
	});
};

export const createThread = async ({
	metadata,
	supersteps,
}: {
	metadata: Metadata;
	supersteps?: Array<{
		updates: Array<{
			values: Record<string, any>;
			asNode: string;
		}>;
	}>;
}) => {
	const client = createClient();

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
) => {
	const client = createClient();
	return await client.threads.updateState(threadId, { values });
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
		return result;
	} catch (error) {
		console.error("[patchThread] Error patching thread", error);
		throw error;
	}
};

export const searchThreads = async (
	metadata: Record<string, any>,
): Promise<Thread[]> => {
	const client = createClient();

	const res = await client.threads
		.search({
			metadata,
			sortBy: "updated_at",
			sortOrder: "desc",
			limit: 20,
		})
		.then((res) => {
			return res.filter((obj) => obj.values);
		});

	return res;
};

export const getThreadState = async (threadId: string) => {
	const client = createClient();
	return await client.threads.getState(threadId);
};
