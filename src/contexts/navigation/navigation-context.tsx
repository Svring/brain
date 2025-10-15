"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
} from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import {
	getAvailableViewsForResourceType,
	navigationMachine,
	type ResourceView,
} from "@/contexts/navigation/navigation-machine";
import type { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

// const inspector = createBrowserInspector();

interface NavigationContextValue {
	state: StateFrom<typeof navigationMachine>;
	send: (event: EventFrom<typeof navigationMachine>) => void;
	actorRef: ActorRefFrom<typeof navigationMachine>;
}

export const NavigationContext = createContext<
	NavigationContextValue | undefined
>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
	const [state, send, actorRef] = useMachine(navigationMachine, {
		// inspect: inspector.inspect,
	});

	// Log navigation state changes directly in the provider
	// useEffect(() => {
	//   console.log("NavigationProvider - State changed:", {
	//     currentPage: state.context.currentPage,
	//     selectedProject: state.context.selectedProject,
	//     selectedResource: state.context.selectedResource,
	//     activeView: state.context.activeView,
	//   });
	// }, [
	//   state.context.currentPage,
	//   state.context.selectedProject,
	//   state.context.selectedResource,
	//   state.context.activeView,
	// ]);

	return (
		<NavigationContext.Provider value={{ state, send, actorRef }}>
			{children}
		</NavigationContext.Provider>
	);
};

export function useNavigationContext() {
	const ctx = useContext(NavigationContext);
	if (!ctx)
		throw new Error(
			"useNavigationContext must be used within NavigationProvider",
		);
	return ctx;
}

export function useNavigationState() {
	const { state } = useNavigationContext();

	// Helper to check if a resource is selected
	const isResourceSelected = (resourceTarget: ResourceTarget): boolean => {
		const selectedResource = state.context.selectedResource;
		if (!selectedResource) return false;
		return JSON.stringify(selectedResource) === JSON.stringify(resourceTarget);
	};

	// Helper to get available views for the selected resource
	const getAvailableViews = (): ResourceView[] => {
		const selectedResource = state.context.selectedResource;
		if (!selectedResource) return [];
		return getAvailableViewsForResourceType(selectedResource.resourceType);
	};

	return {
		// Page state
		currentPage: state.context.currentPage,
		selectedProject: state.context.selectedProject,
		selectedResource: state.context.selectedResource,
		activeView: state.context.activeView,

		// Page matchers
		isHome: state.matches("home"),
		isProjectOverview: state.matches("project-overview"),
		isProjectDetail: state.matches("project-detail"),

		// Helper functions
		isResourceSelected,
		getAvailableViews,
	};
}

export function useNavigationActions() {
	const { send } = useNavigationContext();

	const goHome = useCallback(() => send({ type: "GO_HOME" }), [send]);

	const goProjectOverview = useCallback(
		() => send({ type: "GO_PROJECT_OVERVIEW" }),
		[send],
	);

	const goProjectDetail = useCallback(
		(projectName: string) => send({ type: "GO_PROJECT_DETAIL", projectName }),
		[send],
	);

	const selectResource = useCallback(
		(resourceTarget: ResourceTarget) => {
			send({ type: "SELECT_RESOURCE", resourceTarget });
		},
		[send],
	);

	const changeView = useCallback(
		(view: ResourceView) => {
			send({ type: "CHANGE_VIEW", view });
		},
		[send],
	);

	const closeResource = useCallback(
		() => send({ type: "CLOSE_RESOURCE" }),
		[send],
	);

	const setSelectedProject = useCallback(
		(projectName: string | null) =>
			send({ type: "SET_SELECTED_PROJECT", projectName }),
		[send],
	);

	return {
		// Page navigation
		goHome,
		goProjectOverview,
		goProjectDetail,

		// Resource navigation
		selectResource,
		changeView,
		closeResource,

		// Project selection
		setSelectedProject,
	};
}
