"use client";

import { assign, createMachine } from "xstate";

export type Page = "chat" | "project";

export interface NavigationContext {
  currentPage: Page;
}

export type NavigationEvent = { type: "GO_CHAT" } | { type: "GO_PROJECT" };

export const navigationMachine = createMachine({
  /**
   * XState v5 type annotations for context and events
   */
  types: {} as { context: NavigationContext; events: NavigationEvent },
  id: "navigation",
  initial: "chat",
  context: {
    currentPage: "chat",
  },
  states: {
    chat: {},
    project: {},
  },
  on: {
    GO_CHAT: {
      target: "chat",
      actions: assign({ currentPage: "chat" }),
    },
    GO_PROJECT: {
      target: "project",
      actions: assign({ currentPage: "project" }),
    },
  },
});
