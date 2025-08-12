import { CopilotKit } from "@copilotkit/react-core";

export function CopilotProvider({
  children,
  agent,
}: {
  children: React.ReactNode;
  agent: string;
}) {
  return (
    <CopilotKit
      agent={agent}
      runtimeUrl="/api/copilot"
      publicApiKey={process.env.NEXT_PUBLIC_COPILOT_API_KEY}
    >
      {children}
    </CopilotKit>
  );
}
