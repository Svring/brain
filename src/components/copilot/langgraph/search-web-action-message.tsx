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
  result?: WebSearchData | { results: WebSearchData };
}


export const SearchWebActionMessage: React.FC<SearchWebActionMessageProps> = ({
  result,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  console.log("result", result);

  // Handle nested structure where results might be in result.results.results
  const searchData: WebSearchData = 'results' in (result || {}) ? (result as any).results : (result as WebSearchData);
  const results: WebSearchResult[] = searchData?.results || [];
  const query = searchData?.query || "your search";
  const responseTime = searchData?.response_time || 0;
  const answer = searchData?.answer;
  const followUpQuestions = searchData?.follow_up_questions;

  if (!searchData || !results || results.length === 0) {
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
                Query: "{query}"
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{responseTime}s</span>
                </div>
                <span>
                  {results.length} result
                  {results.length !== 1 ? "s" : ""} found
                </span>
              </div>
            </div>

            {/* Answer (if available) */}
            {answer && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">{answer}</p>
              </div>
            )}

            {/* Sources */}
            <Sources>
              <SourcesTrigger count={results.length} />
              <SourcesContent>
                {results.map((searchResult: WebSearchResult, index: number) => (
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
