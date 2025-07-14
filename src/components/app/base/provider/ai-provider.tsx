import { CopilotKit } from "@copilotkit/react-core";

interface AIProviderProps {
  children: React.ReactNode;
}

export type AIState = {
  base_url: string;
  api_key: string;
  model: string;
  system_prompt: string;
  project_context: {
    projects: string[];
    projectName: string | null;
    activeNode: any;
  };
};

export function AIProvider({ children }: AIProviderProps) {
  return (
    <CopilotKit agent="ai" runtimeUrl="/api/ai">
      {children}
    </CopilotKit>
  );
}
