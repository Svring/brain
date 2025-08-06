import { useState, useMemo } from "react";
import { useToast } from "@/hooks/general/use-toast";
import type { TemplateResource } from "@/lib/sealos/template/schemas/template-api-context-schemas";
import { useCreateInstanceMutation } from "@/lib/sealos/template/template-method/template-mutation";
import { createTemplateApiContext } from "@/lib/auth/auth-utils";

export function useTemplateCard(template: TemplateResource) {
  const { toast } = useToast();
  const [showInputDialog, setShowInputDialog] = useState(false);

  const apiContext = createTemplateApiContext();

  const createInstanceMutation = useCreateInstanceMutation(apiContext);

  // Check if template has required inputs or any inputs at all
  const hasInputs =
    template.spec.inputs && Object.keys(template.spec.inputs).length > 0;

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

  return {
    showInputDialog,
    setShowInputDialog,
    hasInputs,
    isDeploying: createInstanceMutation.isPending,
    handleDeploy,
    deployTemplate,
  };
}
