"use client";

import type { Message } from "@langchain/langgraph-sdk";
import { useMachine } from "@xstate/react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
} from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { langgraphMachine } from "@/contexts/langgraph/langgraph-machine";
import type { BrainState } from "@/contexts/langgraph/langgraph-schema";
import { useProjectState } from "@/contexts/project/project-context";
import type { ProjectContextState } from "@/contexts/project/project-machine";

interface LanggraphContextValue {
	state: StateFrom<typeof langgraphMachine>;
	send: (event: EventFrom<typeof langgraphMachine>) => void;
	actorRef: ActorRefFrom<typeof langgraphMachine>;
}

export const LanggraphContext = createContext<
	LanggraphContextValue | undefined
>(undefined);

// Updated LanggraphProvider that receives config as props
export const LanggraphProvider = ({
	children,
	config,
}: {
	children: ReactNode;
	config: {
		apiKey?: string;
		baseUrl?: string;
		modelName?: string;
	};
}) => {
	const [state, send, actorRef] = useMachine(langgraphMachine);

	// Only set config from props if provided (for backward compatibility)
	useEffect(() => {
		if (config.apiKey && config.baseUrl && config.modelName) {
			send({
				type: "SET_CONFIG",
				api_key: config.apiKey,
				base_url: config.baseUrl,
				model_name: config.modelName,
			});
		}
	}, [config.apiKey, config.baseUrl, config.modelName]);

	return (
		<LanggraphContext.Provider value={{ state, send, actorRef }}>
			{children}
		</LanggraphContext.Provider>
	);
};

export function useLanggraphContext() {
	const ctx = useContext(LanggraphContext);
	if (!ctx)
		throw new Error(
			"useLanggraphContext must be used within LanggraphProvider",
		);
	return ctx;
}

export function useLanggraphState() {
	const { state } = useLanggraphContext();
	return {
		baseUrl: state.context.base_url,
		apiKey: state.context.api_key,
		modelName: state.context.model_name,
		contextWindowUsage: state.context.context_window_usage,
		stage: state.context.stage,
		resourceContext: state.context.resource_context,
		isIdle: state.matches("idle"),
		isActive: state.matches("active"),
		isLoading: state.matches("loading"),
		isLoaded: state.matches("loaded"),
		isUnloaded: state.matches("unloaded"),
	};
}

export function useLanggraphActions() {
	const { send, state } = useLanggraphContext();

	const setConfig = useCallback(
		(config: { base_url?: string; api_key?: string; model_name?: string }) => {
			send({ type: "SET_CONFIG", ...config });
		},
		[send],
	);

	const setConfigFailed = useCallback(() => {
		send({ type: "SET_CONFIG_FAILED" });
	}, [send]);

	const setStage = useCallback(
		(
			stage:
				| "propose_project"
				| "manage_project"
				| "manage_resource"
				| "suggestion",
		) => {
			send({ type: "SET_STAGE", stage });
		},
		[send],
	);

	const setProjectContext = useCallback(
		(projectContext: ProjectContextState) => {
			send({ type: "SET_PROJECT_CONTEXT", project_context: projectContext });
		},
		[send],
	);

	const setContextWindowUsage = useCallback(
		(contextWindowUsage: number) => {
			send({
				type: "SET_CONTEXT_WINDOW_USAGE",
				context_window_usage: contextWindowUsage,
			});
		},
		[send],
	);

	const setResourceContext = useCallback(
		(resourceContext: any) => {
			send({ type: "SET_RESOURCE_CONTEXT", resource_context: resourceContext });
		},
		[send],
	);

	const updateResourceContext = useCallback(
		(resourceContext: any) => {
			send({
				type: "UPDATE_RESOURCE_CONTEXT",
				resource_context: resourceContext,
			});
		},
		[send],
	);

	const clearResourceContext = useCallback(() => {
		send({ type: "CLEAR_RESOURCE_CONTEXT" });
	}, [send]);

	return {
		setConfig,
		setConfigFailed,
		setStage,
		setProjectContext,
		setContextWindowUsage,
		setResourceContext,
		updateResourceContext,
		clearResourceContext,
	};
}
