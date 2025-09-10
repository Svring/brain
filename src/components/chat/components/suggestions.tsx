"use client";

import { motion } from "framer-motion";
import { AISuggestion } from "@/components/shadcn-io/ai/suggestion";
import { useSendMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";

interface SuggestionsProps {
  onSuggestionClick?: (suggestion: string) => void;
}

const suggestions = [
  "Create a fullstack web app",
  "Set up a development environment with Node.js, database, and objectstorage configuration",
];

export default function Suggestions({ onSuggestionClick }: SuggestionsProps) {
  const { mutate: sendMessage } = useSendMessageMutation();

  const handleSuggestionClick = (suggestion: string) => {
    // Call the optional callback first
    onSuggestionClick?.(suggestion);

    // Send the suggestion as a user message
    sendMessage({
      role: "user",
      content: suggestion,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.8, // Same delay as projects section
        duration: 0.7,
        ease: "easeOut",
      }}
      className="flex-shrink-0"
    >
      <div className="w-full bg-background">
        <div className="max-w-3xl mx-auto py-4">
          <div className="flex flex-col gap-2">
            {suggestions.map((suggestion, index) => (
              <AISuggestion
                key={index}
                suggestion={suggestion}
                onClick={handleSuggestionClick}
                className="h-10 text-center justify-center px-3 py-2 whitespace-normal hover:bg-transparent hover:text-current"
                variant="ghost"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
