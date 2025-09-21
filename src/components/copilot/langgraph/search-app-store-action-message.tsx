"use client";

import React, { useMemo, useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp, Hammer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTemplates } from "@/hooks/template/use-templates";
import { useTemplateApiContext } from "@/lib/auth/auth-utils";
import type { TemplateResource } from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AppStoreItem {
  name: string;
  gitRepo: string;
  description: string;
  inputs: Record<
    string,
    {
      description: string;
      type: string;
      default: string;
      required: boolean;
    }
  > | null;
  similarity_score: number;
}

interface AppStoreSearchResult {
  query_keywords: string[];
  total_templates: number;
  relevant_templates: AppStoreItem[];
}

interface SearchAppStoreActionMessageProps {
  result?: AppStoreSearchResult;
}

// Template card component styled like the original template card
const TemplateCard: React.FC<{ template: TemplateResource }> = ({
  template,
}) => {
  const handleViewRepo = () => {
    if (template.spec.gitRepo) {
      window.open(template.spec.gitRepo, "_blank");
    }
  };

  return (
    <div className="group relative rounded-xl border border-border/50 p-4 text-left transition-all bg-background-secondary hover:shadow-md flex flex-col">
      {/* Header with icon, title, and external link */}
      <div className="mb-3 flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted p-2">
          {template.spec.icon ? (
            <img
              alt={`${template.spec.title} icon`}
              className="size-6"
              height={24}
              src={template.spec.icon}
              width={24}
            />
          ) : (
            <div className="size-6 rounded bg-gray-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-base leading-tight truncate">
                {template.spec.title}
              </h2>
              {/* Category below name */}
              {template.spec.categories &&
                template.spec.categories.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {template.spec.categories[0].toLowerCase() === "ai"
                      ? "AI"
                      : template.spec.categories[0].charAt(0).toUpperCase() +
                        template.spec.categories[0].slice(1)}
                  </p>
                )}
            </div>
            <div className="flex items-center gap-1 ml-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={handleViewRepo}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Description aligned to the left */}
      <div className="flex-1">
        <p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">
          {template.spec.i18n?.en?.description ||
            template.spec.description ||
            "No description available"}
        </p>
      </div>
    </div>
  );
};

export const SearchAppStoreActionMessage: React.FC<
  SearchAppStoreActionMessageProps
> = ({ result }) => {
  console.log("result", result);
  const [showAll, setShowAll] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Get template API context and templates
  const templateApiContext = useTemplateApiContext();
  const { templates, isLoading, error } = useTemplates(templateApiContext);

  // Function to search for template by name
  const searchTemplate = (name: string): TemplateResource | undefined => {
    return templates.find(
      (template) =>
        template.spec.title.toLowerCase().includes(name.toLowerCase()) ||
        template.metadata.name.toLowerCase().includes(name.toLowerCase())
    );
  };

  // Get full templates for the passed in app names
  const foundTemplates = useMemo(() => {
    if (
      !result ||
      !result.relevant_templates ||
      result.relevant_templates.length === 0
    )
      return [];

    return result.relevant_templates
      .map((item) => searchTemplate(item.name))
      .filter(
        (template): template is TemplateResource => template !== undefined
      );
  }, [result, templates]);

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center p-2 border rounded-lg">
          <div className="flex items-center gap-2">
            <Hammer className="h-4 w-4 text-blue-600" />
            <p className="text-sm">Loading App Store templates...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center p-2 border rounded-lg">
          <div className="flex items-center gap-2">
            <Hammer className="h-4 w-4 text-red-600" />
            <p className="text-sm">Error loading templates: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (
    !result ||
    !result.relevant_templates ||
    result.relevant_templates.length === 0
  ) {
    return null;
  }

  const hasMoreThanThree = foundTemplates.length > 3;
  const displayTemplates = showAll
    ? foundTemplates
    : foundTemplates.slice(0, 3);

  return (
    <div className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <Hammer className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium">Search App Store</p>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-2">
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex text-sm text-muted-foreground">
                <span>
                  Browsed through {result.total_templates} templates and found {foundTemplates.length} relevant results
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
              {displayTemplates.map((template, index) => (
                <TemplateCard
                  key={`${template.metadata.name}-${index}`}
                  template={template}
                />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
