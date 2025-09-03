import { useState, useMemo } from "react";
import { toast } from "sonner";
import type { TemplateResource } from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";
import { useCreateInstanceMutation } from "@/lib/sealos/resources/template/template-method/template-mutation";
import { useTemplateApiContext } from "@/lib/auth/auth-utils";
import { useRouter } from "next/navigation";

export function useTemplateCard(
  template: TemplateResource,
  closeDialog?: () => void
) {
  const [showInputDialog, setShowInputDialog] = useState(false);
  const router = useRouter();
  const apiContext = useTemplateApiContext();

  const createInstanceMutation = useCreateInstanceMutation(apiContext);

  // Check if template has required inputs or any inputs at all (memoized)
  const hasInputs = useMemo(
    () => template.spec.inputs && Object.keys(template.spec.inputs).length > 0,
    [template.spec.inputs]
  );

  // Memoize template name to avoid repeated property access
  const templateName = useMemo(
    () => template.metadata.name,
    [template.metadata.name]
  );

  const deployTemplate = (templateForm?: Record<string, string>) => {
    createInstanceMutation.mutate(
      {
        templateName,
        templateForm,
      },
      {
        onSuccess: (data) => {
          toast(`${template.spec.title} has been deployed to your project.`);
          setShowInputDialog(false);
          // Only call closeDialog if it was passed
          if (closeDialog) {
            closeDialog();
          }
          router.push(`/projects/${data.data[0].metadata.name}`);
        },
        onError: (error: Error) => {
          toast(
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
