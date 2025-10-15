"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import type { Edge, EdgeChange, Node, NodeChange } from "@xyflow/react";
import {
	applyEdgeChanges,
	applyNodeChanges,
	useReactFlow,
} from "@xyflow/react";
import { createContext, type ReactNode, useCallback, useContext } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { flowgraphMachine } from "@/contexts/flowgraph/flowgraph-machine";

// const inspector = createBrowserInspector();

interface FlowgraphContextValue {
	state: StateFrom<typeof flowgraphMachine>;
	send: (event: EventFrom<typeof flowgraphMachine>) => void;
	actorRef: ActorRefFrom<typeof flowgraphMachine>;
}

export const FlowgraphContext = createContext<
	FlowgraphContextValue | undefined
>(undefined);

export const FlowgraphProvider = ({ children }: { children: ReactNode }) => {
	const [state, send, actorRef] = useMachine(flowgraphMachine, {
		// inspect: inspector.inspect,
	});

	return (
		<FlowgraphContext.Provider value={{ state, send, actorRef }}>
			{children}
		</FlowgraphContext.Provider>
	);
};

export function useFlowgraphContext() {
	const ctx = useContext(FlowgraphContext);
	if (!ctx)
		throw new Error(
			"useFlowgraphContext must be used within FlowgraphProvider",
		);
	return ctx;
}

export function useFlowgraphState() {
	const { state } = useFlowgraphContext();
	return {
		nodes: state.context.nodes,
		edges: state.context.edges,
		selectedNode: state.context.selectedNode,
		selectedEdge: state.context.selectedEdge,
		fitViewTrigger: state.context.fitViewTrigger,
		refreshTrigger: state.context.refreshTrigger,
	};
}

export function useFlowgraphActions() {
	const { state, send } = useFlowgraphContext();

	const setNodes = useCallback(
		(nodes: Node[]) => send({ type: "SET_NODES", nodes }),
		[send],
	);
	const setEdges = useCallback(
		(edges: Edge[]) => send({ type: "SET_EDGES", edges }),
		[send],
	);
	const addNode = useCallback(
		(node: Node) => send({ type: "ADD_NODE", node }),
		[send],
	);
	const addEdge = useCallback(
		(edge: Edge) => send({ type: "ADD_EDGE", edge }),
		[send],
	);
	const updateNode = useCallback(
		(node: Node) => send({ type: "UPDATE_NODE", node }),
		[send],
	);
	const updateEdge = useCallback(
		(edge: Edge) => send({ type: "UPDATE_EDGE", edge }),
		[send],
	);
	const removeNode = useCallback(
		(id: string) => send({ type: "REMOVE_NODE", id }),
		[send],
	);
	const removeEdge = useCallback(
		(id: string) => send({ type: "REMOVE_EDGE", id }),
		[send],
	);
	const selectNode = useCallback(
		(id: string) => send({ type: "SELECT_NODE", id }),
		[send],
	);
	const selectEdge = useCallback(
		(id: string) => send({ type: "SELECT_EDGE", id }),
		[send],
	);
	const clearSelectedNode = useCallback(
		() => send({ type: "CLEAR_SELECTED_NODE" }),
		[send],
	);
	const clearSelectedEdge = useCallback(
		() => send({ type: "CLEAR_SELECTED_EDGE" }),
		[send],
	);
	const clearAllState = useCallback(
		() => send({ type: "CLEAR_ALL_STATE" }),
		[send],
	);

	const focusNode = useCallback(
		(nodeId: string) => {
			const node = state.context.nodes.find((n) => n.id === nodeId);
			if (node) {
				send({ type: "SELECT_NODE", id: nodeId });
			}
		},
		[state.context.nodes, send],
	);

	const onNodesChange = useCallback(
		(changes: NodeChange[]) =>
			send({
				type: "SET_NODES",
				nodes: applyNodeChanges(changes, state.context.nodes),
			}),
		[send, state.context.nodes],
	);

	const onEdgesChange = useCallback(
		(changes: EdgeChange[]) =>
			send({
				type: "SET_EDGES",
				edges: applyEdgeChanges(changes, state.context.edges),
			}),
		[send, state.context.edges],
	);

	const fitView = useCallback(() => send({ type: "FIT_VIEW" }), [send]);
	const refresh = useCallback(() => send({ type: "REFRESH" }), [send]);

	return {
		setNodes,
		setEdges,
		addNode,
		addEdge,
		updateNode,
		updateEdge,
		removeNode,
		removeEdge,
		selectNode,
		selectEdge,
		clearSelectedNode,
		clearSelectedEdge,
		clearAllState,
		focusNode,
		onNodesChange,
		onEdgesChange,
		fitView,
		refresh,
	};
}
