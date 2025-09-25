interface CreateClusterToolCallMessageProps {
  name: string;
  type: string;
  cpu?: number;
  memory?: number;
  storage?: number;
  replicas?: number;
}

export function CreateClusterToolCallMessage({ 
  name, 
  type, 
  cpu, 
  memory, 
  storage, 
  replicas 
}: CreateClusterToolCallMessageProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Create Cluster:</span>
          <span className="text-sm text-foreground font-mono">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Type:</span>
          <span className="text-sm text-foreground font-mono">{type}</span>
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
        {storage !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Storage:</span>
            <span className="text-sm text-foreground font-mono">{storage} GB</span>
          </div>
        )}
        {replicas !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Replicas:</span>
            <span className="text-sm text-foreground font-mono">{replicas}</span>
          </div>
        )}
      </div>
    </div>
  );
}
