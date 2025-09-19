"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Rocket, FileText, Hammer } from "lucide-react";
import Image from "next/image";
import type { TemplateResource } from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";
import { Spinner } from "@/components/ui/spinner";

interface ProjectTemplateCardProps {
  template: TemplateResource;
  onDeploy?: () => void;
  isDeploying?: boolean;
  hasInputs?: boolean;
}

export function ProjectTemplateCard({
  template,
  onDeploy,
  isDeploying = false,
  hasInputs = false,
}: ProjectTemplateCardProps) {
  return (
    <div className="w-full border p-4 rounded-xl">
      {/* Header with icon and text */}
      <div className="flex items-center mb-3">
        <div className="flex text-sm text-muted-foreground">
          <Hammer size={20} className="mr-2" />
          <span>Deploy from template: {template.spec.title}</span>
        </div>
      </div>

      <div className="group relative border p-2 rounded-xl text-left transition-all bg-background-secondary hover:shadow-md flex flex-col">
        {/* Header with icon, title, and category */}
        <div className="mb-3 flex items-start gap-4">
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

      <div className="pt-2">
        <Button
          onClick={onDeploy}
          disabled={isDeploying}
          className="w-full"
          variant={"outline"}
        >
          {isDeploying ? (
            <>
              <Spinner variant="circle" size={16} className="mr-2" />
              Deploying...
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4 mr-2" />
              {hasInputs ? "Configure & Deploy" : "Deploy"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
