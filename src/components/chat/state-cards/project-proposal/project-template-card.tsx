"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Rocket } from "lucide-react";
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
    <div className="w-full">
      <div className="space-y-3 flex-col bg-background-secondary border p-3 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {template.spec.icon ? (
              <Image
                alt={`${template.spec.title} icon`}
                className="size-9 rounded-lg p-1 bg-muted"
                height={36}
                src={template.spec.icon}
                width={36}
              />
            ) : (
              <div className="size-9 rounded-lg bg-gray-300 p-1" />
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs text-muted-foreground leading-none">
              Template
            </span>
            <span className="text-lg font-bold text-foreground leading-tight truncate">
              {template.spec.title}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="text-sm pl-1 text-muted-foreground">
          {template.spec.i18n?.en?.description ||
            template.spec.description ||
            "No description available"}
        </div>
      </div>

      <div className="">
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
