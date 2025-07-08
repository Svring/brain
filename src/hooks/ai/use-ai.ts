"use client";

import { useCoAgent } from "@copilotkit/react-core";
import { use } from "react";
import type { AIState } from "@/components/app/base/provider/ai-provider";
import { AuthContext } from "@/contexts/auth-context";

export function useAI() {
  const { user } = use(AuthContext);

  useCoAgent<AIState>({
    name: "ai",
    config: {
      configurable: {
        base_url: user?.baseUrl,
        api_key: user?.apiKey,
        system_prompt: "ask me who I am",
      },
      recursion_limit: 50,
    },
  });
}
