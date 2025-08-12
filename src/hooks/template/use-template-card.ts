import { useState, useMemo } from "react";
import { toast } from "sonner";
import type { TemplateResource } from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";
import { useCreateInstanceMutation } from "@/lib/sealos/resources/template/template-method/template-mutation";
import { createTemplateApiContext } from "@/lib/auth/auth-utils";

export function useTemplateCard(template: TemplateResource) {
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
          toast.success(
            `${template.spec.title} has been deployed to your project.`
          );
          setShowInputDialog(false);
        },
        onError: (error: Error) => {
          toast.error(
            error.message || "Failed to deploy template. Please try again."
          );
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
