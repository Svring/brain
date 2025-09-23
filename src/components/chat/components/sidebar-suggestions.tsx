"use client";

import { motion } from "framer-motion";
import { Message } from "@langchain/langgraph-sdk";

interface SidebarSuggestionsProps {
  onSuggestionClick?: (suggestion: string) => void;
  showResourceSuggestions?: boolean;
  submit: (data: { messages: Message[] }, options?: any) => any;
}

// Resource-specific suggestions
const resourceSuggestions = [
  // "Upgrade resource quota of this resource",
  "What's the status of this resource?",
];

// Project-level suggestions
const projectSuggestions = [
  "What resources are in the project?",
  // "Add a postgresql database to the project",
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

export default function SidebarSuggestions({
  onSuggestionClick,
  showResourceSuggestions = false,
  submit,
}: SidebarSuggestionsProps) {
  const handleSuggestionClick = (suggestion: string) => {
    // Call the optional callback first
    onSuggestionClick?.(suggestion);

    // Create the user message
    const userMessage: Message = {
      type: "human",
      content: suggestion,
    };

    // Send the suggestion as a user message with optimistic updates
    submit(
      {
        messages: [userMessage],
      },
      {
        optimisticValues(prev: any) {
          const prevMessages = prev.messages ?? [];
          const newMessages = [...prevMessages, userMessage];
          return { ...prev, messages: newMessages };
        },
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      className="flex-shrink-0"
    >
      <div className="w-full bg-background">
        <div className="max-w-3xl mx-auto px-2">
          <div className="flex flex-col gap-2">
            {showResourceSuggestions ? (
              /* Resource-specific suggestions */
              <div className="flex flex-col gap-2">
                {resourceSuggestions.map((suggestion, index) => (
                  <SuggestionItem
                    key={`resource-${index}`}
                    suggestion={suggestion}
                    index={index}
                    onSuggestionClick={handleSuggestionClick}
                  />
                ))}
              </div>
            ) : (
              /* Project-level suggestions */
              <div className="flex flex-col gap-2">
                {projectSuggestions.map((suggestion, index) => (
                  <SuggestionItem
                    key={`project-${index}`}
                    suggestion={suggestion}
                    index={index}
                    onSuggestionClick={handleSuggestionClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
