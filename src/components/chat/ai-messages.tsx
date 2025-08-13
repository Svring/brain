"use client";

import { RenderTextMessage } from "./messages";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";

export function AiMessages() {
	const { messages, isLoading, interrupt } = useCopilotChatHeadless_c({
		id: "chat",
	});

	return (
		<>
			{messages.length !== 0 && (
				<div className="w-full px-4 py-0 pb-4">
					{messages.map((message, index) => {
						const isCurrentMessage = index === messages.length - 1;

						return (
							<div key={message.id} className="mb-2">
								<RenderTextMessage
									message={message}
									index={index}
									isCurrentMessage={isCurrentMessage}
									inProgress={isLoading}
								/>

								{/* Generative UI for assistant messages */}
								{message.role === "assistant" && message.generativeUI?.()}
							</div>
						);
					})}
				</div>
			)}
			{interrupt}
		</>
	);
}
