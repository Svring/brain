// "use client";

// import { useStream } from "@langchain/langgraph-sdk/react";
// import type { BrainState } from "@/contexts/langgraph/langgraph-schema";
// import { useChatState, useChatActions } from "@/contexts/chat/chat-context";

// export function useLanggraphStream() {
//   const { selectedThreadId } = useChatState();
//   const { selectThread } = useChatActions();
//   const streamResult = useStream<BrainState>({
//     apiUrl: process.env.NEXT_PUBLIC_LANGGRAPH_DEPLOYMENT_URL,
//     assistantId: process.env.NEXT_PUBLIC_LANGGRAPH_GRAPH_ID || "orca",
//     messagesKey: "messages",

//     threadId: selectedThreadId || "",
//     onThreadId: selectThread,
//   });

//   return streamResult;
// }
