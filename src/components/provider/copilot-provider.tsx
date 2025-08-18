import { CopilotKit } from "@copilotkit/react-core";

export function CopilotProvider({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKit
      agent="brain"
      runtimeUrl="/api/copilot"
      publicApiKey={process.env.NEXT_PUBLIC_COPILOT_API_KEY}
    >
      {children}
    </CopilotKit>
  );
}
