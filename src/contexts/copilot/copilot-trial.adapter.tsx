"use client";

import type { Message } from "@langchain/langgraph-sdk";
import { useStream } from "@langchain/langgraph-sdk/react";
import { useMount } from "@reactuses/core";
import type { ReactNode } from "react";
import { createContext, use, useCallback, useState } from "react";
import { requestLogin } from "@/lib/auth/auth-utils";
import { createThread } from "@/lib/langgraph/langgraph-api/langgraph-api-service";
import { useEnvState } from "../env/env.context";

const MESSAGE_LIMIT = 5;

interface CopilotTrialAdapterContextValue {
	submitWithContext: (data: { newMessages: Message[] }) => void;
	isLoading: boolean;
	stop: () => void;
	messages: Message[];
	hasMessages: boolean;
	sessionId: string | null;
	threadId?: string;
	createNewThread: () => void;
	query: string | null;
}

export const copilotTrialAdapterContext = createContext<
	CopilotTrialAdapterContextValue | undefined
>(undefined);

interface CopilotTrialAdapterProps {
	children: ReactNode;
	sessionId: string | null;
	query: string | null;
}

export function CopilotTrialAdapter({
	children,
	sessionId,
	query,
}: CopilotTrialAdapterProps) {
	const { variables } = useEnvState();
	const [threadId, setThreadId] = useState<string | undefined>(undefined);

	// Create new thread function
	const createNewThread = async () => {
		try {
			const data = await createThread({ metadata: { sessionId } });
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
		(data: { newMessages: Message[] }) => {
			// Count current human messages
			const humanMessageCount = messages.filter(
				(msg) => msg.type === "human",
			).length;

			// If limit is reached, trigger login request instead of submitting
			if (humanMessageCount >= MESSAGE_LIMIT) {
				const queryParams = {
					sessionId: sessionId || "",
				};
				console.log("query params", queryParams);
				requestLogin({
					pathname: "/",
					query: queryParams,
				});
				return;
			}

			// Otherwise, allow submission
			return submit(
				{
					stage: "deploy_project",
					trial: true,
					messages: data.newMessages,
				},
				{
					optimisticValues(prev) {
						const prevMessages = prev.messages ?? [];
						// @ts-expect-error Suppress iterable type error for newMessages
						const newMessages = [...prevMessages, ...data.newMessages];
						return { ...prev, messages: newMessages };
					},
				},
			);
		},
		[submit, messages, sessionId],
	);

	return (
		<copilotTrialAdapterContext.Provider
			value={{
				submitWithContext,
				isLoading,
				stop,
				messages,
				hasMessages: messages && messages.length > 0,
				sessionId,
				threadId: threadId ?? undefined,
				createNewThread,
				query,
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
