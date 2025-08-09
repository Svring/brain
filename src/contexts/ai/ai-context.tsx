"use client";

import { useMount } from "@reactuses/core";
import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, use } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { aiMachine, type AiState } from "./ai-machine";
import { getAiCredentialsDev, getAiCredentialsProd } from "@/lib/ai/ai-utils";
import { useAuthState } from "@/contexts/auth/auth-context";
import type { User } from "@/payload-types";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { randomId } from "@copilotkit/shared";

// const inspector = createBrowserInspector();

interface AiContextValue {
  state: StateFrom<typeof aiMachine>;
  send: (event: EventFrom<typeof aiMachine>) => void;
  actorRef: ActorRefFrom<typeof aiMachine>;
  aiState: AiState;
}

const AiContext = createContext<AiContextValue | undefined>(undefined);

export const AiProvider = ({
  children,
  payloadUser,
}: {
  children: ReactNode;
  payloadUser?: User | null;
}) => {
  const [state, send, actorRef] = useMachine(aiMachine, {
    // inspect: inspector.inspect,
  });

  const { auth, mode } = useAuthState();

  const setCredentials = (credentials: { baseUrl: string; apiKey: string }) => {
    // Use SET_STATE event to update the machine context properly
    send({
      type: "SET_STATE",
      state: {
        base_url: credentials.baseUrl,
        api_key: credentials.apiKey,
      },
    });

    send({ type: "CREDENTIALS_LOADED" });
  };

  useMount(async () => {
    try {
      const isProduction = mode === "production";

      if (isProduction && auth) {
        const credentials = await getAiCredentialsProd(auth);
        setCredentials(credentials);
      } else if (!isProduction && payloadUser) {
        const credentials = getAiCredentialsDev(payloadUser);
        setCredentials(credentials);
      } else {
        send({ type: "FAIL", error: "Unable to get AI credentials" });
      }
    } catch (error) {
      send({
        type: "FAIL",
        error: error instanceof Error ? error.message : "Unknown AI error",
      });
    }
  });

  if (state.matches("initializing")) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Initializing AI...</div>
      </div>
    );
  }

  if (state.matches("error")) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-destructive">AI Error: {state.context.error}</div>
      </div>
    );
  }

  return (
    <AiContext.Provider
      value={{
        state,
        send,
        actorRef,
        aiState: state.context.state,
      }}
    >
      {children}
    </AiContext.Provider>
  );
};

export function useAiContext() {
  const ctx = use(AiContext);
  if (!ctx) {
    throw new Error("useAiContext must be used within AiProvider");
  }
  return ctx;
}

export function useAiState() {
  const { state } = useAiContext();
  return {
    aiState: state.context.state,
    chat: state.context.chat,
    floatingChat: state.context.floatingChat,
    error: state.context.error,
    isInitializing: state.matches("initializing"),
    isActive: state.matches("active"),
    isError: state.matches("error"),
  };
}

export function useAiActions() {
  const { send } = useAiContext();
  const { messages, setMessages } = useCopilotChatHeadless_c();

  return {
    openChat: (initialMessage?: string) => {
      send({ type: "CHAT_OPEN" });
      if (initialMessage) {
        setMessages([
          ...messages,
          { id: randomId(), role: "user", content: initialMessage },
        ]);
      }
    },
    setThreadId: (threadId: string) =>
      send({ type: "FLOATING_CHAT_SET_THREAD_ID", threadId }),
    setAssistantId: (assistantId: string) =>
      send({ type: "FLOATING_CHAT_SET_ASSISTANT_ID", assistantId }),
    closeChat: () => send({ type: "CHAT_CLOSE" }),
    openFloatingChat: () => send({ type: "FLOATING_CHAT_OPEN" }),
    closeFloatingChat: () => send({ type: "FLOATING_CHAT_CLOSE" }),
    setState: (state: Partial<AiState>) => send({ type: "SET_STATE", state }),
    credentialsLoaded: () => send({ type: "CREDENTIALS_LOADED" }),
    fail: (error: string) => send({ type: "FAIL", error }),
  };
}
