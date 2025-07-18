"use client";

import { assign, createMachine } from "xstate";

// Define and export Auth here
export interface Auth {
  namespace: string;
  kubeconfig: string;
  regionUrl: string;
  appToken: string;
}

export interface AuthContext {
  mode: "development" | "production" | null;
  auth: Auth | null;
  error: string | null;
}

export type AuthEvent =
  | { type: "SET_AUTH"; auth: Auth }
  | { type: "FAIL"; error: string }
  | { type: "RETRY" };

export const authMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgOjVsAdugJYDGyJBUAxAMoCiAKgPoCCAqowBIDaADAF1EoAA4B7WMRJiCwkAA9EAJiUA2bAA4A7AFY+fAMxbVAFg0m+SgDQgAnohMXsARi0BOVdtV8zBjToBfAJs8HFDCEnJKGgAxVgBJABl+ISQQcUlpWTTFBBV1bT1DYzMLaztlS2wlEzc6rWcavmcDJUDgkFDcDEwIsgpiKmoUuQypYhk5XPzNXX0jU3NLG3s8tw1sLUNnVzKGrQMgkJ7u-CJ+9EhqOKSRtLGsqcQdJQNsE2cLT1UdVVVnZYVBCOPgudyeYw+DR+drHLDYVAEcLnKJXABKTDRAE07qIJONJjlnq93p8+N9fv9AasNM53nU6jodGYVH5nEEOgQxBA4HJQqN8Y8iQgALSqFaIEU6bAM2VyuqHDpdZGRAZUAWZCbZUC5EzlGlKbCmBnmX5aD4NI6dE4qi6QDUE7UKRAGVRaTYAtwmHQaNw+EzuAwS4GqN4-VQqA4aV5KVyKuE4RG21EQB1CnWIUzSvhuIwvUPObzU5QGN58Yw6BrbHRuLRKDkBIA */
  types: {} as { context: AuthContext; events: AuthEvent },
  id: "auth",
  initial: "authenticating",
  context: {
    mode: null,
    auth: null,
    error: null,
  },
  states: {
    authenticating: {
      entry: [
        assign({
          mode: () =>
            process.env.NEXT_PUBLIC_MODE as "development" | "production" | null,
        }),
      ],
      always: [
        {
          target: "unauthenticated",
          guard: ({ context }) => context.mode == null,
          actions: assign({
            error: () =>
              "Auth mode could not be determined, please set env variable NEXT_PUBLIC_MODE to development or production",
          }),
        },
      ],
      on: {
        SET_AUTH: {
          target: "authenticated",
          actions: assign({ auth: ({ event }) => event.auth }),
        },
        FAIL: {
          target: "unauthenticated",
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    authenticated: {
      on: {
        FAIL: {
          target: "unauthenticated",
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    unauthenticated: {
      on: {
        RETRY: "authenticating",
      },
    },
  },
});
