"use client";

import { useEffect } from "react";
import { useChatInstance } from "@/components/provider/chat-instance-provider";
import { useChatActions, useChatState } from "@/contexts/chat/chat-context";
import { cn } from "@/lib/utils";
import { AiChatHeader } from "./header";
import { AiChatInput } from "./input";
import { AiMessages } from "./messages";
import SidebarSuggestions from "./sidebar-suggestions";

export default function AiChatbox() {
	const {
		state,
		resourceTarget,
		submit,
		stop,
		isLoading,
		messages,
		interrupt,
	} = useChatInstance();

	const { getPendingMessages, shouldTriggerPendingMessages } = useChatState();
	const { clearPendingMessages, clearTriggerPendingMessages } =
		useChatActions();

	// Check if we should trigger pending messages and submit them
	useEffect(() => {
		const shouldTrigger = shouldTriggerPendingMessages(resourceTarget);
		if (shouldTrigger) {
			const pendingMessages = getPendingMessages(resourceTarget);
			if (pendingMessages.length > 0) {
				// console.log("AiChatbox - Pending messages for resource target:", {
				//   resourceTarget,
				//   pendingMessageCount: pendingMessages.length,
				//   pendingMessages,
				// });

				// Submit the pending messages
				try {
					submit({
						messages: pendingMessages,
					});
					clearPendingMessages(resourceTarget);
				} catch (error) {
					console.error(
						"AiChatbox - Failed to submit pending messages:",
						error,
					);
				}
			}
			clearTriggerPendingMessages(resourceTarget);
		}
	}, [shouldTriggerPendingMessages]);

	return (
		<div
			className={cn(
				"h-full w-full flex flex-col gap-2 border rounded-xl bg-background mr-2 transition-all duration-100",
				state.open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
			)}
		>
			<AiChatHeader />

			<div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
				<AiMessages
					messages={messages}
					isLoading={isLoading}
					interrupt={interrupt}
					submit={submit}
				/>
			</div>

			{/* Show suggestions when there are no messages */}
			{messages && messages.length === 0 && (
				<div className="p-2 pb-0 shrink-0">
					<div className="max-w-3xl mx-auto">
						<SidebarSuggestions
							submit={submit}
							showResourceSuggestions={!!resourceTarget}
						/>
					</div>
				</div>
			)}

			<div className="p-2 pt-0 shrink-0 relative z-[9999]">
				<div className="max-w-3xl mx-auto">
					<AiChatInput
						onSubmit={submit}
						onStop={stop}
						isLoading={isLoading}
						interrupt={interrupt}
						submit={submit}
					/>
				</div>
			</div>
		</div>
	);
}
