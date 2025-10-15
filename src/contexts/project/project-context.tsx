"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import _ from "lodash";
import { createContext, type ReactNode, useCallback, useContext } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import {
	useLanggraphActions,
	useLanggraphState,
} from "@/contexts/langgraph/langgraph-context";
import {
	projectMachine,
	type ResourceObject,
} from "@/contexts/project/project-machine";
import type { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

// const inspector = createBrowserInspector();

interface ProjectContextValue {
	state: StateFrom<typeof projectMachine>;
	send: (event: EventFrom<typeof projectMachine>) => void;
	actorRef: ActorRefFrom<typeof projectMachine>;
}

export const ProjectContext = createContext<ProjectContextValue | undefined>(
	undefined,
);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
	const [state, send, actorRef] = useMachine(projectMachine, {
		// inspect: inspector.inspect,
	});

	return (
		<ProjectContext.Provider value={{ state, send, actorRef }}>
			{children}
		</ProjectContext.Provider>
	);
};

export function useProjectContext() {
	const ctx = useContext(ProjectContext);
	if (!ctx)
		throw new Error("useProjectContext must be used within ProjectProvider");
	return ctx;
}

export function useProjectState() {
	const { state } = useProjectContext();
	return {
		allProjects: state.context.allProjects,
		selectedProject: state.context.selectedProject,
		selectedProjectResources: state.context.selectedProjectResources,
		selectedResource: state.context.selectedResource,
		selectedResourceContext: state.context.selectedResourceContext,
	};
}

export function useProjectActions() {
	const { send, state } = useProjectContext();
	const { setProjectContext } = useLanggraphActions();

	const setAllProjects = useCallback(
		(projects: unknown[]) => {
			send({ type: "SET_ALL_PROJECTS", projects });
		},
		[send],
	);

	const selectProject = useCallback(
		(project: string) => {
			send({ type: "SELECT_PROJECT", project });
		},
		[send],
	);

	const clearSelectedProject = useCallback(() => {
		send({ type: "CLEAR_SELECTED_PROJECT" });
	}, [send]);

	const setSelectedProjectResources = useCallback(
		(resources: any[]) => {
			send({ type: "SET_SELECTED_PROJECT_RESOURCES", resources });
			setProjectContext({
				...state.context,
				selectedProjectResources: resources,
			});
		},
		[send, state.context, setProjectContext],
	);

	const clearSelectedProjectResources = useCallback(() => {
		send({ type: "CLEAR_SELECTED_PROJECT_RESOURCES" });
	}, [send]);

	const updateResource = useCallback(
		(resource: ResourceObject) => {
			send({ type: "UPDATE_RESOURCE", resource });
		},
		[send],
	);

	const removeResource = useCallback(
		(name: string, kind: string) => {
			send({ type: "REMOVE_RESOURCE", name, kind });
		},
		[send],
	);

	const selectResource = useCallback(
		(target: ResourceTarget) => {
			send({ type: "SELECT_RESOURCE", target });
			setProjectContext({
				...state.context,
				selectedResource: target,
			});
		},
		[send, state.context, setProjectContext],
	);

	const clearSelectedResource = useCallback(() => {
		send({ type: "CLEAR_SELECTED_RESOURCE" });
		setProjectContext({
			...state.context,
			selectedResource: null,
		});
	}, [send, state.context, setProjectContext]);

	const setSelectedResourceContext = useCallback(
		(context: any) => {
			send({ type: "SET_SELECTED_RESOURCE_CONTEXT", context });
			setProjectContext({
				...state.context,
				selectedResourceContext: context,
			});
		},
		[send, state.context, setProjectContext],
	);

	return {
		setAllProjects,
		selectProject,
		clearSelectedProject,
		setSelectedProjectResources,
		clearSelectedProjectResources,
		updateResource,
		removeResource,
		selectResource,
		clearSelectedResource,
		setSelectedResourceContext,
	};
}

// Export the ResourceObject type for use in other files
export type { ResourceObject };
