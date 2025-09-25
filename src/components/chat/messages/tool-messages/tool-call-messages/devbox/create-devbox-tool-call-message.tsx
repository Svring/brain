interface CreateDevboxToolCallMessageProps {
  name: string;
  runtime: string;
  cpu?: number;
  memory?: number;
  ports?: number[];
}

export function CreateDevboxToolCallMessage({ 
  name, 
  runtime, 
  cpu, 
  memory, 
  ports 
}: CreateDevboxToolCallMessageProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Create Devbox:</span>
          <span className="text-sm text-foreground font-mono">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Runtime:</span>
          <span className="text-sm text-foreground font-mono">{runtime}</span>
        </div>
        {cpu !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">CPU:</span>
            <span className="text-sm text-foreground font-mono">{cpu} cores</span>
          </div>
        )}
        {memory !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Memory:</span>
            <span className="text-sm text-foreground font-mono">{memory} GB</span>
          </div>
        )}
        {ports && ports.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Ports:</span>
            <span className="text-sm text-foreground font-mono">{ports.join(", ")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
