"use client";

import { PromptInputBox } from "./prompt-box";
import type { Message } from "@langchain/langgraph-sdk";
import { Interrupt } from "@langchain/langgraph-sdk";

interface AiChatInputProps {
  className?: string;
  exhibition?: boolean;
  onSubmit: (...args: any[]) => any;
  onStop: () => void;
  isLoading: boolean;
  interrupt?: Interrupt<unknown>;
  submit?: (
    data: { messages: Message[]; stage?: string; command?: any },
    options?: { optimisticValues?: (prev: any) => any; command?: any }
  ) => any;
}

export function AiChatInput({
  className,
  exhibition = false,
  onSubmit,
  onStop,
  isLoading,
  interrupt,
  submit,
}: AiChatInputProps) {
  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      type: "human",
      content: message.trim(),
    };
    onSubmit(
      { messages: [userMessage] },
      {
        optimisticValues(prev: any) {
          const prevMessages = prev.messages ?? [];
          const newMessages = [...prevMessages, userMessage];
          return { ...prev, messages: newMessages };
        },
      }
    );
  };

  const handleStop = () => {
    // If interrupt is active, behave like Reject button
    if (interrupt?.value) {
      try {
        const parsedValue =
          typeof interrupt.value === "string"
            ? JSON.parse(interrupt.value)
            : interrupt.value;

        const responseData = {
          action: parsedValue.action,
          payload: parsedValue.payload,
          approve: false,
        };

        if (submit) {
          submit(
            { messages: [] },
            { command: { resume: JSON.stringify(responseData) } }
          );
        }
      } catch (error) {
        console.error("Failed to parse interrupt value:", error);
        onStop();
      }
    } else {
      onStop();
    }
  };

  // Check if interrupt is active
  const isInterruptActive = !!interrupt?.value;

  return (
    <PromptInputBox
      className={className}
      isLoading={isLoading}
      onSend={handleSendMessage}
      placeholder=""
      disableInput={isInterruptActive}
      disableSend={isLoading || isInterruptActive}
      onStop={handleStop}
      exhibition={exhibition}
    />
  );
}
