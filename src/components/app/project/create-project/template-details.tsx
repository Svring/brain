"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TemplateResource } from "@/lib/sealos/template/schemas/template-api-context-schemas";
import { TemplateInputDialog } from "./template-input-dialog";

export type TemplateDetailsProps = {
  template: TemplateResource;
  onBack: () => void;
  onDeploy: (
    templateName: string,
    templateForm?: Record<string, string>
  ) => void;
};

export function TemplateDetails({
  template,
  onBack,
  onDeploy,
}: TemplateDetailsProps) {
  const [showInputDialog, setShowInputDialog] = useState(false);

  // Check if template has inputs
  const hasInputs =
    template.spec.inputs && Object.keys(template.spec.inputs).length > 0;

  const handleDeploy = () => {
    if (hasInputs) {
      setShowInputDialog(true);
    } else {
      onDeploy(template.metadata.name);
    }
  };

  const handleDeployWithForm = (templateForm: Record<string, string>) => {
    onDeploy(template.metadata.name, templateForm);
    setShowInputDialog(false);
  };

  return (
    <div className="flex h-full max-h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-4 p-6 pb-4">
        <Button onClick={onBack} size="sm" variant="ghost">
          <ArrowLeft className="mr-2 size-4" />
          Back to Templates
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Template Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex size-16 items-center justify-center rounded-lg bg-muted p-3">
                  {template.spec.icon ? (
                    <Image
                      alt={`${template.spec.title} icon`}
                      className="size-10"
                      height={40}
                      src={template.spec.icon}
                      width={40}
                    />
                  ) : (
                    <div className="size-10 rounded bg-gray-300" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        {template.spec.title}
                      </CardTitle>
                      {template.spec.author && (
                        <CardDescription className="mt-1">
                          by {template.spec.author}
                        </CardDescription>
                      )}
                    </div>
                    <Button onClick={handleDeploy} size="lg">
                      {hasInputs ? "Configure & Deploy" : "Deploy Template"}
                    </Button>
                  </div>

                  {/* Categories */}
                  {template.spec.categories &&
                    template.spec.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {template.spec.categories.map((category) => (
                          <Badge key={category} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Description */}
          {template.spec.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {template.spec.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Template Information */}
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {template.spec.templateType && (
                  <div>
                    <h4 className="font-medium text-sm">Template Type</h4>
                    <p className="text-muted-foreground text-sm">
                      {template.spec.templateType}
                    </p>
                  </div>
                )}

                {template.spec.deployCount !== undefined && (
                  <div>
                    <h4 className="font-medium text-sm">Deploy Count</h4>
                    <p className="text-muted-foreground text-sm">
                      {template.spec.deployCount}
                    </p>
                  </div>
                )}

                {template.spec.url && (
                  <div>
                    <h4 className="font-medium text-sm">Homepage</h4>
                    <a
                      className="text-blue-600 text-sm hover:underline"
                      href={template.spec.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {template.spec.url}
                    </a>
                  </div>
                )}

                {template.spec.gitRepo && (
                  <div>
                    <h4 className="font-medium text-sm">Repository</h4>
                    <a
                      className="text-blue-600 text-sm hover:underline"
                      href={template.spec.gitRepo}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {template.spec.gitRepo}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Template Inputs */}
          {template.spec.inputs &&
            Object.keys(template.spec.inputs).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Configuration Parameters</CardTitle>
                  <CardDescription>
                    This template accepts the following configuration parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(template.spec.inputs).map(
                      ([key, input]) => (
                        <div
                          className="border-border border-l-2 pl-4"
                          key={key}
                        >
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{key}</h4>
                            {input?.required && (
                              <Badge variant="destructive">Required</Badge>
                            )}
                          </div>
                          {input?.description && (
                            <p className="text-muted-foreground text-sm">
                              {input.description}
                            </p>
                          )}
                          <div className="mt-1 text-muted-foreground text-xs">
                            Type: {input?.type || "string"}
                            {input?.default !== undefined && (
                              <span> • Default: {String(input.default)}</span>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* README */}
          {template.spec.readme && (
            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">
                    {template.spec.readme}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Template Input Dialog */}
      {hasInputs && (
        <TemplateInputDialog
          template={template}
          isOpen={showInputDialog}
          onClose={() => setShowInputDialog(false)}
          onSubmit={handleDeployWithForm}
          isLoading={false}
        />
      )}
    </div>
  );
}
