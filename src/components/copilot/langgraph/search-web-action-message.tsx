"use client";

import React, { useState } from "react";
import { Clock, Search, ChevronDown, ChevronUp, CircleCheckBigIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from "@/components/ui/shadcn-io/ai/source";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface WebSearchResult {
  url: string;
  title: string;
  content: string;
  score: number;
  raw_content?: string | null;
}

interface WebSearchData {
  query: string;
  follow_up_questions?: string[] | null;
  answer?: string | null;
  images?: string[];
  results: WebSearchResult[];
  response_time: number;
  request_id: string;
}

interface SearchWebActionMessageProps {
  result?: WebSearchData;
}


export const SearchWebActionMessage: React.FC<SearchWebActionMessageProps> = ({
  result,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!result || !result.results || result.results.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="border rounded-lg bg-background-secondary">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <span className="flex items-center">
                  <ChevronUp className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </span>
                <p className="text-sm text-foreground flex items-center m-0">
                  <span className="text-muted-foreground">Action:</span>{" "}
                  <span className="text-foreground ml-1">Search Web</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CircleCheckBigIcon className="h-4 w-4 text-theme-green" />
                <span className="text-sm text-theme-green">Completed</span>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="border-t border-muted/20">
            <div className="p-4">
            {/* Search Query and Stats */}
            <div className="space-y-2 mb-4">
              <div className="text-sm text-muted-foreground">
                Query: "{result.query || "your search"}"
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{result.response_time}s</span>
                </div>
                <span>
                  {result.results.length} result
                  {result.results.length !== 1 ? "s" : ""} found
                </span>
              </div>
            </div>

            {/* Answer (if available) */}
            {result.answer && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">{result.answer}</p>
              </div>
            )}

            {/* Sources */}
            <Sources>
              <SourcesTrigger count={result.results.length} />
              <SourcesContent>
                {result.results.map((searchResult, index) => (
                  <Source
                    key={`${searchResult.url}-${index}`}
                    href={searchResult.url}
                    title={searchResult.title}
                  />
                ))}
              </SourcesContent>
            </Sources>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};
