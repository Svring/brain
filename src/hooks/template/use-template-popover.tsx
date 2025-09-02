// "use client";
// import { useState, useEffect, useMemo } from "react";
// import type { TemplateResource } from "@/lib/sealos/template/schemas/template-api-context-schemas";
// import { useAiState } from "@/contexts/ai/ai-context";
// import { useAiActions } from "@/contexts/ai/ai-context";
// import { useStream } from "@langchain/langgraph-sdk/react";
// import type { Message } from "@langchain/langgraph-sdk";
// import { Client } from "@langchain/langgraph-sdk";

// export function useTemplatePopover(template: TemplateResource) {
//   const {
//     aiState: { model, base_url, api_key },
//     floatingChat: { threadId },
//   } = useAiState();

//   const { openFloatingChat, setThreadId } = useAiActions();

//   const { submit, isLoading } = useStream<{
//     messages: Message[];
//     model: string;
//     base_url: string;
//     api_key: string;
//   }>({
//     apiUrl: "http://localhost:2025",
//     assistantId: "ai",
//     // threadId: threadId,
//   });

//   // Memoize the message to avoid recomputing on every render
//   const aiMessage = useMemo(() => {
//     return `Tell me more about the ${
//       template.spec.title
//     } template. What does it do and how can I use it? Here are the details:\n\nTitle: ${
//       template.spec.title
//     }\nDescription: ${
//       template.spec.description || "No description available"
//     }\nCategories: ${template.spec.categories?.join(", ") || "None"}${
//       template.spec.author ? `\nAuthor: ${template.spec.author}` : ""
//     }`;
//   }, [template]);

//   const handleAskAi = async (e: React.MouseEvent) => {
//     e.stopPropagation();

//     openFloatingChat();

//     submit({
//       messages: [{ type: "human", content: aiMessage }],
//       model: model,
//       base_url: base_url,
//       api_key: api_key,
//     });
//   };

//   return {
//     isLoading,
//     handleAskAi,
//   };
// }
