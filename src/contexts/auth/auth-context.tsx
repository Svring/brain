"use client";

import { useMount } from "@reactuses/core";
import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, use } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import type { Auth } from "@/contexts/auth/auth-machine";
import { authMachine } from "@/contexts/auth/auth-machine";
import { authenticateDev, authenticateProd } from "@/lib/auth/auth-utils";
import type { User } from "@/payload-types";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useEnv } from "@/components/provider/env-provider";

// const inspector = createBrowserInspector();

interface AuthContextValue {
  auth: Auth | null;
  state: StateFrom<typeof authMachine>;
  send: (event: EventFrom<typeof authMachine>) => void;
  actorRef: ActorRefFrom<typeof authMachine>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({
  children,
  payloadUser,
}: {
  children: ReactNode;
  payloadUser: User | null;
}) => {
  const { MODE } = useEnv();

  const [state, send, actorRef] = useMachine(authMachine, {
    // inspect: inspector.inspect,
    input: {
      mode: MODE as "development" | "production" | null,
    },
  });

  useMount(() => {
    const isProduction = state.context.mode === "production";
    if (isProduction) {
      authenticateProd(send);
    } else {
      authenticateDev(payloadUser!, send);
    }
  });

  if (state.matches("authenticating")) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        auth: state.context.auth,
        state,
        send,
        actorRef,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext() {
  const ctx = use(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}

export function useAuthState() {
  const { state } = useAuthContext();
  return {
    auth: state.context.auth,
    mode: state.context.mode,
    error: state.context.error,
    isAuthenticated: state.matches("authenticated"),
    isAuthenticating: state.matches("authenticating"),
    isUnauthenticated: state.matches("unauthenticated"),
  };
}

export function useAuthActions() {
  const { send } = useAuthContext();

  return {
    setAuth: (auth: Auth) => send({ type: "SET_AUTH", auth }),
    fail: (error: string) => send({ type: "FAIL", error }),
    retry: () => send({ type: "RETRY" }),
  };
}
