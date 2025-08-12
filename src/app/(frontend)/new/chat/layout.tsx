import type { ReactNode } from "react";
import { CopilotProvider } from "@/components/provider/copilot-provider";

interface ChatLayoutProps {
  children: ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return <CopilotProvider agent="new_project">{children}</CopilotProvider>;
}
