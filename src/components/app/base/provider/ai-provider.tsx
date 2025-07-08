import { CopilotKit } from "@copilotkit/react-core";

interface AIProviderProps {
  children: React.ReactNode;
}

export type AIState = Record<string, never>;

export function AIProvider({ children }: AIProviderProps) {
  return (
    <CopilotKit agent="ai" runtimeUrl="/api/ai">
      {children}
    </CopilotKit>
  );
}
