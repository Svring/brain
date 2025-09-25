interface CreateLaunchpadToolCallMessageProps {
  name: string;
  image: string;
  cpu?: number;
  memory?: number;
  replicas?: number;
  ports?: number[];
  env?: Array<[string, string]>;
}

export function CreateLaunchpadToolCallMessage({ 
  name, 
  image, 
  cpu, 
  memory, 
  replicas, 
  ports, 
  env 
}: CreateLaunchpadToolCallMessageProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Create Launchpad:</span>
          <span className="text-sm text-foreground font-mono">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Image:</span>
          <span className="text-sm text-foreground font-mono">{image}</span>
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
        {replicas !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Replicas:</span>
            <span className="text-sm text-foreground font-mono">{replicas}</span>
          </div>
        )}
        {ports && ports.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Ports:</span>
            <span className="text-sm text-foreground font-mono">{ports.join(", ")}</span>
          </div>
        )}
        {env && env.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Environment Variables:</span>
            <span className="text-sm text-foreground font-mono">{env.length} variables</span>
          </div>
        )}
      </div>
    </div>
  );
}
