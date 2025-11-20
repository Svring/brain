import { useRouter } from "next/navigation";
import { runParallelAction } from "next-server-actions-parallel";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useHomeChat } from "@/components/provider/home-chat-provider";
import { useThreads } from "@/components/provider/thread-provider";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useTemplates } from "@/hooks/template/use-templates";
import { useSealosContext, useTemplateApiContext } from "@/lib/auth/auth-utils";
import { finalizeDeploymentFlow } from "@/lib/langgraph/langgraph-method/langgraph-utils";
import { getTemplateSource } from "@/lib/sealos/resources/template/template-api/template-old-api";
import { useCreateInstanceMutation } from "@/lib/sealos/resources/template/template-method/template-mutation";
import { useResourceQuotaChecker } from "@/lib/validation/resource-quota-checker";

export const useTemplateDeployment = (templateName: string) => {
	const router = useRouter();
	const { auth } = useAuthState();
	const { openProjectChat } = useChatActions();
	const { threadId, messages } = useHomeChat();
	const { patchThread, updateThreadState } = useThreads();
	const [showInputDialog, setShowInputDialog] = useState(false);

	// Get template API context and templates
	const templateApiContext = useTemplateApiContext();
	const { templates, isLoading, error } = useTemplates(templateApiContext);
	const apiContext = useSealosContext();
	const createInstanceMutation = useCreateInstanceMutation(apiContext);
	const { checkAndShowQuotaError } = useResourceQuotaChecker();

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

	// Check if template has any required fields
	const hasRequired = Boolean(
		template?.spec.inputs &&
			Object.values(template.spec.inputs).some(
				(input: any) => input?.required === true,
			),
	);

	// Helper function to get default values from template inputs
	const getDefaultValues = useCallback(() => {
		const defaults: Record<string, string> = {};

		if (template?.spec.inputs) {
			Object.entries(template.spec.inputs).forEach(([key, input]) => {
				const i: any = input as any;
				if (!i) return;

				switch (i.type) {
					case "boolean":
						defaults[key] =
							i.default === "true" || i.default === true ? "true" : "false";
						break;
					case "number":
						defaults[key] = i.default?.toString() || "";
						break;
					default:
						defaults[key] = i.default?.toString() || "";
				}
			});
		}

		return defaults;
	}, [template]);

	const deployTemplate = useCallback(
		async (
			params: { templateName: string; templateForm?: Record<string, string> },
			onSuccess?: (data: any) => void,
		) => {
			// Guard against undefined params
			if (!params || !params.templateName) {
				console.error("[useTemplateDeployment] Invalid params:", params);
				return;
			}

			try {
				// Fetch template details to get resource requirements
				const templateDetails = await runParallelAction(
					getTemplateSource(templateApiContext, params.templateName),
				);

				// Check quota before deployment
				const resourceData = templateDetails?.data?.resource;
				if (resourceData) {
					const quotaCheckPassed = checkAndShowQuotaError({
						cpu: resourceData.cpu,
						memory: resourceData.memory,
						storage: resourceData.storage,
						ports: resourceData.nodeport,
					});

					if (!quotaCheckPassed) {
						// Quota check failed, error toast is shown by checkAndShowQuotaError
						return;
					}
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
						onError: () => {
							setShowInputDialog(false);
						},
					},
				);
			} catch (error) {
				console.error(
					"[useTemplateDeployment] Failed to fetch template:",
					error,
				);
				toast.error("Failed to fetch template details. Please try again.");
			}
		},
		[templateApiContext, checkAndShowQuotaError, createInstanceMutation],
	);

	const handleDeploy = useCallback(() => {
		if (hasRequired) {
			// Only show input dialog if there are required fields
			setShowInputDialog(true);
		} else if (hasInputs) {
			// If there are inputs but no required fields, use default values and deploy
			const defaultValues = getDefaultValues();
			deployTemplate({ templateName, templateForm: defaultValues });
		} else {
			// No inputs at all, deploy directly
			deployTemplate({ templateName });
		}
	}, [hasRequired, hasInputs, getDefaultValues, deployTemplate, templateName]);

	return {
		template,
		hasInputs,
		hasRequired,
		showInputDialog,
		setShowInputDialog,
		deployTemplate,
		handleDeploy,
		isLoading,
		error,
		isDeploying: createInstanceMutation.isPending,
	};
};
