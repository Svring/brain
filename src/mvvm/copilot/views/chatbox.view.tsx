"use client";

import type { Message } from "@langchain/langgraph-sdk";
import { Header } from "../vms/header.vm";
import { InputBox } from "../vms/input-box.vm";
import { MessagesView } from "./messages.view";

interface ChatboxViewProps {
	// Messages props
	messages: Message[];
	isLoading: boolean;
	// Input box props
	onSend?: (message: string) => void;
	onStop?: () => void;
}

export function ChatboxView(props: ChatboxViewProps) {
	const { messages, isLoading, onSend, onStop } = props;

	return (
		<div className="h-full w-full flex flex-col bg-background-secondary border rounded-lg">
			{/* Header */}
			<Header/>

			{/* Messages */}
			<div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
				<MessagesView messages={messages} isLoading={isLoading} />
			</div>

			{/* Input Box */}
			<div className="p-2 pt-0 shrink-0 relative z-[9999]">
				<div className="max-w-3xl mx-auto">
					<InputBox onSend={onSend} onStop={onStop} isLoading={isLoading} />
				</div>
			</div>
		</div>
	);
}
