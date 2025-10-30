"use client";

import type { Message } from "@langchain/langgraph-sdk";
import { motion } from "framer-motion";
import { CircleHelp } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { AiChatInput } from "@/components/chat/components/input";
import { AiMessages } from "@/components/chat/components/messages";
import { Hero } from "@/components/ui/hero";
import { Spinner } from "@/components/ui/spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopilotTrialAdapterContext } from "@/contexts/copilot/copilot-trial.adapter";
import { requestLogin } from "@/lib/auth/auth-utils";

const MESSAGE_LIMIT = 5;

export default function Page() {
	const {
		sessionId,
		submitWithContext,
		messages,
		isLoading,
		query,
		stop,
		threadId,
		hasMessages,
	} = useCopilotTrialAdapterContext();
	const messagesScrollRef = useRef<HTMLDivElement>(null);
	const hasAutoSubmitted = useRef(false);

	const showMessages = messages.length > 0;

	// Count human messages
	const humanMessageCount = useMemo(() => {
		return messages.filter((msg) => msg.type === "human").length;
	}, [messages]);

	// Auto-submit query if present (only once)
	useEffect(() => {
		if (query?.trim() && threadId && !hasAutoSubmitted.current) {
			const timeout = setTimeout(() => {
				hasAutoSubmitted.current = true;
				submitWithContext({
					messages: [
						{ type: "human", content: decodeURIComponent(query || "") },
					],
				});
			}, 1000);

			return () => clearTimeout(timeout);
		}
	}, [query, threadId, submitWithContext]);

	const handleSubmit = (data: { messages: Message[] }) => {
		// If limit is reached, trigger login request
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
		submitWithContext(data);
	};

	// If we have a query but no messages yet, show loading spinner
	if (query?.trim() && !hasMessages) {
		return (
			<div className="h-screen w-full flex items-center justify-center">
				<Spinner className="h-5 w-5" />
			</div>
		);
	}

	return (
		<div className="h-screen w-full flex flex-col overflow-hidden">
			<div className="flex-1 flex flex-col min-h-0">
				{/* Hero Section - only show when no messages */}
				{!showMessages && (
					<motion.div
						initial={{ opacity: 0, y: 0 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
						className="flex-shrink-0"
					>
						<Hero
							heroTitle="Sealos Brain"
							subtitle="Let development get back to basics - focus on writing code, and let the cloud handle the rest."
							titleClassName="text-4xl md:text-5xl font-extrabold"
							subtitleClassName="text-md md:text-lg max-w-[600px]"
							actionsClassName="mt-2"
						/>
					</motion.div>
				)}

				{/* Messages area - only visible when there are messages */}
				{showMessages && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="flex-1 flex flex-col min-h-0"
					>
						<div
							ref={messagesScrollRef}
							className="flex-1 overflow-y-auto py-8"
						>
							<div className="max-w-3xl mx-auto w-full">
								<AiMessages
									scrollRef={messagesScrollRef}
									messages={messages}
									isLoading={isLoading}
								/>
							</div>
						</div>
					</motion.div>
				)}

				{/* Input Box */}
				<motion.div
					layout
					initial={!showMessages ? { y: 0, opacity: 0 } : false}
					animate={{ y: 0, opacity: 1 }}
					transition={{
						delay: showMessages ? 0 : 0.2,
						duration: showMessages ? 0.4 : 0.6,
						ease: [0.215, 0.61, 0.355, 1],
					}}
					className={`flex-shrink-0 ${showMessages ? "pb-8" : "py-0"}`}
				>
					<div className="container mx-auto relative max-w-3xl px-4">
						<div className="relative">
							<AiChatInput
								className={`max-w-3xl${!showMessages ? " min-h-[140px]" : ""}`}
								exhibition={!showMessages}
								onSubmit={handleSubmit}
								onStop={stop}
								isLoading={isLoading}
								disableTools={true}
							/>

							{/* Message count display - overlayed at bottom left */}
							{showMessages && (
								<div className="absolute bottom-3 left-3 flex items-center gap-1.5 pointer-events-auto z-10">
									<span className="text-sm text-muted-foreground">
										{humanMessageCount} / {MESSAGE_LIMIT}
									</span>
									<TooltipProvider>
										<Tooltip delayDuration={200}>
											<TooltipTrigger asChild>
												<CircleHelp className="h-4 w-4 text-muted-foreground" />
											</TooltipTrigger>
											<TooltipContent>
												<p>You have 5 free requests in trial mode</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
							)}

							{/* Overlay when limit is reached */}
							{humanMessageCount >= MESSAGE_LIMIT && (
								<button
									type="button"
									className="absolute inset-0 bg-background/60 hover:bg-background/80 transition-colors cursor-pointer z-20 rounded-lg flex items-center justify-center border-none p-0 blur-sm"
									onClick={() => {
										requestLogin({
											pathname: "/",
											query: {
												sessionId: sessionId || "",
											},
										});
									}}
								>
									<span className="text-sm text-muted-foreground font-medium">
										Register before proceeding
									</span>
								</button>
							)}
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
