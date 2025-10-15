"use client";

import React from "react";
import { ChatInstanceProvider } from "@/components/provider/chat-instance-provider";
import { useChatState } from "@/contexts/chat/chat-context";
import AiChatbox from "./components/chatbox";

export function ChatManager() {
	const { chatInstances, focusedResourceTarget } = useChatState();

	// Don't render if no focused chat
	if (!focusedResourceTarget) {
		return null;
	}

	// Get the focused chat instance
	const chatInstance = chatInstances.get(focusedResourceTarget);
	if (!chatInstance) {
		return null;
	}

	// Render only the focused chat instance
	return (
		<div className="relative w-full h-full overflow-hidden">
			<div
				className="absolute w-full h-full transition-all duration-500 ease-in-out z-50 opacity-100 pointer-events-auto"
				style={{
					transform: "translateX(0%)",
					borderRadius: "8px",
					overflow: "hidden",
				}}
			>
				{/* Chat content */}
				{chatInstance.projectName ? (
					<ChatInstanceProvider
						key={focusedResourceTarget}
						projectName={chatInstance.projectName}
					>
						<AiChatbox />
					</ChatInstanceProvider>
				) : chatInstance.resourceTarget ? (
					<ChatInstanceProvider
						key={focusedResourceTarget}
						resourceTarget={chatInstance.resourceTarget}
					>
						<AiChatbox />
					</ChatInstanceProvider>
				) : null}
			</div>
		</div>
	);
}

export default ChatManager;
