import { createMachine } from "xstate";

export type LanggraphState = {
  base_url: string;
  api_key: string;
  model: string;
};

export const langgraphMachine = createMachine({
  id: "langgraph",
  initial: "idle",
  states: {
    idle: {},
  },
});
