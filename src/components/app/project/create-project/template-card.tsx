import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import type { TemplateResource } from "@/lib/sealos/template/schemas/template-api-context-schemas";
import { useCreateInstanceMutation } from "@/lib/sealos/template/template-mutation";
import { TemplateInputDialog } from "./template-input-dialog";

export type TemplateCardProps = {
  template: TemplateResource;
  setSelectedCategory: (category: string) => void;
  onViewDetails: (template: TemplateResource) => void;
  onTemplateDeployed: () => void;
};

export function TemplateCard({
  template,
  setSelectedCategory,
  onViewDetails,
  onTemplateDeployed,
}: TemplateCardProps) {
  const { auth } = useAuthContext();
  const { toast } = useToast();
  const [showInputDialog, setShowInputDialog] = useState(false);

  const apiContext = useMemo(
    () => ({
      baseURL: auth?.regionUrl || undefined,
      authorization: auth?.kubeconfig || undefined,
    }),
    [auth?.regionUrl, auth?.kubeconfig]
  );
  const createInstanceMutation = useCreateInstanceMutation(apiContext);

  const handleClick = () => onViewDetails(template);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onViewDetails(template);
    }
  };

  // Check if template has required inputs or any inputs at all
  const hasInputs =
    template.spec.inputs && Object.keys(template.spec.inputs).length > 0;

  const handleDeploy = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If template has inputs, show the input dialog
    if (hasInputs) {
      setShowInputDialog(true);
      return;
    }

    // Otherwise, deploy directly
    deployTemplate();
  };

  const deployTemplate = (templateForm?: Record<string, string>) => {
    createInstanceMutation.mutate(
      {
        templateName: template.metadata.name,
        templateForm,
      },
      {
        onSuccess: () => {
          toast({
            title: "Template deployed successfully",
            description: `${template.spec.title} has been deployed to your project.`,
          });
          setShowInputDialog(false);
          onTemplateDeployed();
        },
        onError: (error) => {
          toast({
            title: "Deployment failed",
            description:
              error.message || "Failed to deploy template. Please try again.",
            variant: "destructive",
          });
          setShowInputDialog(false);
        },
      }
    );
  };

  const handleCategoryClick = (e: React.MouseEvent, category: string) => {
    e.stopPropagation();
    setSelectedCategory(category);
  };

  return (
    <>
      <button
        className="group relative cursor-pointer rounded-lg border p-4 text-left transition-all hover:border-border/60 hover:shadow-md"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        type="button"
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
              <button
                className="cursor-pointer rounded-full border-none bg-secondary px-2 py-1 text-secondary-foreground text-xs transition-colors hover:bg-secondary/80"
                key={category}
                onClick={(e) => handleCategoryClick(e, category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Deploy button */}
        <div className="flex justify-end">
          <Button
            className="opacity-0 transition-opacity group-hover:opacity-100"
            disabled={createInstanceMutation.isPending}
            onClick={handleDeploy}
            size="sm"
            variant="outline"
          >
            {createInstanceMutation.isPending ? (
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
      </button>

      {/* Template Input Dialog */}
      {hasInputs && (
        <TemplateInputDialog
          template={template}
          isOpen={showInputDialog}
          onClose={() => setShowInputDialog(false)}
          onSubmit={deployTemplate}
          isLoading={createInstanceMutation.isPending}
        />
      )}
    </>
  );
}
