import { CopilotKit } from "@copilotkit/react-core";

interface AIProviderProps {
  children: React.ReactNode;
}

export function AIProvider({ children }: AIProviderProps) {
  return (
    <CopilotKit agent="ai" runtimeUrl="/api/ai">
      {children}
    </CopilotKit>
  );
}
