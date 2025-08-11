import { assign, createMachine } from "xstate";

export type LanggraphAgentAiState = {
  base_url: string;
  api_key: string;
  model: string;
};

type DevBox = {
  name?: string;
  [key: string]: any;
};

type Database = {
  name?: string;
  [key: string]: any;
};

type ObjectStorageBucket = {
  name?: string;
  [key: string]: any;
};

type ProjectResources = {
  devboxes: DevBox[];
  databases: Database[];
  buckets: ObjectStorageBucket[];
};

type ProjectInfo = {
  name?: string;
  description?: string;
  resources?: ProjectResources;
};

export type LanggraphAgentNewProjectState = {
  base_url: string;
  api_key: string;
  model: string;
  observed_steps: string[];
  project?: ProjectInfo;
  project_brief?: string;
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
  types: {} as { context: LanggraphAgentAiState; events: LanggraphEvent },
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
