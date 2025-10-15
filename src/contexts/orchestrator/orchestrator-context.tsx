"use client";

import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useCallback, useContext } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { orchestratorMachine } from "@/contexts/orchestrator/orchestrator-machine";
import { useOrchestratorCloseChat } from "@/hooks/contexts/orchestrator/use-orchestrator-close-chat";
import { useOrchestratorFitView } from "@/hooks/contexts/orchestrator/use-orchestrator-fitview";
import { useOrchestratorProjectCleanup } from "@/hooks/contexts/orchestrator/use-orchestrator-project-cleanup";
import { useOrchestratorSidebarMaximized } from "@/hooks/contexts/orchestrator/use-orchestrator-sidebar-maximized";
import { useOrchestratorStageManagement } from "@/hooks/contexts/orchestrator/use-orchestrator-stage-management";

interface OrchestratorContextValue {
	state: StateFrom<typeof orchestratorMachine>;
	send: (event: EventFrom<typeof orchestratorMachine>) => void;
	actorRef: ActorRefFrom<typeof orchestratorMachine>;
}

export const OrchestratorContext = createContext<
	OrchestratorContextValue | undefined
>(undefined);

export const OrchestratorProvider = ({ children }: { children: ReactNode }) => {
	const [state, send, actorRef] = useMachine(orchestratorMachine);

	// Use the extracted hooks for handling various orchestrator logic
	useOrchestratorCloseChat({ state, send });
	useOrchestratorStageManagement();
	useOrchestratorSidebarMaximized({ state, send });
	useOrchestratorProjectCleanup({ state, send });
	useOrchestratorFitView();

	return (
		<OrchestratorContext.Provider value={{ state, send, actorRef }}>
			{children}
		</OrchestratorContext.Provider>
	);
};

export function useOrchestratorContext() {
	const ctx = useContext(OrchestratorContext);
	if (!ctx)
		throw new Error(
			"useOrchestratorContext must be used within OrchestratorProvider",
		);
	return ctx;
}

export function useOrchestratorState() {
	const { state } = useOrchestratorContext();
	return { monitoredStates: state.context.monitoredStates };
}

export function useOrchestratorActions() {
	const { send } = useOrchestratorContext();

	const updateSidebarChatState = useCallback(
		(open: boolean) => send({ type: "UPDATE_SIDEBAR_CHAT_STATE", open }),
		[send],
	);

	const updateSidebarChatMaximized = useCallback(
		(maximized: boolean) =>
			send({ type: "UPDATE_SIDEBAR_CHAT_MAXIMIZED", maximized }),
		[send],
	);

	const updateSelectedProject = useCallback(
		(project: string | null) =>
			send({ type: "UPDATE_SELECTED_PROJECT", project }),
		[send],
	);

	return {
		updateSidebarChatState,
		updateSidebarChatMaximized,
		updateSelectedProject,
	};
}
