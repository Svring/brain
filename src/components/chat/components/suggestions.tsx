"use client";

import { motion } from "framer-motion";
import { useStreamContext } from "@/components/provider/stream-provider";
import { ChevronRight } from "lucide-react";

interface SuggestionsProps {
  onSuggestionClick?: (suggestion: string) => void;
}

const suggestions = [
  "Deploy NGINX web server",
  "Setup Next.js with PostgreSQL",
];

// Reusable suggestion item component
interface SuggestionItemProps {
  suggestion: string;
  onSuggestionClick: (suggestion: string) => void;
}

function SuggestionItem({
  suggestion,
  onSuggestionClick,
}: SuggestionItemProps) {
  return (
    <motion.div
      className="relative flex w-full cursor-pointer rounded-lg border bg-background-secondary text-left shadow-sm h-10 items-center px-4"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.15, ease: "easeInOut" }}
      onClick={() => onSuggestionClick(suggestion)}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <p className="text-foreground truncate text-sm">
            {suggestion}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </div>
    </motion.div>
  );
}

export default function Suggestions({ onSuggestionClick }: SuggestionsProps) {
  const { submitWithContext } = useStreamContext();

  const handleSuggestionClick = async (suggestion: string) => {
    // Call the optional callback first
    onSuggestionClick?.(suggestion);

    // Send the suggestion as a user message
    await submitWithContext({
      messages: [
        {
          type: "human",
          content: suggestion,
        },
      ],
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
        <div className="max-w-3xl mx-auto py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={index}
                suggestion={suggestion}
                onSuggestionClick={handleSuggestionClick}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
