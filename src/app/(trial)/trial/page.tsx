"use client";

import { useQueryState } from "nuqs";
import { useEffect, useRef } from "react";
import { AiMessages } from "@/components/chat/components/messages";
import { useCopilotTrialAdapterContext } from "@/contexts/copilot/copilot-trial.adapter";

const REGISTER_URL = "https://usw.sealos.io/?openapp=system-brain";

export default function Page() {
	// Get copilot trial adapter context
	const {
		submitWithContext,
		isLoading,
		messages,
		hasMessages,
		threadId,
		token,
	} = useCopilotTrialAdapterContext();
	const [query] = useQueryState("query");
	const hasSubmitted = useRef(false);

	// Submit query as message after 1 second delay (only once)
	useEffect(() => {
		if (query?.trim() && threadId && !hasSubmitted.current) {
			const interval = setTimeout(() => {
				hasSubmitted.current = true;
				submitWithContext({
					messages: [{ type: "human", content: decodeURIComponent(query) }],
				});
			}, 1000);

			return () => clearTimeout(interval);
		}
	}, [query, threadId, submitWithContext]);

	const handleRegisterClick = () => {
		window.open(`${REGISTER_URL}?token=${token}`, "_blank");
	};

	return (
		<div className="h-full w-full flex flex-col overflow-hidden relative">
			{hasMessages && (
				<>
					{/* Messages area */}
					<div className="flex-1 flex flex-col min-h-0">
						<div className="flex-1 overflow-y-auto py-8">
							<div className="max-w-3xl mx-auto w-full">
								<AiMessages messages={messages} isLoading={isLoading} />
							</div>
						</div>
					</div>

					{/* Register Button at bottom */}
					<div className="flex-shrink-0 pb-8">
						<div className="container mx-auto relative max-w-3xl">
							<button
								onClick={handleRegisterClick}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										handleRegisterClick();
									}
								}}
								className="rounded-lg border bg-background-secondary p-2 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-150 flex items-center justify-center min-h-[100px] hover:bg-background-tertiary cursor-pointer w-full"
								type="button"
							>
								<span className="text-lg">Register to proceed...</span>
							</button>
						</div>
					</div>

					{/* Transparent overlay to prevent interaction with all elements except the register block */}
					<div className="absolute inset-0 z-50 pointer-events-none">
						<div className="absolute inset-0 pointer-events-auto">
							{/* Invisible overlay that blocks all interactions */}
							<div className="absolute inset-0 bg-transparent" />

							{/* Allow interactions only with the register block */}
							<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-3xl pointer-events-none">
								<div className="pointer-events-auto">
									<button
										onClick={handleRegisterClick}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												handleRegisterClick();
											}
										}}
										className="rounded-lg border bg-background-secondary p-2 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-150 flex items-center justify-center min-h-[100px] hover:bg-background-tertiary cursor-pointer w-full"
										type="button"
									>
										<span className="text-lg">Register to proceed...</span>
									</button>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
