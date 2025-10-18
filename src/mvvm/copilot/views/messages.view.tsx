"use client";

import type { Message } from "@langchain/langgraph-sdk";
import { Loader2 } from "lucide-react";
import { useMemo, useRef } from "react";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { RenderTextMessage } from "./text-message.view";

interface MessagesViewProps {
	messages: Message[];
	isLoading: boolean;
}

export function MessagesView({
	messages,
	isLoading,
}: MessagesViewProps) {
	const scrollRef = useRef<HTMLDivElement>(null);

	// Use auto-scroll with messages
	useAutoScroll({
		offset: 20,
		smooth: true,
		messages,
		scrollRef,
	});

	const memoizedMessages = useMemo(() => {
		// Prevent error if messages is undefined or not an array
		if (!messages || !Array.isArray(messages)) {
			return [];
		}

		const messageElements = messages.map((message) => {
			return (
				<div key={message.id}>
					<RenderTextMessage message={message} inProgress={false} />
				</div>
			);
		});

		// Add "Thinking..." indicator when streaming
		if (isLoading) {
			messageElements.push(
				<div key="thinking-indicator">
					<div className="flex justify-start">
						<div className="flex items-center gap-2 text-xs opacity-70 px-1">
							<Loader2 className="w-3 h-3 animate-spin" />
							<span>Thinking...</span>
						</div>
					</div>
				</div>,
			);
		}

		return messageElements;
	}, [messages, isLoading]);

	if (!messages || !Array.isArray(messages) || messages.length === 0) {
		return (
			<div className="w-full px-4 h-full flex items-center justify-center">
				<div className="text-center text-muted-foreground">
					Messages will appear here...
				</div>
			</div>
		);
	}

	return (
		<div className="w-full px-4 h-full relative">
			<div className="max-w-3xl mx-auto h-full">
				<div ref={scrollRef} className="h-full overflow-y-auto scrollbar-hide">
					{memoizedMessages}
				</div>
			</div>
		</div>
	);
}
