import { useCoAgent } from "@copilotkit/react-core";

export function useAI() {
  useCoAgent({
    name: "ai",
    config: {
      configurable: {
        base_url: process.env.SEALOS_BASE_URL,
        api_key: process.env.SEALOS_API_KEY,
        system_prompt: "ask me who I am",
      },
      recursion_limit: 50,
    },
  });
}
