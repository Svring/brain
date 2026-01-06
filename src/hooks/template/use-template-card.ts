import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useTemplateApiContext } from "@/lib/auth/auth-utils";
import type { TemplateResource } from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";
import { useCreateInstanceMutation } from "@/lib/sealos/resources/template/template-method/template-mutation";

export function useTemplateCard(
	template: TemplateResource,
	closeDialog?: () => void,
) {
	const [showInputDialog, setShowInputDialog] = useState(false);
	const router = useRouter();
	const apiContext = useTemplateApiContext();

	const createInstanceMutation = useCreateInstanceMutation(apiContext);

	// Check if template has required inputs or any inputs at all (memoized)
	const hasInputs = useMemo(
		() => template.spec.inputs && Object.keys(template.spec.inputs).length > 0,
		[template.spec.inputs],
	);

	// Memoize template name to avoid repeated property access
	const templateName = useMemo(
		() => template.metadata.name,
		[template.metadata.name],
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
					// Guard against undefined project name
					const projectName = data.data?.[0]?.metadata?.name;
					if (projectName && projectName !== "undefined") {
						router.push(`/projects/${projectName}`);
					}
				},
				onError: (error: Error) => {
					toast(
						error.message || "Failed to deploy template. Please try again.",
					);
					setShowInputDialog(false);
				},
			},
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
