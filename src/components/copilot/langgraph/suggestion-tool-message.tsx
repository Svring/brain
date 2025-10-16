"use client";

import { usePathname } from "next/navigation";
import type React from "react";
import type { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";
import { useChatInstance } from "@/components/provider/chat-instance-provider";
import { useHomeChat } from "@/components/provider/home-chat-provider";

interface SuggestionToolMessageProps {
	args?: {
		suggestions?: string[];
	};
	result?: ToolActionResult;
}

// Component for /home route using useHomeChat
const HomeSuggestionComponent: React.FC<{
	suggestions: string[];
}> = ({ suggestions }) => {
	const {
		messages,
		submit,
		stop,
		isLoading,
		threadId,
		createNewChat,
		isCreatingNewChat,
	} = useHomeChat();

	console.log("HomeSuggestionComponent - Using useHomeChat");

	const handleSuggestionClick = (suggestion: string) => {
		const userMessage = {
			type: "human" as const,
			content: suggestion,
		};

		submit(
			{ messages: [userMessage] },
			{
				optimisticValues(prev: any) {
					const prevMessages = prev.messages ?? [];
					const newMessages = [...prevMessages, userMessage];
					return { ...prev, messages: newMessages };
				},
			}
		);
	};

	return (
		<div className="w-full">
			<div className="flex flex-col gap-3">
				<div className="flex flex-col gap-2">
					{suggestions.map((suggestion: string, index: number) => (
						<button
							key={suggestion}
							onClick={() => handleSuggestionClick(suggestion)}
							className="flex items-start gap-2 p-2 rounded-lg bg-background hover:bg-background-tertiary border text-left transition-colors"
							disabled={isLoading}
						>
							<span className="text-sm text-muted-foreground font-medium mt-0.5">
								{index + 1}.
							</span>
							<span className="text-sm text-foreground leading-relaxed">
								{suggestion}
							</span>
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

// Component for other routes using useChatInstance
const ProjectSuggestionComponent: React.FC<{
	suggestions: string[];
}> = ({ suggestions }) => {
	const {
		resourceTarget,
		threadId,
		state,
		isActive,
		isFocused,
		submit,
		isLoading,
		messages,
		interrupt,
	} = useChatInstance();

	const handleSuggestionClick = (suggestion: string) => {
		const userMessage = {
			type: "human" as const,
			content: suggestion,
		};

		submit(
			{ messages: [userMessage] },
			{
				optimisticValues(prev: any) {
					const prevMessages = prev.messages ?? [];
					const newMessages = [...prevMessages, userMessage];
					return { ...prev, messages: newMessages };
				},
			}
		);
	};

	return (
		<div className="w-full">
			<div className="flex flex-col gap-3">
				<div className="flex flex-col gap-2">
					{suggestions.map((suggestion: string, index: number) => (
						<button
							key={suggestion}
							onClick={() => handleSuggestionClick(suggestion)}
							className="flex items-start gap-2 p-2 rounded-lg bg-background hover:bg-background-tertiary border text-left transition-colors"
							disabled={isLoading}
						>
							<span className="text-sm text-muted-foreground font-medium mt-0.5">
								{index + 1}.
							</span>
							<span className="text-sm text-foreground leading-relaxed">
								{suggestion}
							</span>
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export const SuggestionToolMessage: React.FC<SuggestionToolMessageProps> = ({
	args,
	result,
}) => {
	const pathname = usePathname();

	// Use suggestions from result if available, otherwise fall back to args
	const suggestions = result?.payload?.suggestions || args?.suggestions || [];

	// Log the current route path
	console.log("SuggestionToolMessage - Current route path:", pathname);

	if (!suggestions.length) {
		return null;
	}

	// Render different components based on route
	if (pathname === "/home") {
		return <HomeSuggestionComponent suggestions={suggestions} />;
	}

	return <ProjectSuggestionComponent suggestions={suggestions} />;
};
