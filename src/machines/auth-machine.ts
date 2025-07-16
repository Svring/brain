"use client";

import { createMachine, assign } from "xstate";
import type { Auth } from "@/contexts/auth-context";

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
            error: () => "Auth mode could not be determined",
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
