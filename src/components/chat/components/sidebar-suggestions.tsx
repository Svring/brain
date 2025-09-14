"use client";

import { motion } from "framer-motion";
import { useSendMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";

interface SidebarSuggestionsProps {
  onSuggestionClick?: (suggestion: string) => void;
  showResourceSuggestions?: boolean;
}

// Resource-specific suggestions
const resourceSuggestions = [
  "Upgrade resource quota of this resource",
  "What's the status of this resource?",
];

// Project-level suggestions
const projectSuggestions = [
  "What resources are in the project?",
  "Add a postgresql database to the project",
];

export default function SidebarSuggestions({
  onSuggestionClick,
  showResourceSuggestions = false,
}: SidebarSuggestionsProps) {
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
                  <div key={`resource-${index}`} className="flex items-center hover:bg-background-tertiary p-1 rounded-lg">
                    <span className="text-sm text-muted-foreground font-medium">
                      {index + 1}.
                    </span>
                    <span
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left px-3 whitespace-normal flex-1 cursor-pointer transition-colors text-sm"
                    >
                      {suggestion}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              /* Project-level suggestions */
              <div className="flex flex-col gap-2">
                {projectSuggestions.map((suggestion, index) => (
                  <div
                    key={`project-${index}`}
                    className="flex items-center gap-3"
                  >
                    <span className="text-sm text-muted-foreground font-medium min-w-[20px]">
                      {index + 1}.
                    </span>
                    <span
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left px-3 whitespace-normal flex-1 cursor-pointer transition-colors text-sm"
                    >
                      {suggestion}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
