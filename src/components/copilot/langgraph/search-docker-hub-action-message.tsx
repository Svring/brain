"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  Star,
  Download,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DockerHubItem {
  name: string;
  description: string;
  star_count: number;
  pull_count: number;
  is_automated: boolean;
  is_official: boolean;
  last_updated: string;
  tags: string[];
}

interface DockerHubSearchResult {
  query: string;
  total_results: number;
  repositories: DockerHubItem[];
}

interface SearchDockerHubActionMessageProps {
  result?: DockerHubSearchResult;
}

const DockerHubItemCard: React.FC<{ item: DockerHubItem }> = ({ item }) => {
  const handleViewHub = () => {
    const hubUrl = `https://hub.docker.com/r/${item.name}`;
    window.open(hubUrl, "_blank");
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="border border-border rounded-lg p-2 bg-background h-full flex flex-col">
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="text-sm font-semibold truncate">{item.name}</h3>
            {item.is_official && (
              <Badge variant="default" className="text-xs px-1 py-0">
                Official
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            onClick={handleViewHub}
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="space-y-1 flex-1">
        {/* Stats */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="w-3 h-3" />
            <span>{formatNumber(item.star_count)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Download className="w-3 h-3" />
            <span>{formatNumber(item.pull_count)}</span>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div className="text-xs text-muted-foreground truncate">
            {item.description}
          </div>
        )}
      </div>
    </div>
  );
};

export const SearchDockerHubActionMessage: React.FC<
  SearchDockerHubActionMessageProps
> = ({ result }) => {
  const [showAll, setShowAll] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  if (!result || !result.repositories || result.repositories.length === 0) {
    return null;
  }

  const hasMoreThanThree = result.repositories.length > 3;
  const displayItems = showAll
    ? result.repositories
    : result.repositories.slice(0, 3);

  return (
    <div className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium">Search Docker Hub</p>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-2">
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex text-sm text-muted-foreground">
                <span>
                  Found {result.total_results} repositories for "{result.query}"
                </span>
              </div>
              {hasMoreThanThree && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 mr-1" />
                      Show More
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {displayItems.map((item, index) => (
                <DockerHubItemCard key={`${item.name}-${index}`} item={item} />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
