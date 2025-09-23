interface UpdateClusterToolCallMessageProps {
  cluster_name: string;
  cpu?: 1 | 2 | 4 | 8;
  memory?: 1 | 2 | 4 | 8 | 16 | 32;
  replicas?: number;
  storage?: number;
}

export function UpdateClusterToolCallMessage({
  cluster_name,
  cpu,
  memory,
  replicas,
  storage,
}: UpdateClusterToolCallMessageProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Cluster:
          </span>
          <span className="text-sm text-foreground font-mono">
            {cluster_name}
          </span>
        </div>
        {(cpu !== undefined || memory !== undefined) && (
          <div className="flex items-center gap-4">
            {cpu !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  CPU:
                </span>
                <span className="text-sm text-foreground font-mono">
                  {cpu} cores
                </span>
              </div>
            )}
            {memory !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Memory:
                </span>
                <span className="text-sm text-foreground font-mono">
                  {memory} GB
                </span>
              </div>
            )}
          </div>
        )}
        {(replicas !== undefined || storage !== undefined) && (
          <div className="flex items-center gap-4">
            {replicas !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Replicas:
                </span>
                <span className="text-sm text-foreground font-mono">
                  {replicas}
                </span>
              </div>
            )}
            {storage !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Storage:
                </span>
                <span className="text-sm text-foreground font-mono">
                  {storage} GB
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
