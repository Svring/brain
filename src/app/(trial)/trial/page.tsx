"use client";

import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { AiMessages } from "@/components/chat/components/messages";
import { Spinner } from "@/components/ui/spinner";
import { useCopilotTrialAdapterContext } from "@/contexts/copilot/copilot-trial.adapter";
import { InputBox } from "@/mvvm/copilot/vms/input-box.vm";

const REGISTER_URL = "https://usw.sealos.io/?openapp=system-brain";
const DEV_URL = "http://localhost:3000";

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
	const [inputValue, setInputValue] = useState("");

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
		let queryString = `token=${token}`;
		if (inputValue.trim()) {
			queryString += `&followup=${inputValue.trim()}`;
		}
		const url = `${REGISTER_URL}?${encodeURIComponent(queryString)}`;
		window.open(url, "_blank");
	};

	const handleSend = () => {
		handleRegisterClick();
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInputValue(e.target.value);
	};

	return (
		<div className="h-full w-full flex flex-col overflow-hidden relative">
			{hasMessages ? (
				<>
					{/* Messages area */}
					<div className="flex-1 flex flex-col min-h-0">
						<div
							className="flex-1 overflow-y-auto py-8 cursor-pointer"
							onClick={handleRegisterClick}
						>
							<div className="max-w-3xl mx-auto w-full pointer-events-none">
								<AiMessages messages={messages} isLoading={isLoading} />
							</div>
						</div>
					</div>

					{/* Input box at bottom */}
					<div className="flex-shrink-0 pb-8">
						<div className="container mx-auto relative max-w-3xl px-4">
							<InputBox
								onSend={handleSend}
								placeholder="Type your message here..."
								autoFocus={false}
								value={inputValue}
								onInputChange={handleInputChange}
							/>
						</div>
					</div>

					{/* Removed overlay to allow scrolling while content ignores pointer events */}
				</>
			) : (
				/* Loading spinner when no messages */
				<div className="flex-1 flex items-center justify-center">
					<Spinner className="h-5 w-5" />
				</div>
			)}
		</div>
	);
}
