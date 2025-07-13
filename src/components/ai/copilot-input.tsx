import { InputProps } from "@copilotkit/react-ui";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { Send } from "lucide-react";

export function CopilotInput({ inProgress, onSend, isVisible }: InputProps) {
  const handleSubmit = (value: string) => {
    if (value.trim()) onSend(value);
  };

  return (
    <div className="flex gap-2 p-4 border-t bg-background">
      <Input
        disabled={inProgress}
        type="text"
        placeholder="Ask your question here..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit(e.currentTarget.value);
            e.currentTarget.value = "";
          }
        }}
      />
      <Button
        disabled={inProgress}
        onClick={(e) => {
          const input = e.currentTarget
            .previousElementSibling as HTMLInputElement;
          handleSubmit(input.value);
          input.value = "";
        }}
      >
        <Send size={16} />
      </Button>
    </div>
  );
}
