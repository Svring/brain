import { InputProps } from "@copilotkit/react-ui";
import { PromptInputBox } from "./ai-prompt-box";

export function CopilotInput({ inProgress, onSend, isVisible }: InputProps) {
  return (
    <div className="p-2 bg-background">
      <PromptInputBox
        isLoading={inProgress}
        onSend={(message) => {
          if (message && message.trim()) onSend(message);
        }}
        placeholder="Ask your question here..."
        autoFocus={isVisible}
      />
    </div>
  );
}
