import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHomeChat } from "@/components/provider/home-chat-provider";
import { useThreads } from "@/components/provider/thread-provider";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useProjectCreate } from "@/hooks/brain/use-project-create";
import type { ProjectProposal } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import {
	computeResourceTotalsFromProposal,
	finalizeDeploymentFlow,
} from "@/lib/langgraph/langgraph-method/langgraph-utils";
import { useResourceQuotaChecker } from "@/lib/validation/resource-quota-checker";

export const useImageDeployment = (args: {
	image_name: string;
	project_name: string;
	name: string;
	ports?: number[];
}) => {
	const { createProject, isCreating } = useProjectCreate();
	const { checkAndShowQuotaError } = useResourceQuotaChecker();
	const { submit, threadId, messages } = useHomeChat();
	const { patchThread, updateThreadState } = useThreads();
	const { openProjectChat } = useChatActions();
	const router = useRouter();
	const { auth } = useAuthState();

	const [internalProposal, setInternalProposal] = useState<ProjectProposal>(
		() => {
			// Create initial proposal from args
			const projectName = args.project_name;
			const containerName = args.name;

			return {
				name: projectName,
				resources: {
					app: [
						{
							name: containerName,
							image: args.image_name,
							ports: (args.ports || []).map((port: number) => ({
								number: port,
								publicAccess: true,
							})),
						},
					],
				},
			};
		},
	);

	const deployImage = async () => {
		try {
			const totals = computeResourceTotalsFromProposal(internalProposal);
			const quotaCheckPassed = checkAndShowQuotaError({
				cpu: totals.cpu,
				memory: totals.memory,
				storage: totals.storage,
				ports: totals.ports,
			});

			if (!quotaCheckPassed) {
				return;
			}

			// Create the project
			const createdProjectName = await createProject(internalProposal);

			await finalizeDeploymentFlow({
				threadId,
				kubeconfig: auth?.kubeconfig,
				projectName: createdProjectName as string,
				messages,
				patchThreadMutate: patchThread.mutate,
				updateThreadStateMutate: updateThreadState.mutate,
				openProjectChat,
				routerPush: router.push,
			});

			return createdProjectName;
		} catch (error) {
			console.error("[useImageDeployment] Failed to deploy image:", error);
			throw error;
		}
	};

	return {
		internalProposal,
		setInternalProposal,
		deployImage,
		isCreating,
	};
};