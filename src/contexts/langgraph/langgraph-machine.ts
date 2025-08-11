import { assign, createMachine } from "xstate";

export type LanggraphState = {
  base_url: string;
  api_key: string;
  model: string;
};

export type LanggraphEvent =
  | { type: "ACTIVATE" }
  | { type: "DEACTIVATE" }
  | {
      type: "SET_CONFIG";
      base_url?: string;
      api_key?: string;
      model?: string;
    };

export const langgraphMachine = createMachine({
  /** XState v5 generics */
  types: {} as { context: LanggraphState; events: LanggraphEvent },
  id: "langgraph",
  initial: "idle",
  context: {
    base_url: "",
    api_key: "",
    model: "",
  },
  states: {
    idle: {
      on: {
        ACTIVATE: "active",
      },
    },
    active: {
      on: {
        DEACTIVATE: "idle",
      },
    },
  },
  on: {
    SET_CONFIG: {
      actions: assign({
        base_url: ({ context, event }) => event.base_url ?? context.base_url,
        api_key: ({ context, event }) => event.api_key ?? context.api_key,
        model: ({ context, event }) => event.model ?? context.model,
      }),
    },
  },
});
