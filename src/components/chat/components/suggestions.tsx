"use client";

import { motion } from "framer-motion";
import { useStreamContext } from "@/components/provider/stream-provider";

interface SuggestionsProps {
  onSuggestionClick?: (suggestion: string) => void;
}

const suggestions = [
  "Deploy an NGINX web server with optimized configuration",
  "Configure a Next.js development environment with PostgreSQL and object storage",
];

// Reusable suggestion item component
interface SuggestionItemProps {
  suggestion: string;
  index: number;
  onSuggestionClick: (suggestion: string) => void;
}

function SuggestionItem({
  suggestion,
  index,
  onSuggestionClick,
}: SuggestionItemProps) {
  return (
    <div className="flex items-center hover:bg-background-tertiary p-1 rounded-lg">
      <span className="text-sm text-muted-foreground font-medium">
        {index + 1}.
      </span>
      <span
        onClick={() => onSuggestionClick(suggestion)}
        className="text-left px-3 whitespace-normal flex-1 cursor-pointer transition-colors text-sm"
      >
        {suggestion}
      </span>
    </div>
  );
}

export default function Suggestions({ onSuggestionClick }: SuggestionsProps) {
  const { sendMessage } = useStreamContext();

  const handleSuggestionClick = async (suggestion: string) => {
    // Call the optional callback first
    onSuggestionClick?.(suggestion);

    // Send the suggestion as a user message
    await sendMessage([
      {
        type: "human",
        content: suggestion,
      },
    ]);
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
        <div className="max-w-3xl mx-auto px-2">
          <div className="flex flex-col gap-2">
            {suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={index}
                suggestion={suggestion}
                index={index}
                onSuggestionClick={handleSuggestionClick}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
