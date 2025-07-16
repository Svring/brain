"use client";

import { useMachine } from "@xstate/react";
import type { User } from "@/payload-types";
import { authenticateDev, authenticateProd } from "@/lib/app/auth/auth-utils";
import { authMachine } from "@/machines/auth-machine";
import { useMount } from "@reactuses/core";

interface UseAuthOptions {
  payloadUser?: User | null;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { payloadUser } = options;
  const [state, send] = useMachine(authMachine);

  useMount(() => {
    const isProduction = state.context.mode === "production";
    if (isProduction) {
      authenticateProd(send);
    } else {
      authenticateDev(payloadUser!, send);
    }
  });

  return {
    auth: state.context.auth,
    authenticating: state.matches("authenticating"),
  };
}
