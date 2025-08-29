import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { TemplateResource } from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";
import React, { memo, useCallback } from "react";

export type TemplateCardProps = {
  template: TemplateResource;
  onViewDetails: (template: TemplateResource) => void;
};

// Function to get different colorful badge classes for categories
const getBadgeColorClass = (index: number): string => {
  const colorClasses = [
    "bg-theme-blue text-white border-theme-blue",
    "bg-theme-green text-white border-theme-green",
    "bg-theme-purple text-white border-theme-purple",
    "bg-theme-yellow text-black border-theme-yellow",
    "bg-theme-red text-white border-theme-red",
    "bg-theme-darkblue text-white border-theme-darkblue",
  ];
  return colorClasses[index % colorClasses.length];
};

// Function to get dot color for categories
const getDotColor = (category: string): string => {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('ai') || lowerCategory.includes('artificial intelligence')) {
    return 'bg-theme-blue';
  }
  if (lowerCategory.includes('ml') || lowerCategory.includes('machine learning')) {
    return 'bg-theme-green';
  }
  if (lowerCategory.includes('data') || lowerCategory.includes('analytics')) {
    return 'bg-theme-purple';
  }
  if (lowerCategory.includes('web') || lowerCategory.includes('frontend')) {
    return 'bg-theme-yellow';
  }
  if (lowerCategory.includes('api') || lowerCategory.includes('backend')) {
    return 'bg-theme-red';
  }
  return 'bg-theme-darkblue';
};

export const TemplateCard = memo(function TemplateCard({
  template,
  onViewDetails,
}: TemplateCardProps) {
  const handleClickCard = useCallback(
    () => onViewDetails(template),
    [onViewDetails, template]
  );

  return (
    <>
      <div
        className="group relative cursor-pointer rounded-xl border border-border/50 p-4 text-left transition-all bg-background-secondary hover:shadow-md min-h-[200px] flex flex-col hover:brightness-135"
        onClick={handleClickCard}
        role="button"
        tabIndex={0}
      >
        {/* Header with icon and title */}
        <div className="mb-3 flex items-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted p-2">
            {template.spec.icon ? (
              <Image
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
          <h2 className="font-semibold text-base leading-tight">
            {template.spec.title}
          </h2>
        </div>

        {/* Description aligned to the left */}
        <div className="mb-4">
          <p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">
            {template.spec.description || "No description available"}
          </p>
        </div>

        {/* Categories at bottom left */}
        {template.spec.categories && template.spec.categories.length > 0 && (
          <div className="mt-auto pt-4 flex flex-wrap gap-1">
            {template.spec.categories
              .slice(0, 3)
              .map((category: string, index: number) => (
                <Badge
                  dot
                  key={category}
                  variant="outline"
                  dotColor={getDotColor(category)}
                  className={`bg-background-tertiary`}
                >
                  {category}
                </Badge>
              ))}
          </div>
        )}
      </div>
    </>
  );
});
