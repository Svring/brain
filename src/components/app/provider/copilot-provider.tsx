import { CopilotKit } from "@copilotkit/react-core";

export function CopilotProvider({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKit agent="ai" runtimeUrl="/api/ai">
      {children}
    </CopilotKit>
  );
}
