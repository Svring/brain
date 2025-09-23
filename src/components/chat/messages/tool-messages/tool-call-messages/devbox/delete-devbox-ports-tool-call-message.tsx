interface DeleteDevboxPortsToolCallMessageProps {
  devbox_name: string;
  ports: number[];
}

export function DeleteDevboxPortsToolCallMessage({ devbox_name, ports }: DeleteDevboxPortsToolCallMessageProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Devbox:</span>
          <span className="text-sm text-foreground font-mono">{devbox_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Ports:</span>
          <span className="text-sm text-foreground font-mono">[{ports.join(", ")}]</span>
        </div>
      </div>
    </div>
  );
}
