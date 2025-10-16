"use client";

import type { Message } from "@langchain/langgraph-sdk";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { statelessRunWait } from "@/lib/langgraph/langgraph-api/langgraph-api-service";

interface SidebarSuggestionsProps {
	onSuggestionClick?: (suggestion: string) => void;
	showResourceSuggestions?: boolean;
	isLoading: boolean;
	messages: Message[];
	submit: (
		data: { messages: Message[] },
		options?: { optimisticValues?: (prev: any) => any },
	) => any;
}

// Reusable suggestion item component
interface SuggestionItemProps {
	suggestion: string;
	index: number;
	onSuggestionClick: (suggestion: string) => void;
}

function SuggestionItem({
	suggestion,
	index,
	onSuggestionClick,
}: SuggestionItemProps) {
	return (
		<div className="flex items-center hover:bg-background-tertiary p-1 rounded-lg">
			<span className="text-muted-foreground font-medium">
				{index + 1}.
			</span>
			<button
				onClick={() => onSuggestionClick(suggestion)}
				className="text-left px-3 whitespace-normal flex-1 cursor-pointer transition-colors text-sm bg-transparent border-none"
				type="button"
			>
				{suggestion}
			</button>
		</div>
	);
}

export default function SidebarSuggestions({
	onSuggestionClick,
	isLoading,
	submit,
	messages,
}: SidebarSuggestionsProps) {
	// State for suggestions - currently empty
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [isFetchingSuggestions, setIsFetchingSuggestions] = useState<boolean>(false);
	const prevIsLoadingRef = useRef<boolean>(isLoading);

	const { baseUrl, apiKey, modelName } = useLanggraphState();

	// useEffect to trigger when isLoading changes from true to false
	useEffect(() => {
		const fetchSuggestions = async () => {
			if (prevIsLoadingRef.current === true && isLoading === false) {
				console.log(
					"SidebarSuggestions - Loading state changed from true to false",
				);
				setIsFetchingSuggestions(true);
				try {
					const response = await statelessRunWait({
						input: {
							messages: messages,
							api_key: apiKey,
							base_url: baseUrl,
							model_name: modelName,
							stage: "suggestion",
						},
					});
					// Parse the latest message that contains stringified suggestions
					const responseData = response as any;
					const latestMessage =
						responseData?.messages?.[responseData.messages.length - 1];
					if (latestMessage?.content) {
						try {
							const parsedSuggestions = JSON.parse(latestMessage.content);
							console.log(
								"SidebarSuggestions - Parsed suggestions:",
								parsedSuggestions,
							);

							// Store suggestions in state if they exist
							if (
								parsedSuggestions?.suggestions &&
								Array.isArray(parsedSuggestions.suggestions)
							) {
								setSuggestions(parsedSuggestions.suggestions);
							}
						} catch (error) {
							console.error(
								"SidebarSuggestions - Failed to parse suggestions:",
								error,
							);
						}
					}
				} finally {
					setIsFetchingSuggestions(false);
				}
			} else if (prevIsLoadingRef.current === false && isLoading === true) {
				setSuggestions([]);
			}
		};
		fetchSuggestions();
		prevIsLoadingRef.current = isLoading;
	}, [isLoading, apiKey, baseUrl, modelName, messages]);

	const handleSuggestionClick = (suggestion: string) => {
		// Call the optional callback first
		onSuggestionClick?.(suggestion);

		// Create the user message
		const userMessage: Message = {
			type: "human",
			content: suggestion,
		};

		// Send the suggestion as a user message with optimistic updates
		submit(
			{
				messages: [userMessage],
			},
			{
				optimisticValues(prev: { messages?: Message[] }) {
					const prevMessages = prev.messages ?? [];
					const newMessages = [...prevMessages, userMessage];
					return { ...prev, messages: newMessages };
				},
			},
		);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.3,
				ease: "easeOut",
			}}
			className="flex-shrink-0"
		>
			<div className="w-full bg-transparent">
				<div className="max-w-3xl mx-auto px-2">
					<div className="flex flex-col">
						{suggestions.map((suggestion, index) => (
							<SuggestionItem
								key={`suggestion-${suggestion}-${index}`}
								suggestion={suggestion}
								index={index}
								onSuggestionClick={handleSuggestionClick}
							/>
						))}
					</div>
				</div>
			</div>
		</motion.div>
	);
}
