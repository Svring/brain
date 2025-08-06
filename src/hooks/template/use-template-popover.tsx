import { useState } from "react";
import { useAiState } from "@/contexts/ai/ai-context";
import { useLangGraphAi } from "@/hooks/ai/use-langgraph-ai";
import type { TemplateResource } from "@/lib/sealos/template/schemas/template-api-context-schemas";
import { useAiActions } from "@/contexts/ai/ai-context";

export function useTemplatePopover(template: TemplateResource) {
  const { aiState } = useAiState();
  const { streamMessage } = useLangGraphAi();
  const { openChat } = useAiActions();

  const [aiResponse, setAiResponse] = useState<string>("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleAskAi = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoadingAi(true);
    setIsPopoverOpen(true);
    setAiResponse("");

    const message = `Tell me more about the ${
      template.spec.title
    } template. What does it do and how can I use it? Here are the details:\n\nTitle: ${
      template.spec.title
    }\nDescription: ${
      template.spec.description || "No description available"
    }\nCategories: ${template.spec.categories?.join(", ") || "None"}${
      template.spec.author ? `\nAuthor: ${template.spec.author}` : ""
    }`;

    try {
      const result = await streamMessage({
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        state: aiState,
        assistantId: "ai",
      });

      // Extract response from the response array
      const responseText =
        result.response.length > 0
          ? result.response
              .map((chunk: any) => {
                // Extract text content from chunk data
                if (typeof chunk === "string") return chunk;
                if (chunk.message) return chunk.message;
                if (chunk.content) return chunk.content;
                return JSON.stringify(chunk);
              })
              .join("\n")
          : "AI response received successfully. Check console for details.";

      setAiResponse(responseText);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      setAiResponse(
        "Sorry, I couldn't get a response from the AI. Please try again."
      );
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleAskFurtherQuestions = () => {
    // TODO: Implement further questions functionality
    console.log("Ask further questions clicked");
    openChat(aiResponse);
  };

  return {
    aiResponse,
    isPopoverOpen,
    setIsPopoverOpen,
    isLoadingAi,
    handleAskAi,
    handleAskFurtherQuestions,
  };
}
