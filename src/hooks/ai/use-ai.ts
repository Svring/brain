"use client";

import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import { use } from "react";
import type { AIState } from "@/components/app/base/provider/ai-provider";
import { AuthContext } from "@/contexts/auth-context/auth-context";

export default function useAI() {
  const { user } = use(AuthContext);

  return useCoAgent<AIState>({
    name: "ai",
    initialState: {
      base_url: user?.baseUrl,
      api_key: user?.apiKey,
      model: "gpt-4o-mini",
      system_prompt: "you are sealos brain.",
    },
  });
}
