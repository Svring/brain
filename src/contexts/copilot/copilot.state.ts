"use client";

import { assign, createMachine } from "xstate";

// Chat object interface
export interface Chat {
	metadata: Record<string, string>;
}

// Copilot context interface
export interface CopilotContext {
	chats: Chat[];
	opened: boolean;
}

export type CopilotEvent =
	| { type: "ADD_CHAT"; chat: Chat }
	| { type: "PUSH_CHAT"; chat: Chat }
	| { type: "UPDATE_CHAT"; index: number; chat: Partial<Chat> }
	| { type: "SET_CHATS"; chats: Chat[] }
	| { type: "CLEAR_CHATS" }
	| { type: "OPEN_COPILOT" }
	| { type: "CLOSE_COPILOT" }
	| { type: "TOGGLE_COPILOT" };

export const copilotMachine = createMachine({
	types: {} as {
		context: CopilotContext;
		events: CopilotEvent;
	},
	id: "copilot",
	initial: "idle",
	context: {
		chats: [],
		opened: false,
	},
	states: {
		idle: {
			on: {
				ADD_CHAT: {
					actions: assign({
						chats: ({ context, event }) => [...context.chats, event.chat],
						opened: true,
					}),
				},
				PUSH_CHAT: {
					actions: assign({
						chats: ({ context, event }) => [event.chat, ...context.chats],
					}),
				},
				UPDATE_CHAT: {
					actions: assign({
						chats: ({ context, event }) =>
							context.chats.map((chat, index) =>
								index === event.index ? { ...chat, ...event.chat } : chat,
							),
					}),
				},
				SET_CHATS: {
					actions: assign({ chats: ({ event }) => event.chats }),
				},
				CLEAR_CHATS: {
					actions: assign({ chats: [] }),
				},
				OPEN_COPILOT: {
					actions: assign({ opened: true }),
				},
				CLOSE_COPILOT: {
					actions: assign({ opened: false }),
				},
				TOGGLE_COPILOT: {
					actions: assign({
						opened: ({ context }) => !context.opened,
					}),
				},
			},
		},
	},
});
