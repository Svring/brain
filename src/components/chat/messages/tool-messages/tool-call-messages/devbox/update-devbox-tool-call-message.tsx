interface UpdateDevboxToolCallMessageProps {
  devbox_name: string;
  cpu?: 1 | 2 | 4 | 8 | 16;
  memory?: 1 | 2 | 4 | 8 | 16 | 32;
}

export function UpdateDevboxToolCallMessage({ devbox_name, cpu, memory }: UpdateDevboxToolCallMessageProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Devbox:</span>
          <span className="text-sm text-foreground font-mono">{devbox_name}</span>
        </div>
        {(cpu !== undefined || memory !== undefined) && (
          <div className="flex items-center gap-4">
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
          </div>
        )}
      </div>
    </div>
  );
}
