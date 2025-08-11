"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { navigationMachine } from "@/contexts/navigation/navigation-machine";

// const inspector = createBrowserInspector();

interface NavigationContextValue {
  state: StateFrom<typeof navigationMachine>;
  send: (event: EventFrom<typeof navigationMachine>) => void;
  actorRef: ActorRefFrom<typeof navigationMachine>;
}

export const NavigationContext =
  createContext<NavigationContextValue | undefined>(undefined);

export const NavigationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, send, actorRef] = useMachine(navigationMachine, {
    // inspect: inspector.inspect,
  });

  return (
    <NavigationContext.Provider value={{ state, send, actorRef }}>
      {children}
    </NavigationContext.Provider>
  );
};

export function useNavigationContext() {
  const ctx = useContext(NavigationContext);
  if (!ctx)
    throw new Error(
      "useNavigationContext must be used within NavigationProvider"
    );
  return ctx;
}

export function useNavigationState() {
  const { state } = useNavigationContext();
  return {
    currentPage: state.context.currentPage,
    isChat: state.matches("chat"),
    isProject: state.matches("project"),
  };
}

export function useNavigationActions() {
  const { send } = useNavigationContext();

  return {
    goChat: () => send({ type: "GO_CHAT" }),
    goProject: () => send({ type: "GO_PROJECT" }),
  };
}


