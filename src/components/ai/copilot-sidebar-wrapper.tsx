import dynamic from "next/dynamic";
import { CopilotButton } from "./components/copilot-button";
import { CopilotWindow } from "./components/copilot-window";
import { CopilotHeader } from "./components/copilot-header";
import { CopilotInput } from "./components/copilot-input";
import { CopilotMessages } from "./components/copilot-messages";

const CopilotSidebar = dynamic(() =>
  import("@copilotkit/react-ui").then((mod) => mod.CopilotSidebar)
);

export function CopilotSidebarWrapper() {
  return (
    <CopilotSidebar
      Button={CopilotButton}
      Window={CopilotWindow}
      Header={CopilotHeader}
      Input={CopilotInput}
      Messages={CopilotMessages}
    />
  );
}
