"use client";

import { createContext, use, useCallback } from "react";
import type { EventFrom, StateFrom } from "xstate";
import type { Chat, copilotMachine } from "./copilot.state";

interface CopilotMachineContextValue {
	chats: Chat[];
	opened: boolean;
	state: StateFrom<typeof copilotMachine>;
	send: (event: EventFrom<typeof copilotMachine>) => void;
}

export const copilotMachineContext = createContext<
	CopilotMachineContextValue | undefined
>(undefined);

export function useCopilotMachineContext() {
	const ctx = use(copilotMachineContext);
	if (!ctx) {
		throw new Error(
			"useCopilotMachineContext must be used within a CopilotMachineProvider",
		);
	}
	return ctx;
}

export function useCopilotState() {
	const { state } = useCopilotMachineContext();

	return {
		chats: state.context.chats,
		opened: state.context.opened,
		isIdle: state.matches("idle"),
	};
}

export function useCopilotEvents() {
	const { send } = useCopilotMachineContext();

	return {
		addChat: useCallback((chat: Chat) => send({ type: "ADD_CHAT", chat }), [send]),
		pushChat: useCallback((chat: Chat) => send({ type: "PUSH_CHAT", chat }), [send]),
		updateChat: useCallback((index: number, chat: Partial<Chat>) =>
			send({ type: "UPDATE_CHAT", index, chat }), [send]),
		setChats: useCallback((chats: Chat[]) => send({ type: "SET_CHATS", chats }), [send]),
		clearChats: useCallback(() => send({ type: "CLEAR_CHATS" }), [send]),
		open: useCallback(() => send({ type: "OPEN_COPILOT" }), [send]),
		close: useCallback(() => send({ type: "CLOSE_COPILOT" }), [send]),
		toggleCopilot: useCallback(() => send({ type: "TOGGLE_COPILOT" }), [send]),
	};
}
