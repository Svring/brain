"use client";

import type { Message } from "@langchain/langgraph-sdk";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { AiChatInput } from "@/components/chat/components/input";
import { AiMessages } from "@/components/chat/components/messages";
import { Hero } from "@/components/ui/hero";
import { useCopilotTrialAdapterContext } from "@/contexts/copilot/copilot-trial.adapter";

const REGISTER_URL = "https://usw.sealos.io/?openapp=system-brain";

export function TrialLanding() {
	const { token, submitWithContext, messages, isLoading } =
		useCopilotTrialAdapterContext();
	const [hasSubmitted, setHasSubmitted] = useState(false);
	const messagesScrollRef = useRef<HTMLDivElement>(null);

	const showMessages = messages.length > 0;

	const handleSubmit = (data: { messages: Message[] }) => {
		if (!hasSubmitted) {
			// First submission - use normal submitWithContext
			submitWithContext(data);
			setHasSubmitted(true);
		} else {
			// After first submission - redirect to register
			const message = data.messages[0]?.content;
			const messageText = typeof message === "string" ? message : "";
			if (messageText.trim()) {
				const queryString = `token=${token}&query=${encodeURIComponent(messageText.trim())}`;
				const url = `${REGISTER_URL}?${encodeURIComponent(queryString)}`;
				window.open(url, "_blank");
			}
		}
	};

	const handleStop = () => {
		// No-op for now, could implement stop functionality if needed
	};

	const handleRegisterClick = () => {
		const queryString = `token=${token}`;
		const url = `${REGISTER_URL}?${encodeURIComponent(queryString)}`;
		window.open(url, "_blank");
	};

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
						<button
							className="flex-1 overflow-y-auto py-8 cursor-pointer text-left"
							onClick={handleRegisterClick}
							type="button"
						>
							<div 
								ref={messagesScrollRef}
								className="max-w-3xl mx-auto w-full pointer-events-none h-full"
							>
								<AiMessages
									scrollRef={messagesScrollRef}
									messages={messages}
									isLoading={isLoading}
								/>
							</div>
						</button>
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
						<AiChatInput
							className={`max-w-3xl${!showMessages ? " min-h-[140px]" : ""}`}
							exhibition={!showMessages}
							onSubmit={handleSubmit}
							onStop={handleStop}
							isLoading={isLoading}
							disableTools={true}
						/>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
