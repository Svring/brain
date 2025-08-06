import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { TemplateResource } from "@/lib/sealos/template/schemas/template-api-context-schemas";
import { TemplateInputDialog } from "./template-input-dialog";
import { useTemplateCard } from "@/hooks/template/use-template-card";
import { useCopilotChat } from "@copilotkit/react-core";
import { useAiActions } from "@/contexts/ai/ai-context";

export type TemplateCardProps = {
  template: TemplateResource;
  onViewDetails: (template: TemplateResource) => void;
};

export function TemplateCard({ template, onViewDetails }: TemplateCardProps) {
  const {
    showInputDialog,
    setShowInputDialog,
    hasInputs,
    isDeploying,
    handleDeploy,
    deployTemplate,
  } = useTemplateCard(template);

  const { appendMessage } = useCopilotChat();
  const { openChat } = useAiActions();

  return (
    <>
      <div
        className="group relative cursor-pointer rounded-lg border p-4 text-left transition-all hover:bg-background-secondary hover:shadow-md"
        onClick={() => onViewDetails(template)}
        role="button"
        tabIndex={0}
      >
        {/* Header with icon and title */}
        <div className="mb-3 flex items-center gap-3">
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

        {/* Categories */}
        {template.spec.categories && template.spec.categories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {template.spec.categories.slice(0, 3).map((category: string) => (
              <div
                className="rounded-full border-none bg-secondary px-2 py-1 text-secondary-foreground text-xs"
                key={category}
              >
                {category}
              </div>
            ))}
          </div>
        )}

        {/* Deploy button */}
        <div className="flex justify-end">
          <Button
            className="opacity-0 transition-opacity group-hover:opacity-100"
            disabled={isDeploying}
            onClick={handleDeploy}
            size="sm"
            variant="outline"
          >
            {isDeploying ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Deploying...
              </>
            ) : hasInputs ? (
              "Configure & Deploy"
            ) : (
              "Deploy"
            )}
          </Button>
        </div>
      </div>

      {/* Template Input Dialog */}
      {hasInputs && (
        <TemplateInputDialog
          template={template}
          isOpen={showInputDialog}
          onClose={() => setShowInputDialog(false)}
          onSubmit={deployTemplate}
          isLoading={isDeploying}
        />
      )}
    </>
  );
}
