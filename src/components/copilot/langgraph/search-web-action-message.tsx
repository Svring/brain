"use client";

import React from "react";
import { Clock } from "lucide-react";
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from "@/components/ui/shadcn-io/ai/source";

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
  if (!result || !result.results || result.results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Search Query and Stats */}
      <div className="space-y-2">
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
        <p className="text-sm text-muted-foreground">{result.answer}</p>
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
  );
};
