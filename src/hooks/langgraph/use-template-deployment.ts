import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useHomeChat } from "@/components/provider/home-chat-provider";
import { useThreads } from "@/components/provider/thread-provider";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useTemplates } from "@/hooks/template/use-templates";
import { useSealosContext, useTemplateApiContext } from "@/lib/auth/auth-utils";
import { finalizeDeploymentFlow } from "@/lib/langgraph/langgraph-method/langgraph-utils";
import { useCreateInstanceMutation } from "@/lib/sealos/resources/template/template-method/template-mutation";

export const useTemplateDeployment = (templateName: string) => {
	const router = useRouter();
	const { auth } = useAuthState();
	const { openProjectChat } = useChatActions();
	const { submit, threadId, messages } = useHomeChat();
	const { patchThread, updateThreadState } = useThreads();
	const [showInputDialog, setShowInputDialog] = useState(false);

	// Get template API context and templates
	const templateApiContext = useTemplateApiContext();
	const { templates, isLoading, error } = useTemplates(templateApiContext);
	const apiContext = useSealosContext();
	const createInstanceMutation = useCreateInstanceMutation(apiContext);

	// Find the template by name (for UI state, inputs, etc.)
	const template = templates.find(
		(t) =>
			t.spec.title.toLowerCase() === templateName.toLowerCase() ||
			t.metadata.name.toLowerCase() === templateName.toLowerCase(),
	);

	// Check if template has inputs
	const hasInputs = Boolean(
		template?.spec.inputs && Object.keys(template.spec.inputs).length > 0,
	);

	const deployTemplate = useCallback(
		(
			params: { templateName: string; templateForm?: Record<string, string> },
			onSuccess?: (data: any) => void,
		) => {
			// Guard against undefined params
			if (!params || !params.templateName) {
				console.error("[useTemplateDeployment] Invalid params:", params);
				return;
			}

			createInstanceMutation.mutate(
				{
					templateName: params.templateName,
					templateForm: params.templateForm,
				},
				{
					onSuccess: async (data) => {
						toast.success(
							`${template?.spec.title || params.templateName} has been deployed to your project.`,
						);
						setShowInputDialog(false);
						onSuccess?.(data);

						const instanceResource = data.data?.find(
							(resource: any) => resource.kind === "Instance",
						);
						if (instanceResource?.metadata?.name) {
							const instanceName = instanceResource.metadata.name;

							await finalizeDeploymentFlow({
								threadId,
								kubeconfig: auth?.kubeconfig,
								projectName: instanceName as string,
								messages,
								patchThreadMutate: patchThread.mutate,
								updateThreadStateMutate: updateThreadState.mutate,
								openProjectChat,
								routerPush: router.push,
							});
						}
					},
					onError: (error: Error) => {
						// Check if error is quota-related
						const errorMessage =
							error.message?.toLowerCase().includes("quota") ||
							error.message?.toLowerCase().includes("insufficient")
								? "Insufficient quota, please upgrade."
								: error.message ||
									"Failed to deploy template. Please try again.";

						toast.error(errorMessage);
						setShowInputDialog(false);
					},
				},
			);
		},
		[templates, createInstanceMutation, threadId, auth?.kubeconfig],
	);

	const handleDeploy = useCallback(() => {
		if (hasInputs) {
			setShowInputDialog(true);
		} else {
			deployTemplate({ templateName });
		}
	}, [hasInputs, deployTemplate, templateName]);

	return {
		template,
		hasInputs,
		showInputDialog,
		setShowInputDialog,
		deployTemplate,
		handleDeploy,
		isLoading,
		error,
		isDeploying: createInstanceMutation.isPending,
	};
};
