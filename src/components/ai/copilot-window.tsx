import { WindowProps, useChatContext } from "@copilotkit/react-ui";

export function CopilotWindow({ children }: WindowProps) {
  const { open, setOpen } = useChatContext();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={() => setOpen(false)}>
      <div
        className="fixed bottom-24 right-8 bg-background rounded-lg shadow-xl w-96 h-[80vh] overflow-auto border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">{children}</div>
      </div>
    </div>
  );
}
