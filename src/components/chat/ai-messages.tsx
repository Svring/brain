"use client";

import { RenderTextMessage } from "./messages";
// import { useAiCacheMessages } from "@/hooks/ai/use-ai-cache-messages";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { useAutoScroll } from "@/hooks/use-auto-scroll"

export function AiMessages() {
	// const { messages, isLoading, interrupt } = useAiCacheMessages();
	const { messages, isLoading, interrupt } = useCopilotChatHeadless_c({
		id: "chat",
	});

	const { scrollRef, isAtBottom, autoScrollEnabled, scrollToBottom, disableAutoScroll } = useAutoScroll({
		offset: 2,
		smooth: true,
		content: messages.length,
	})

	console.log("isAtBottom", isAtBottom)
	console.log("autoScrollEnabled", autoScrollEnabled)

	return (
		<>
			{/* <CopilotSidebar suggestions="manual" clickOutsideToClose={false} /> */}
			{/* <StickToBottom className="h-full" resize="smooth" initial="smooth"> */}
			<div className="h-full w-full flex flex-col">
				{/* Main Chat Area */}
				<div className="flex-1 flex flex-col min-h-0">
					{/* Messages */}
					<div ref={scrollRef} className="flex-1 overflow-y-auto" onWheel={disableAutoScroll} onTouchMove={disableAutoScroll}>
						{/* <StickToBottom.Content className="flex flex-col h-full"> */}
						{messages.length !== 0 && (
							<div className="max-w-full mx-auto w-full px-4 py-0 pb-4">
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
						{/* </StickToBottom.Content> */}
					</div>
				</div>
			</div>
			{/* </StickToBottom> */}
		</>
	);
}
