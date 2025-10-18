"use client";

import type { Message } from "@langchain/langgraph-sdk";
import { useStream } from "@langchain/langgraph-sdk/react";
import { useMount } from "@reactuses/core";
import type { ReactNode } from "react";
import { createContext, use, useCallback, useState } from "react";
import { v4 as uuid } from "uuid";
import { createThread } from "@/lib/langgraph/langgraph.api";
import { useEnvState } from "../env/env.context";

interface CopilotTrialAdapterContextValue {
	submitWithContext: (data: { messages: Message[] }) => void;
	isLoading: boolean;
	stop: () => void;
	messages: Message[];
	hasMessages: boolean;
	token: string;
	threadId?: string;
	createNewThread: () => void;
}

export const copilotTrialAdapterContext = createContext<
	CopilotTrialAdapterContextValue | undefined
>(undefined);

interface CopilotTrialAdapterProps {
	children: ReactNode;
}

export function CopilotTrialAdapter({ children }: CopilotTrialAdapterProps) {
	const { variables } = useEnvState();
	const [token, setToken] = useState(() => uuid());
	const [threadId, setThreadId] = useState<string | undefined>(undefined);

	// Create new thread function
	const createNewThread = async () => {
		const newToken = uuid();
		setToken(newToken);
		try {
			const data = await createThread({ metadata: { token: newToken } });
			setThreadId(data.thread_id);
		} catch (error) {
			console.error("Failed to create trial thread:", error);
		}
	};

	// Create new thread on mount
	useMount(() => {
		createNewThread();
	});

	// Use stream hook directly
	const { submit, isLoading, stop, messages } = useStream({
		apiUrl: variables?.LANGGRAPH_DEPLOYMENT_URL || "",
		assistantId: variables?.LANGGRAPH_GRAPH_ID || "",
		threadId: threadId || undefined,
		messagesKey: "messages",
		reconnectOnMount: true,
	});

	const submitWithContext = useCallback(
		(data: { messages: Message[] }) => {
			return submit(
				{
					stage: "deploy_project",
					trial: true,
					messages: data.messages,
				},
				{
					optimisticValues(prev) {
						const prevMessages = prev.messages ?? [];
						// @ts-expect-error Suppress iterable type error for newMessages
						const newMessages = [...prevMessages, ...data.messages];
						return { ...prev, messages: newMessages };
					},
				},
			);
		},
		[submit],
	);

	return (
		<copilotTrialAdapterContext.Provider
			value={{
				submitWithContext,
				isLoading,
				stop,
				messages,
				hasMessages: messages && messages.length > 0,
				token,
				threadId: threadId ?? undefined,
				createNewThread,
			}}
		>
			{children}
		</copilotTrialAdapterContext.Provider>
	);
}

export function useCopilotTrialAdapterContext() {
	const ctx = use(copilotTrialAdapterContext);
	if (!ctx) {
		throw new Error(
			"useCopilotTrialAdapterContext must be used within CopilotTrialAdapter",
		);
	}
	return ctx;
}
